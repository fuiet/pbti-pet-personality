const cloud = require("wx-server-sdk");
const https = require("node:https");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const assets = db.collection("pbti_portrait_assets");

function requestJson(url, options = {}, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          try {
            resolve({ statusCode: res.statusCode, headers: res.headers, body: text ? JSON.parse(text) : {} });
          } catch (error) {
            resolve({ statusCode: res.statusCode, headers: res.headers, body: text });
          }
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(10000, () => req.destroy(new Error("Request timeout")));
    if (body) req.write(body);
    req.end();
  });
}

function buildPrompt(payload = {}) {
  const template = payload.templateName || "宠物写真";
  const promptText = (payload.promptText || "").trim();
  return [
    "一张高质量宠物写真海报，主体清晰，毛发细节丰富，构图干净，适合社交媒体转发。",
    `风格参考：${template}。`,
    promptText ? `用户补充提示：${promptText}` : "",
    "要求：画面真实自然，背景统一，光影柔和，突出宠物表情和质感。",
  ]
    .filter(Boolean)
    .join(" ");
}

async function toTempUrls(fileIDs) {
  const result = await cloud.getTempFileURL({ fileList: fileIDs });
  return (result.fileList || [])
    .filter((item) => item.status === 0 && item.tempFileURL)
    .map((item) => item.tempFileURL);
}

async function createTask(apiKey, workspaceId, prompt, imageUrls) {
  const baseUrl = `https://${workspaceId}.cn-beijing.maas.aliyuncs.com/api/v1/services/aigc/image-generation/generation`;
  const content = imageUrls.map((url) => ({ image: url }));
  content.push({ text: prompt });

  const reqBody = JSON.stringify({
    model: "wan2.6-image",
    input: {
      messages: [
        {
          role: "user",
          content,
        },
      ],
    },
    parameters: {
      size: "1K",
      n: 1,
      watermark: false,
      prompt_extend: false,
      enable_interleave: false,
    },
  });

  const res = await requestJson(
    baseUrl,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-DashScope-Async": "enable",
      },
    },
    reqBody
  );

  if (res.statusCode >= 400) {
    throw new Error(res.body?.message || `Generation request failed: ${res.statusCode}`);
  }

  const taskId = res.body?.output?.task_id || res.body?.task_id || res.body?.data?.task_id;
  if (!taskId) {
    throw new Error("Missing task_id from generation response");
  }

  return taskId;
}

async function getTaskResult(apiKey, workspaceId, taskId) {
  const taskUrl = `https://${workspaceId}.cn-beijing.maas.aliyuncs.com/api/v1/tasks/${taskId}`;
  const res = await requestJson(taskUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-DashScope-Async": "enable",
    },
  });

  if (res.statusCode >= 400) {
    const message = res.body?.message || `Task query failed: ${res.statusCode}`;
    const transient = res.statusCode === 404 || res.statusCode >= 500;
    if (transient) {
      return { status: "PENDING", imageUrl: "", transientError: true, message };
    }
    throw new Error(message);
  }

  const output = res.body?.output || {};
  const status = output.task_status || res.body?.status || output.status || "PENDING";
  const imageUrl =
    output?.results?.[0]?.url ||
    output?.result_url ||
    output?.output?.image_url ||
    output?.images?.[0]?.url ||
    "";

  return { status, imageUrl, raw: output };
}

async function saveAssetIfNeeded(userId, taskId, payload, imageUrl) {
  const existed = await assets.where({ userId, taskId }).get().catch(() => null);
  if (existed?.data?.length) return existed.data[0];

  const record = {
    userId,
    taskId,
    templateName: payload?.templateName || "宠物写真",
    promptText: payload?.promptText || "",
    imageUrl,
    status: "SUCCEEDED",
    createdAt: db.serverDate(),
    updatedAt: db.serverDate(),
  };

  const saved = await assets.add({ data: record });
  return { _id: saved._id, ...record };
}

exports.main = async (event) => {
  const action = event?.action;
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const workspaceId = process.env.DASHSCOPE_WORKSPACE_ID;
  const wxContext = cloud.getWXContext();
  const userId = wxContext.OPENID;

  if (!apiKey || !workspaceId) {
    throw new Error("Missing DASHSCOPE_API_KEY or DASHSCOPE_WORKSPACE_ID");
  }

  if (action === "generate") {
    const prompt = buildPrompt(event.payload);
    const fileIDs = (event.payload?.photoSlots || []).map((slot) => slot.fileId).filter(Boolean);
    if (!fileIDs.length) {
      throw new Error("Missing photo file IDs");
    }
    const imageUrls = await toTempUrls(fileIDs);
    if (!imageUrls.length) {
      throw new Error("Failed to resolve temporary URLs");
    }
    const taskId = await createTask(apiKey, workspaceId, prompt, imageUrls);
    return { ok: true, taskId, prompt, status: "PENDING" };
  }

  if (action === "status") {
    const taskId = event.taskId;
    if (!taskId) {
      throw new Error("Missing taskId");
    }

    try {
      const result = await getTaskResult(apiKey, workspaceId, taskId);
      if ((result.status === "SUCCEEDED" || result.status === "SUCCESS") && result.imageUrl) {
        await saveAssetIfNeeded(userId, taskId, event.payload || {}, result.imageUrl);
      }
      return {
        ok: true,
        taskId,
        status: result.status,
        imageUrl: result.imageUrl || "",
        transientError: Boolean(result.transientError),
        raw: result.raw,
      };
    } catch (error) {
      return {
        ok: true,
        taskId,
        status: "PENDING",
        imageUrl: "",
        transientError: true,
        message: error?.message || "Status query failed",
      };
    }
  }

  if (action === "listMine") {
    const res = await assets.where({ userId }).orderBy("createdAt", "desc").get();
    return {
      ok: true,
      assets: res.data || [],
    };
  }

  throw new Error(`Unsupported action: ${action}`);
};

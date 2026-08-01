const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const userId = wxContext.OPENID;
  const action = event?.action;
  const collection = db.collection("pbti_files");

  if (action === "save") {
    const payload = event.payload || {};
    const data = {
      userId,
      kind: payload.kind || "test-photo",
      fileId: payload.fileId || "",
      cloudPath: payload.cloudPath || "",
      testId: payload.testId || "",
      createdAt: db.serverDate(),
    };

    const saved = await collection.add({ data });
    return {
      ok: true,
      file: {
        _id: saved._id,
        ...data,
      },
    };
  }

  if (action === "list") {
    const res = await collection
      .where({ userId })
      .orderBy("createdAt", "desc")
      .get();

    return {
      ok: true,
      files: res.data || [],
    };
  }

  if (action === "delete") {
    const fileId = event.fileId;
    if (!fileId) {
      throw new Error("Missing fileId");
    }

    await collection.doc(fileId).remove();
    return { ok: true };
  }

  throw new Error(`Unsupported action: ${action}`);
};

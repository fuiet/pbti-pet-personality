import { NextResponse } from "next/server";

export const runtime = "edge";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    if (!code) {
      return NextResponse.json({ error: "缺少 code 参数。" }, { status: 400 });
    }

    const appId = process.env.WECHAT_APP_ID || process.env.WX_APP_ID || "";
    const appSecret = process.env.WECHAT_APP_SECRET || process.env.WX_APP_SECRET || "";
    const devMappedUserId = process.env.MINIPROGRAM_DEV_USER_ID || "";

    if (!appId || !appSecret) {
      const mockOpenId = `mock_${(await sha256(code)).slice(0, 24)}`;
      return NextResponse.json({
        ok: true,
        mock: true,
        user: {
          id: `wechat_${mockOpenId}`,
          openidHash: sha256(mockOpenId),
          nickname: "微信用户",
          mappedUserId: devMappedUserId,
        },
        session: {
          token: `mock_session_${randomUUID()}`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        message: "当前未配置微信服务端参数，已自动切换为本地演示会话。",
      });
    }

    const url = new URL("https://api.weixin.qq.com/sns/jscode2session");
    url.searchParams.set("appid", appId);
    url.searchParams.set("secret", appSecret);
    url.searchParams.set("js_code", code);
    url.searchParams.set("grant_type", "authorization_code");

    const wechatResponse = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });
    const data: any = await wechatResponse.json();

    if (!wechatResponse.ok || data?.errcode || !data?.openid) {
      return NextResponse.json({
        error: data?.errmsg || "微信 code2Session 交换失败。",
        detail: data?.errcode || null,
      }, { status: 502 });
    }

    const openid = String(data.openid);
    const unionid = data.unionid ? String(data.unionid) : "";
    const sessionSeed = `${openid}:${data.session_key || ""}:${Date.now()}:${randomUUID()}`;

    return NextResponse.json({
      ok: true,
      mock: false,
      user: {
        id: `wechat_${sha256(openid).slice(0, 24)}`,
        openidHash: sha256(openid),
        unionidHash: unionid ? sha256(unionid) : "",
        nickname: "微信用户",
        mappedUserId: devMappedUserId,
      },
      session: {
        token: `wechat_session_${sha256(sessionSeed)}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      message: "微信会话初始化成功。",
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "初始化微信会话失败。",
    }, { status: 500 });
  }
}

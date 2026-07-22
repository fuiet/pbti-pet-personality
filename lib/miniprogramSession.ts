import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface MiniProgramSession {
  rawToken: string;
  mode: "mock" | "wechat";
  userIdHint: string;
}

export interface MiniProgramResolvedIdentity {
  source: "mini-program-dev-map";
  userId: string;
  session: MiniProgramSession;
}

function normalizeToken(value: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function readMiniProgramSession(request: Request): MiniProgramSession | null {
  const token = normalizeToken(request.headers.get("X-PBTI-Session"));
  if (!token) return null;

  if (token.startsWith("mock_session_")) {
    return {
      rawToken: token,
      mode: "mock",
      userIdHint: token.slice("mock_session_".length, "mock_session_".length + 24) || "mock",
    };
  }

  if (token.startsWith("wechat_session_")) {
    return {
      rawToken: token,
      mode: "wechat",
      userIdHint: token.slice("wechat_session_".length, "wechat_session_".length + 24) || "wechat",
    };
  }

  return {
    rawToken: token,
    mode: "mock",
    userIdHint: "unknown",
  };
}

export function resolveMiniProgramIdentity(request: Request): MiniProgramResolvedIdentity | null {
  const session = readMiniProgramSession(request);
  if (!session) return null;

  const mappedUserId = process.env.MINIPROGRAM_DEV_USER_ID || "";
  if (!mappedUserId) return null;

  return {
    source: "mini-program-dev-map",
    userId: mappedUserId,
    session,
  };
}

export function buildMiniProgramAuthError() {
  return {
    error: "已识别到小程序会话，但暂时还没有完成与网站正式用户的绑定。",
    nextStep: "请先完成微信会话到业务用户的映射，再把上传、识别、写真接口完全切换到小程序鉴权。",
    devHint: "如果现在只是本地联调，可以先在服务端配置 MINIPROGRAM_DEV_USER_ID 跑通整条链路。",
  };
}

export async function resolveRequestUserId(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: userResult, error: userError } = await supabase.auth.getUser();
  const user = userResult.user;

  if (!userError && user?.id) {
    return {
      supabase,
      userId: user.id,
      mode: "supabase" as const,
      miniProgramSession: null,
    };
  }

  const miniProgramIdentity = resolveMiniProgramIdentity(request);
  if (miniProgramIdentity) {
    return {
      supabase,
      userId: miniProgramIdentity.userId,
      mode: miniProgramIdentity.source,
      miniProgramSession: miniProgramIdentity.session,
    };
  }

  return {
    supabase,
    userId: "",
    mode: "anonymous" as const,
    miniProgramSession: readMiniProgramSession(request),
  };
}

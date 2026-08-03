import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ApiRequestLogInsert = {
  route: string;
  method: string;
  status: number;
  duration_ms: number;
  request_bytes: number | null;
  response_bytes: number | null;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  error_message: string | null;
};

type ApiTrackerOptions = {
  request: Request;
  route: string;
};

const MAX_TEXT_LENGTH = 500;

let cachedMetricsClient: ReturnType<typeof createClient> | null = null;

function normalizeText(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, MAX_TEXT_LENGTH) : null;
}

function safeByteLength(value: unknown) {
  if (typeof value === "string") return new TextEncoder().encode(value).length;
  if (value instanceof ArrayBuffer) return value.byteLength;
  if (ArrayBuffer.isView(value)) return value.byteLength;
  if (value === null || value === undefined) return null;

  try {
    return new TextEncoder().encode(JSON.stringify(value)).length;
  } catch {
    return null;
  }
}

function parseContentLength(value: string | null) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getMetricsClient() {
  if (cachedMetricsClient) return cachedMetricsClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  cachedMetricsClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedMetricsClient;
}

async function insertApiLog(payload: ApiRequestLogInsert) {
  const client = getMetricsClient();
  if (!client) return;

  try {
    await (client.from("api_request_logs") as any).insert(payload);
  } catch (error) {
    console.error("Failed to insert API request log", error);
  }
}

export function createApiRequestTracker({ request, route }: ApiTrackerOptions) {
  const startedAt = Date.now();
  const requestBytes = parseContentLength(request.headers.get("content-length"));
  let responseBytes: number | null = null;
  let status = 500;
  let userId: string | null = null;
  let errorMessage: string | null = null;

  const ipAddress = normalizeText(
    request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]
    || null
  );
  const userAgent = normalizeText(request.headers.get("user-agent"));

  return {
    setUserId(nextUserId: string | null | undefined) {
      userId = nextUserId || null;
    },

    setError(message: string | null | undefined) {
      errorMessage = normalizeText(message);
    },

    json(body: unknown, init?: ResponseInit) {
      status = init?.status ?? 200;
      responseBytes = safeByteLength(body);
      return NextResponse.json(body, init);
    },

    response(body: BodyInit | null | undefined, init?: ResponseInit) {
      status = init?.status ?? 200;
      responseBytes = safeByteLength(body);
      return new NextResponse(body, init);
    },

    async flush() {
      await insertApiLog({
        route,
        method: request.method,
        status,
        duration_ms: Math.max(0, Date.now() - startedAt),
        request_bytes: requestBytes,
        response_bytes: responseBytes,
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        error_message: errorMessage,
      });
    },
  };
}

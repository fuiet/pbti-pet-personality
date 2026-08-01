import { NextResponse } from "next/server";

export const runtime = "edge";

const MAX_IMAGE_BYTES = 20_000_000;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function isAllowedImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (
      url.hostname.endsWith(".supabase.co") ||
      url.hostname.endsWith(".aliyuncs.com")
    );
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const value = requestUrl.searchParams.get("url");
  if (!value || !isAllowedImageUrl(value)) {
    return NextResponse.json({ error: "Unsupported portrait source." }, { status: 400 });
  }

  try {
    const response = await fetch(value, {
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Portrait source could not be loaded." }, { status: 502 });
    }

    const contentType = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (!ALLOWED_IMAGE_TYPES.has(contentType) || declaredLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Portrait source returned an unsupported file." }, { status: 502 });
    }

    const bytes = await response.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Portrait source returned an invalid file." }, { status: 502 });
    }

    const headers: Record<string, string> = {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": contentType,
      "Content-Length": String(bytes.byteLength),
      "X-Content-Type-Options": "nosniff",
    };
    if (requestUrl.searchParams.get("download") === "1") {
      const filename = (requestUrl.searchParams.get("filename") || "portrait-original-2K")
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .slice(0, 100) || "portrait-original-2K";
      headers["Content-Disposition"] = `attachment; filename="${filename}"`;
    }

    return new NextResponse(bytes, { headers });
  } catch {
    return NextResponse.json({ error: "Portrait source could not be loaded." }, { status: 502 });
  }
}

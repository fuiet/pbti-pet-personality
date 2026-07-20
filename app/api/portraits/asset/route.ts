import { NextResponse } from "next/server";

export const runtime = "edge";

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

  const response = await fetch(value);
  if (!response.ok || !response.body) {
    return NextResponse.json({ error: "Portrait source could not be loaded." }, { status: 502 });
  }

  const headers: Record<string, string> = {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": response.headers.get("content-type") || "image/png",
      "Access-Control-Allow-Origin": "*",
  };
  const contentLength = response.headers.get("content-length");
  if (contentLength) headers["Content-Length"] = contentLength;
  if (requestUrl.searchParams.get("download") === "1") {
    const filename = (requestUrl.searchParams.get("filename") || "portrait-original-2K")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .slice(0, 100);
    headers["Content-Disposition"] = `attachment; filename="${filename}"`;
  }

  return new NextResponse(response.body, {
    headers,
  });
}

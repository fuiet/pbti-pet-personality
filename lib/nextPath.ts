export function normalizeNextPath(nextPath: string | null | undefined, fallback = "/dashboard") {
  if (!nextPath) {
    return fallback;
  }

  const trimmed = nextPath.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return fallback;
  }

  try {
    const safeOrigin = "https://pbti.local";
    const parsed = new URL(trimmed, safeOrigin);
    if (parsed.origin !== safeOrigin) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

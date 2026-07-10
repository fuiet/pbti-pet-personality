export function normalizeNextPath(nextPath: string | null | undefined, fallback = "/dashboard") {
  if (!nextPath) {
    return fallback;
  }

  const trimmed = nextPath.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  return trimmed;
}
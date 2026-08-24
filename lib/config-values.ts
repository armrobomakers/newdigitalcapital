const PLACEHOLDER_PATTERNS = [
  /^TODO(?:[_:\s-]|$)/i,
  /^TBD(?:[_:\s-]|$)/i,
  /^PLACEHOLDER(?:[_:\s-]|$)/i,
  /^REPLACE_ME(?:[_:\s-]|$)/i,
  /^CHANGE_ME(?:[_:\s-]|$)/i,
  /^\[.+\]$/,
  /^<.+>$/,
];

const PLACEHOLDER_HOST_TOKENS = ["todo", "tbd", "placeholder", "replace-me", "replace_me", "changeme", "change-me"];

export function isPlaceholderValue(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    return false;
  }

  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function isResolvedConfigValue(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return Boolean(normalized) && !isPlaceholderValue(normalized);
}

function isPlaceholderHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  return PLACEHOLDER_HOST_TOKENS.some((token) => normalized.includes(token));
}

export function isSecureWebhookUrl(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  if (!isResolvedConfigValue(normalized)) {
    return false;
  }

  try {
    const url = new URL(normalized);
    const hostname = url.hostname.toLowerCase();
    const localDevelopmentHost =
      hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

    if (!hostname || isPlaceholderHostname(hostname)) {
      return false;
    }

    return url.protocol === "https:" || (url.protocol === "http:" && localDevelopmentHost);
  } catch {
    return false;
  }
}

export function isBrandedPublicUrl(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  if (!isResolvedConfigValue(normalized)) {
    return false;
  }

  try {
    const url = new URL(normalized);
    const hostname = url.hostname.toLowerCase();

    return (
      url.protocol === "https:" &&
      hostname !== "localhost" &&
      hostname !== "127.0.0.1" &&
      hostname !== "::1" &&
      !hostname.endsWith(".vercel.app") &&
      !isPlaceholderHostname(hostname)
    );
  } catch {
    return false;
  }
}

export function normalizeAbsoluteUrl(value: string | undefined, fallback: string) {
  const rawUrl = (value || fallback).trim().replace(/\/+$/, "");

  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  return `https://${rawUrl.replace(/^\/+/, "")}`;
}

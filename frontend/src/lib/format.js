// Display helpers.

/** 252138706 → "252 MB", 2.1e9 → "2.1 GB" */
export function formatBytes(bytes) {
  if (bytes == null) return "";
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${Math.round(bytes / 1e6)} MB`;
  return `${Math.max(1, Math.round(bytes / 1e3))} KB`;
}

/** 16085 (MB) → "16 GB" */
export const formatRam = (mb) => `${Math.round(mb / 1024)} GB`;

/** 95 → "1 min 35 s" */
export function formatDuration(seconds) {
  if (seconds == null || !Number.isFinite(seconds)) return "";
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} s`;
  return `${Math.floor(s / 60)} min ${s % 60} s`;
}

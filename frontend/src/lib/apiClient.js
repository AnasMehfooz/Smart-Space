// fetch wrapper for the backend: base URL + token from Rust, errors as ApiError.
import { getBackendInfo } from "./tauri";

/** Every backend error is {"error": {code, message, details}}. Switch on `code`, never on `message`. */
export class ApiError extends Error {
  constructor(code, message, details = {}, status = 0) {
    super(message);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

let infoPromise = null;

/** @returns {Promise<{base: string, token: string}>} */
export async function backend() {
  infoPromise ??= getBackendInfo();
  const { port, token } = await infoPromise;
  return { base: `http://127.0.0.1:${port}/api/v1`, token };
}

async function toApiError(res) {
  try {
    const body = await res.json();
    if (body?.error) return new ApiError(body.error.code, body.error.message, body.error.details, res.status);
  } catch {
    /* not JSON */
  }
  return new ApiError("HTTP_" + res.status, res.statusText || "Request failed", {}, res.status);
}

/**
 * @param {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} method
 * @param {string} path e.g. "/models/catalog"
 * @param {object} [body]
 * @param {{signal?: AbortSignal}} [opts]
 */
export async function request(method, path, body, { signal } = {}) {
  const { base, token } = await backend();
  let res;
  try {
    res = await fetch(base + path, {
      method,
      signal,
      headers: { Authorization: `Bearer ${token}`, ...(body !== undefined && { "Content-Type": "application/json" }) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new ApiError("BACKEND_UNREACHABLE", "Cannot reach the Smart Space backend");
  }
  if (!res.ok) throw await toApiError(res);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  get: (path, opts) => request("GET", path, undefined, opts),
  post: (path, body, opts) => request("POST", path, body, opts),
  put: (path, body, opts) => request("PUT", path, body, opts),
  del: (path, opts) => request("DELETE", path, undefined, opts),
};

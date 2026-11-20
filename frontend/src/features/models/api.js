import { api } from "@/lib/apiClient";

/** [{id, role, display_name, size_bytes, status, is_active, recommended, fits_hardware, download, ...}] */
export const getCatalog = (opts) => api.get("/models/catalog", opts);

/** {tier, ctx_cap, recommended: {embedding, llm, ocr}, alternatives, warnings} */
export const getRecommendations = (opts) => api.get("/models/recommendations", opts);

/** 202 {download_id}; progress arrives on /models/downloads/events */
export const downloadModel = (id) => api.post(`/models/${encodeURIComponent(id)}/download`);

/** {state: stopped/starting/ready/error, model_id, ctx, gpu_layers, backend, device, vram_used_mb, error} */
export const getLlmStatus = (opts) => api.get("/models/llm/status", opts);

export const cancelDownload = (id) => api.post(`/models/${encodeURIComponent(id)}/cancel`);

/** Deletes a downloaded model that is not in use (409 MODEL_ACTIVE for the active one). */
export const deleteModel = (id) => api.del(`/models/${encodeURIComponent(id)}`);

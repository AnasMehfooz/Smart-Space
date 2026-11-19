import { api } from "@/lib/apiClient";

/** [{id, role, display_name, size_bytes, status, is_active, recommended, fits_hardware, download, ...}] */
export const getCatalog = (opts) => api.get("/models/catalog", opts);

/** {tier, ctx_cap, recommended: {embedding, llm, ocr}, alternatives, warnings} */
export const getRecommendations = (opts) => api.get("/models/recommendations", opts);

/** 202 {download_id}; progress arrives on /models/downloads/events */
export const downloadModel = (id) => api.post(`/models/${encodeURIComponent(id)}/download`);

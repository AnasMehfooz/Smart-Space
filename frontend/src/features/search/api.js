import { api } from "@/lib/apiClient";

/** Every filter is always sent (null / [] when unused), so adding filter UI later needs no API change. */
export const EMPTY_FILTERS = { ext: [], kind: null, folder: null, tags: [], doc_type: null, date_from: null, date_to: null };

/**
 * Hybrid search over the file text and the AI summaries.
 * → {query, took_ms, results: [{file_id, rel_path, name, ext, kind, score, summary, doc_type, tags, snippet: {text, page}}]}
 */
export const search = (query, filters = EMPTY_FILTERS, limit = 20, opts) =>
  api.post("/search", { query, mode: "full", filters: { ...EMPTY_FILTERS, ...filters }, limit }, opts);

/**
 * Quick search for the widget: at most 6 files, fast.
 * → {results: [{file_id, rel_path, name, ext, kind, score, snippet: {text, page} | null}]}
 */
export const quickSearch = (query, opts) =>
  api.post("/search", { query, mode: "quick", filters: EMPTY_FILTERS, limit: 6 }, opts);

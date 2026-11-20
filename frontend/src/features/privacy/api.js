import { api } from "@/lib/apiClient";

/**
 * What Smart Space keeps on this PC:
 * {workspace_root, files_total, files_indexed, chunks, vectors, summaries, tags, chat_sessions, chat_messages,
 *  db_size_bytes, vectors_size_bytes, models_size_bytes, logs_size_bytes, data_dir, last_purge_at}
 */
export const getPrivacyOverview = (opts) => api.get("/privacy/overview", opts);

/** Past deletions: {items: [{id, scope, target, items_deleted, bytes_freed, performed_at}], total} */
export const getPrivacyAudit = (opts) => api.get("/privacy/audit?limit=20", opts);

/** Deletes Smart Space's own data. scope: "index" | "chats" | "models" | "everything". Never touches the user's files. */
export const purge = (scope) => api.post("/privacy/purge", { scope, confirm: true });

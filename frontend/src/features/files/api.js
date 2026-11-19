import { api } from "@/lib/apiClient";

/**
 * Paginated file list: {items: [{id, rel_path, name, ext, kind, size_bytes, mtime, status, skip_reason,
 * error_message, summary_state, doc_type, tags, summary_short}], total, limit, offset}
 * folder: relative folder ("Housing"); includes its subfolders.
 */
export function listFiles({ folder = null, limit = 100, offset = 0, sort = "name", order = "asc" } = {}, opts) {
  const q = new URLSearchParams({ limit, offset, sort, order });
  if (folder) q.set("folder", folder);
  return api.get(`/files?${q}`, opts);
}

/** Direct children of a folder: dirs {name, rel_path, type:"dir", file_count, indexed_count, child_count}
 *  then files {name, rel_path, type:"file", file_id, status, skip_reason}. parent "" = the root. */
export function getTree(parent = "", opts) {
  const q = parent ? `?${new URLSearchParams({ parent })}` : "";
  return api.get(`/files/tree${q}`, opts);
}

/** Detail incl. abs_path (needed to open the file). */
export const getFile = (id, opts) => api.get(`/files/${id}`, opts);

/** Forget everything learned about this file; scanning keeps ignoring it (status skipped/excluded). */
export const removeFromIndex = (id) => api.del(`/files/${id}/index`);

/** Read the file again (also brings back a removed file). */
export const reindexFile = (id) => api.post(`/files/${id}/reindex`);

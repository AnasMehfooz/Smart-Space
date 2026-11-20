import { api } from "@/lib/apiClient";

/** null, or {root_path, status, created_at, last_scan_at, exists, counts: {files, indexed, pending, skipped, errors}} */
export const getWorkspace = (opts) => api.get("/workspace", opts);

/** Sets the folder. 409 WORKSPACE_EXISTS for a different folder unless replace is true (that deletes the old index). */
export const setWorkspace = (rootPath, replace = false) => api.put("/workspace", { root_path: rootPath, replace });

/** Forgets the folder and deletes its whole index (the user's files are untouched). */
export const deleteWorkspace = () => api.del("/workspace");

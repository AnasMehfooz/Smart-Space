import { api } from "@/lib/apiClient";

/** 202; scans the folder and queues every new or changed file */
export const startIndexing = () => api.post("/index/start");

/** {state: idle/scanning/indexing/paused, total, indexed, pending, processing, skipped, errors, summaries_done, ...} */
export const getIndexStatus = (opts) => api.get("/index/status", opts);

/** Stops reading files (the file being read finishes). Returns the new status. */
export const pauseIndexing = () => api.post("/index/pause");

/** Continues where it stopped. Returns the new status. */
export const resumeIndexing = () => api.post("/index/resume");

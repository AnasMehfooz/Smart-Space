import { api } from "@/lib/apiClient";

/** {status, ready, version, db_ok, llm_state} — no token needed, but sending it is harmless */
export const getHealth = (opts) => api.get("/health", opts);

/** {tier, cpu_name, ram_total_mb, gpus: [{name, vendor, vram_mb, usable, integrated, ...}], battery, ...} */
export const getHardware = (opts) => api.get("/system/hardware", opts);

/** Runs a fresh hardware scan, then returns the new profile. */
export async function scanHardware(opts) {
  await api.post("/system/hardware/scan", undefined, opts);
  return getHardware(opts);
}

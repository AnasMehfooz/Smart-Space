import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { getAutostart, getQuickShortcut, inTauri, onAppEvent, setAutostart } from "@/lib/tauri";

/** "Start with Windows": the current state (kept in sync with the tray menu) and a setter. */
export function useAutostart() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: qk.autostart, queryFn: getAutostart, enabled: inTauri(), refetchOnWindowFocus: true });
  useEffect(() => onAppEvent("autostart-changed", (v) => qc.setQueryData(qk.autostart, v)), [qc]);
  const mutation = useMutation({
    mutationFn: setAutostart,
    onSuccess: (v) => qc.setQueryData(qk.autostart, v),
  });
  return { enabled: query.data ?? false, set: mutation.mutate, pending: mutation.isPending, error: mutation.error };
}

/** The quick-search shortcut label, e.g. "Alt+Space" (null if Windows refused it). */
export function useQuickShortcut() {
  return useQuery({ queryKey: qk.quickShortcut, queryFn: getQuickShortcut, staleTime: Infinity });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { startIndexing } from "@/features/index/api";
import { getPrivacyAudit, getPrivacyOverview, purge } from "./api";

export function usePrivacyOverview() {
  return useQuery({ queryKey: qk.privacyOverview, queryFn: ({ signal }) => getPrivacyOverview({ signal }) });
}

export function usePrivacyAudit() {
  return useQuery({ queryKey: qk.privacyAudit, queryFn: ({ signal }) => getPrivacyAudit({ signal }) });
}

/**
 * Deletes one kind of Smart Space data, then refreshes everything that shows it. Clearing the index starts
 * reading the folder again right away, so search and chat come back by themselves.
 */
export function usePurge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (scope) => {
      const res = await purge(scope);
      if (scope === "index") await startIndexing().catch(() => {});
      return res;
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

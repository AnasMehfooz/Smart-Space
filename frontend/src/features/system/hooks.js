import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { getHealth, scanHardware } from "./api";

/** Polls /health every second until the backend says ready. */
export function useHealth() {
  return useQuery({
    queryKey: qk.health,
    queryFn: ({ signal }) => getHealth({ signal }),
    refetchInterval: (q) => (q.state.data?.ready ? false : 1000),
    retry: false,
  });
}

/** Fresh hardware scan when the onboarding step opens. */
export function useHardwareScan() {
  return useQuery({
    queryKey: qk.hardware,
    queryFn: ({ signal }) => scanHardware({ signal }),
    staleTime: Infinity,
  });
}

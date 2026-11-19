import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { getWorkspace } from "./api";

export function useWorkspace() {
  return useQuery({ queryKey: qk.workspace, queryFn: ({ signal }) => getWorkspace({ signal }) });
}

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { quickSearch, search, EMPTY_FILTERS } from "./api";

/** The value, but only after it stopped changing for `ms`. */
export function useDebounced(value, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/** Search as you type: 250 ms debounce, the previous request is cancelled. */
export function useSearch(query, filters = EMPTY_FILTERS) {
  const q = useDebounced(query.trim());
  return useQuery({
    queryKey: ["search", q, filters],
    queryFn: ({ signal }) => search(q, filters, 20, { signal }),
    enabled: q.length > 0,
    placeholderData: keepPreviousData,
  });
}

/** The widget's search: shorter debounce, keeps the last results while typing, retries while the backend starts. */
export function useQuickSearch(query) {
  const q = useDebounced(query.trim(), 120);
  return useQuery({
    queryKey: qk.quickSearch(q),
    queryFn: ({ signal }) => quickSearch(q, { signal }),
    enabled: q.length > 0,
    placeholderData: keepPreviousData,
    retry: (n, e) => e?.code === "BACKEND_UNREACHABLE" && n < 20,
    retryDelay: 1000,
  });
}

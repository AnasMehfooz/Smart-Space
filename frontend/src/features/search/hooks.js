import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { search, EMPTY_FILTERS } from "./api";

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

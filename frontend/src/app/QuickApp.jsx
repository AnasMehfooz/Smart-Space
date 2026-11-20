import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import QuickSearch from "@/pages/QuickSearch";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

/** Root of the quick-search widget window: no router, no boot screen, just the search box. */
export default function QuickApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <QuickSearch />
    </QueryClientProvider>
  );
}

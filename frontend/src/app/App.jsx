import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { BootGate } from "./BootGate";
import { RouteGuard } from "./RouteGuard";
import { CloseHandler } from "./CloseHandler";
import { TooltipProvider } from "@/components/ui/tooltip";
import Onboarding from "@/pages/onboarding/Onboarding";
import Home from "@/pages/Home";
import Settings from "@/pages/Settings";
import Privacy from "@/pages/Privacy";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={450} skipDelayDuration={150}>
      <BrowserRouter>
        <BootGate>
          <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route
              path="/"
              element={
                <RouteGuard>
                  <Home />
                </RouteGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <RouteGuard>
                  <Settings />
                </RouteGuard>
              }
            />
            {/* Privacy also works before setup (linked from the welcome screen). */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BootGate>
      </BrowserRouter>
      <CloseHandler />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

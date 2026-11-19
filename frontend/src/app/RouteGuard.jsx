import { Navigate } from "react-router";
import { useWorkspace } from "@/features/workspace/hooks";
import { hasActiveEmbedding, useCatalog } from "@/features/models/hooks";
import { FullScreenMessage } from "@/components/FullScreenMessage";

/** Until a folder is set and a search model is active, every page sends the user to onboarding. */
export function RouteGuard({ children }) {
  const workspace = useWorkspace();
  const catalog = useCatalog();

  if (workspace.isPending || catalog.isPending) return <FullScreenMessage title="Loading…" />;
  if (workspace.isError || catalog.isError) {
    return <FullScreenMessage title="Could not load your setup. Restart the app." spinner={false} />;
  }
  if (!workspace.data || !hasActiveEmbedding(catalog.data)) return <Navigate to="/onboarding" replace />;
  return children;
}

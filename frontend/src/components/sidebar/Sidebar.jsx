import { Link } from "react-router";
import { Settings2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { FolderTree } from "./FolderTree";
import { ScanStatus } from "./ScanStatus";

/** Left margin index: logo, folder tree, scan status, setup. */
export function Sidebar({ rootPath, status, current, ...tree }) {
  const rootName = rootPath?.split(/[\\/]/).filter(Boolean).pop();
  return (
    <aside className="flex w-[clamp(13.5rem,19.5vw,17.5rem)] shrink-0 flex-col border-r">
      <div className="px-5 pt-5 pb-6">
        <Logo />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-2 pb-2 text-xs text-muted-foreground">Folders</p>
        <FolderTree rootName={rootName} {...tree} />
      </div>

      <div className="space-y-4 border-t px-5 py-4">
        <ScanStatus status={status} current={current} />
        <Link
          to="/onboarding"
          className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Settings2 className="size-3.5" /> Setup
        </Link>
      </div>
    </aside>
  );
}

import { useState } from "react";
import { ChevronRight, Folder, FolderOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTree } from "@/features/files/hooks";
import { FileIcon } from "@/components/FileIcon";

// Status dot per file, in the ink that carries that meaning.
const DOT = {
  indexed: "bg-ink-green",
  pending: "bg-ink-blue/60",
  processing: "bg-ink-blue animate-pulse",
  skipped: "bg-muted-foreground/40",
  error: "bg-ink-pink",
};

const rowBase = "flex w-full items-center gap-2 rounded-md text-left text-sm transition-colors hover:bg-[#1b1e23]";

/**
 * Collapsible folder tree of the workspace. Click a folder to list its files, click a file to select it,
 * double-click a file to open it. The open folder carries the highlighter mark.
 */
export function FolderTree({ rootName, folder, selectedId, onSelectFolder, onSelectFile, onOpenFile }) {
  return (
    <nav aria-label="Folders">
      <button onClick={() => onSelectFolder(null)} className={cn(rowBase, "px-2 py-1.5 font-medium")}>
        <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{folder === null ? <span className="mark">{rootName || "All files"}</span> : rootName || "All files"}</span>
      </button>
      <TreeLevel parent="" {...{ folder, selectedId, onSelectFolder, onSelectFile, onOpenFile }} />
    </nav>
  );
}

function TreeLevel({ parent, ...props }) {
  const tree = useTree(parent);
  if (tree.isPending)
    return (
      <p className="flex items-center gap-1.5 py-1 pl-7 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" /> Loading…
      </p>
    );
  if (!tree.data?.length) return null;
  return (
    // The left rule is the line that ties a folder's children together.
    <ul className="ml-[1.05rem] border-l pl-1">
      {tree.data.map((node) =>
        node.type === "dir" ? (
          <TreeDir key={node.rel_path} node={node} {...props} />
        ) : (
          <TreeFile key={node.rel_path} node={node} {...props} />
        ),
      )}
    </ul>
  );
}

function TreeDir({ node, folder, onSelectFolder, ...props }) {
  const [open, setOpen] = useState(false);
  const active = folder === node.rel_path;
  return (
    <li>
      <div className={cn(rowBase, "pr-2")}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
          aria-label={open ? `Collapse ${node.name}` : `Expand ${node.name}`}
          aria-expanded={open}
        >
          <ChevronRight className={cn("size-3.5 transition-transform duration-150", open && "rotate-90")} />
        </button>
        <button
          onClick={() => {
            onSelectFolder(node.rel_path);
            setOpen(true);
          }}
          className="flex min-w-0 flex-1 items-center gap-2 py-1"
        >
          {open ? (
            <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <Folder className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate">{active ? <span className="mark">{node.name}</span> : node.name}</span>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">{node.file_count}</span>
        </button>
      </div>
      {open && <TreeLevel parent={node.rel_path} folder={folder} onSelectFolder={onSelectFolder} {...props} />}
    </li>
  );
}

function TreeFile({ node, selectedId, onSelectFile, onOpenFile }) {
  const ext = node.name.split(".").pop();
  const selected = selectedId === node.file_id;
  return (
    <li>
      <button
        onClick={() => onSelectFile(node.file_id, node.rel_path)}
        onDoubleClick={() => onOpenFile(node.file_id)}
        title={`${node.rel_path}\nDouble-click to open`}
        className={cn(rowBase, "py-1 pr-2 pl-7 text-muted-foreground hover:text-foreground", selected && "text-foreground")}
      >
        <FileIcon ext={ext} className="size-3.5 shrink-0" />
        {/* The swipe for a selected file lives in the file list; the tree only brightens it. */}
        <span className={cn("truncate", selected && "font-medium")}>{node.name}</span>
        <span className={cn("ml-auto size-1.5 shrink-0 rounded-full", DOT[node.status] ?? "bg-muted")} />
      </button>
    </li>
  );
}

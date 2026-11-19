import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFileDetail } from "@/features/files/hooks";
import { FileIcon } from "./FileIcon";
import { FileActionsMenu } from "./FileActionsMenu";

// Reason first, so it survives truncation in a narrow window.
const SKIP_TEXT = {
  unsupported: "Unsupported file type, not read",
  too_large: "Too large, not read",
  empty: "Empty file, nothing to read",
  encrypted: "Password protected, not read",
  no_text: "No text found",
  excluded: "Removed from Smart Space (⋯ to add back)",
};

/**
 * Summaries often open with "This document outlines …"; on one line that wastes the space, so drop the lead-in
 * and start with the facts. (Stopgap until the backend's short summary is written fact-first.)
 */
function factFirst(text) {
  const rest = text.replace(
    /^(?:this|the)\s+(?:is\s+an?\s+)?(?:[\w-]+\s+){0,2}?(?:document|invoice|presentation|lecture|letter|file|receipt|text|image|notes?|report|contract|recipe|cv|résumé|resume|declaration|plan)\s+(?:is\s+an?\s+|outlines\s+|details\s+|provides\s+|describes\s+|covers\s+|lists\s+|specifies\s+(?:that\s+)?|introduces\s+|contains\s+|explains\s+|summarizes\s+|shows\s+)/i,
    "",
  );
  const out = rest.replace(/^this is an?\s+/i, "");
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/** What the second column says: the AI summary, or what is happening with the file. */
function description(file) {
  if (file.status === "pending") return { text: "Waiting to be read…", busy: false };
  if (file.status === "processing") return { text: "Reading…", busy: true };
  if (file.status === "error") return { text: file.error_message || "Could not be read.", error: true };
  if (file.status === "skipped") return { text: SKIP_TEXT[file.skip_reason] ?? "Can’t be read." };
  if (file.summary_short) return { text: factFirst(file.summary_short) };
  if (file.summary_state === "pending") return { text: "Writing summary…", busy: true };
  return { text: "" };
}

/**
 * One file in one line: icon, name, description, actions. Double-click opens the file.
 * Hovering the row shows the path and the whole description (the full AI summary, loaded on demand).
 */
export function FileRow({ file, selected, onSelect, actions }) {
  const [hovered, setHovered] = useState(false);
  const removed = file.status === "skipped" && file.skip_reason === "excluded";
  const unreadable = file.status === "skipped" || file.status === "error";
  const d = description(file);

  return (
    <Tooltip delayDuration={450} onOpenChange={setHovered}>
      <TooltipTrigger asChild>
        <li
          id={`file-${file.id}`}
          onClick={() => onSelect?.(file.id)}
          onDoubleClick={() => actions.open(file.id)}
          aria-selected={selected}
          className={cn("file-row", selected && "is-selected", unreadable && "is-dim")}
        >
          <FileIcon ext={file.ext} kind={file.kind} className="file-row__icon" />
          <span className="file-row__name">{selected ? <span className="mark">{file.name}</span> : file.name}</span>
          <span className={cn("file-row__desc", d.error && "text-destructive")}>
            {d.busy && <Loader2 className="mr-1.5 inline size-3.5 animate-spin align-[-2px]" />}
            {d.text}
          </span>
          <FileActionsMenu fileId={file.id} name={file.name} removed={removed} actions={actions} />
        </li>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" sideOffset={2} className="max-w-md flex-col items-start gap-1 py-2">
        <FullDescription file={file} fallback={d.text} enabled={hovered} />
      </TooltipContent>
    </Tooltip>
  );
}

function FullDescription({ file, fallback, enabled }) {
  const detail = useFileDetail(file.id, enabled && file.summary_state === "done");
  const text = detail.data?.summary?.text ? factFirst(detail.data.summary.text) : fallback;
  return (
    <>
      <span className="text-[11px] text-muted-foreground">{file.rel_path}</span>
      {text && <span className="text-[13px] leading-relaxed">{text}</span>}
      <span className="text-[11px] text-muted-foreground">Double-click to open</span>
    </>
  );
}

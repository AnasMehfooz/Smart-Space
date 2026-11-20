import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/features/workspace/hooks";
import { setWorkspace } from "@/features/workspace/api";
import { startIndexing } from "@/features/index/api";
import { getCatalog } from "@/features/models/api";
import { inTauri, pickFolder } from "@/lib/tauri";
import { qk } from "@/lib/queryKeys";
import { errorMessage } from "@/lib/errors";
import { StepFrame } from "./StepFrame";

const samePath = (a, b) => a?.replace(/[\\/]+$/, "").toLowerCase() === b?.replace(/[\\/]+$/, "").toLowerCase();

/**
 * The last step. If a folder is already set and the user picks another, what switching means is said before
 * Start, not after. Warnings from the backend (e.g. a very large folder) are shown before Home opens.
 */
export default function FolderStep({ onBack }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const current = useWorkspace().data;
  const [path, setPath] = useState("");
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState(null);
  const [busy, setBusy] = useState(false);

  // If a folder is already set (e.g. setup runs again), start with it.
  useEffect(() => {
    if (current?.root_path) setPath((p) => p || current.root_path);
  }, [current]);

  const switching = !!current?.root_path && !!path && !samePath(path, current.root_path);
  const same = !!current?.root_path && samePath(path, current.root_path);

  async function choose() {
    const picked = await pickFolder();
    if (picked) {
      setPath(picked);
      setError(null);
    }
  }

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const ws = await setWorkspace(path, switching);
      await startIndexing();
      qc.setQueryData(qk.workspace, ws);
      await qc.fetchQuery({ queryKey: qk.models, queryFn: ({ signal }) => getCatalog({ signal }) });
      qc.invalidateQueries({ queryKey: qk.indexStatus });
      if (ws?.warnings?.length) setWarnings(ws.warnings);
      else navigate("/", { replace: true });
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }

  if (warnings) {
    return (
      <StepFrame
        title="Reading has started"
        lead="Smart Space noticed something about this folder:"
        action={
          <Button onClick={() => navigate("/", { replace: true })}>
            Go to my files <ArrowRight />
          </Button>
        }
      >
        <ul className="border-t text-sm">
          {warnings.map((w, i) => (
            <li key={i} className="border-b py-3 text-muted-foreground">
              {typeof w === "string" ? w : (w.message ?? JSON.stringify(w))}
            </li>
          ))}
        </ul>
      </StepFrame>
    );
  }

  const label = same ? "Continue with this folder" : switching ? "Switch and start reading" : "Start reading";
  return (
    <StepFrame
      title="Choose the folder to read"
      lead="Smart Space reads every document, photo and scan in this folder and its subfolders. It only reads: nothing is changed, moved or deleted."
      back={
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
      }
      action={
        <Button
          onClick={start}
          disabled={!path || busy}
          variant={path ? "default" : "secondary"}
          className="disabled:opacity-100 disabled:text-muted-foreground"
        >
          {busy ? <Loader2 className="animate-spin" /> : null} {label} {!busy && <ArrowRight />}
        </Button>
      }
    >
      {inTauri() ? (
        <button
          type="button"
          onClick={choose}
          className="flex w-full items-center gap-3 rounded-lg border border-dashed px-4 py-4 text-left transition-colors hover:border-input hover:bg-muted"
        >
          <FolderOpen className="size-5 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">{path ? path.split(/[\\/]/).filter(Boolean).pop() : "Choose folder…"}</span>
            <span className="block truncate text-sm text-muted-foreground">{path || "Opens the Windows folder picker"}</span>
          </span>
          {path && <span className="shrink-0 text-sm text-muted-foreground">Change…</span>}
        </button>
      ) : (
        <label className="block space-y-1.5 text-sm">
          <span className="text-muted-foreground">Folder path (the folder picker works in the desktop app)</span>
          <input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="C:\Users\you\Documents"
            className="w-full rounded-md border bg-transparent px-3 py-2 outline-none focus-visible:border-ink-yellow/70"
          />
        </label>
      )}

      {switching && (
        <p className="mt-4 border-y py-3 text-sm leading-relaxed text-muted-foreground">
          Smart Space currently reads <span className="text-foreground">{current.root_path}</span>. Switching makes it
          forget what it learned there (summaries, search index, chats). The files themselves stay untouched.
        </p>
      )}

      {error && <p className="mt-4 text-sm text-ink-pink">{errorMessage(error)}</p>}
    </StepFrame>
  );
}

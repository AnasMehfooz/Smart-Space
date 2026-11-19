import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, FolderOpen, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from "@/features/workspace/hooks";
import { setWorkspace } from "@/features/workspace/api";
import { startIndexing } from "@/features/index/api";
import { getCatalog } from "@/features/models/api";
import { inTauri, pickFolder } from "@/lib/tauri";
import { qk } from "@/lib/queryKeys";
import { errorMessage } from "@/lib/errors";

export default function FolderStep({ onBack }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const current = useWorkspace();
  const [path, setPath] = useState("");
  const [error, setError] = useState(null);
  const [replaceFrom, setReplaceFrom] = useState(null); // old folder, when the backend asks to confirm a switch
  const [busy, setBusy] = useState(false);

  // If a folder is already set (e.g. setup is run again), start with it.
  useEffect(() => {
    if (current.data?.root_path) setPath((p) => p || current.data.root_path);
  }, [current.data]);

  async function choose() {
    const picked = await pickFolder();
    if (picked) {
      setPath(picked);
      setError(null);
      setReplaceFrom(null);
    }
  }

  async function start(replace = false) {
    setBusy(true);
    setError(null);
    try {
      const ws = await setWorkspace(path, replace);
      await startIndexing();
      qc.setQueryData(qk.workspace, ws);
      await qc.fetchQuery({ queryKey: qk.models, queryFn: ({ signal }) => getCatalog({ signal }) });
      qc.invalidateQueries({ queryKey: qk.indexStatus });
      navigate("/", { replace: true });
    } catch (e) {
      if (e.code === "WORKSPACE_EXISTS") setReplaceFrom(e.details?.root_path ?? "another folder");
      else setError(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Choose a folder</CardTitle>
        <CardDescription>
          Smart Space reads every document, photo and scan in this folder and its subfolders. It only reads; nothing is
          changed, moved or deleted.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {inTauri() ? (
          <button
            type="button"
            onClick={choose}
            className="flex w-full items-center gap-3 rounded-xl border border-dashed p-5 text-left transition-colors hover:bg-muted"
          >
            <FolderOpen className="size-6 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="font-medium">{path ? "Selected folder" : "Choose folder…"}</p>
              <p className="truncate text-sm text-muted-foreground">{path || "Opens the Windows folder picker"}</p>
            </div>
          </button>
        ) : (
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">Folder path (the folder picker only works in the desktop app)</span>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="C:\Users\you\Documents"
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring/50"
            />
          </label>
        )}

        {error && <p className="text-sm text-destructive">{errorMessage(error)}</p>}

        {replaceFrom && (
          <div className="space-y-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <p className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <span>
                Smart Space is already set up for <b>{replaceFrom}</b>. Switching deletes that index (your files stay
                untouched) and reads the new folder from scratch.
              </span>
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setReplaceFrom(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={() => start(true)} disabled={busy}>
                Switch folder
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
        <Button onClick={() => start(false)} disabled={!path || busy || !!replaceFrom}>
          {busy ? <Loader2 className="animate-spin" /> : <Rocket />} Start
        </Button>
      </CardFooter>
    </Card>
  );
}

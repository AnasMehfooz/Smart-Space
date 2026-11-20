import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FolderOpen, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, Row, Section } from "@/components/settings/PageShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Keys } from "@/components/Kbd";
import { Segmented, Switch } from "@/components/Switch";
import { useWorkspace } from "@/features/workspace/hooks";
import { deleteWorkspace, setWorkspace } from "@/features/workspace/api";
import { purge } from "@/features/privacy/api";
import { startIndexing } from "@/features/index/api";
import { plainModelName, useCatalog, useLlmStatus } from "@/features/models/hooks";
import { deleteModel } from "@/features/models/api";
import { useAutostart, useQuickShortcut } from "@/features/desktop/hooks";
import { useSystemInfo } from "@/features/system/hooks";
import { inTauri, openFile, openQuickSearch, pickFolder } from "@/lib/tauri";
import { PREF, getPref, setPref } from "@/lib/prefs";
import { formatBytes } from "@/lib/format";
import { errorMessage } from "@/lib/errors";
import { qk } from "@/lib/queryKeys";

const folderName = (p) => p?.split(/[\\/]/).filter(Boolean).pop() ?? p;
const samePath = (a, b) => a?.replace(/[\\/]+$/, "").toLowerCase() === b?.replace(/[\\/]+$/, "").toLowerCase();

/** Settings: the folder, the AI models, desktop behaviour, help. Every change says what it does before it does it. */
export default function Settings() {
  const [error, setError] = useState(null);
  return (
    <PageShell
      title="Settings"
      lead="Change the folder Smart Space reads, see the AI models it uses, and choose how it behaves on this PC."
      back={{ to: "/", label: "Back to files" }}
    >
      {error && (
        <p role="alert" className="mt-6 rounded-md border border-ink-pink/40 px-3 py-2 text-sm">
          {error}
        </p>
      )}
      <FolderSection onError={setError} />
      <ModelsSection onError={setError} />
      <DesktopSection />
      <SetupSection onError={setError} />
      <HelpSection />
    </PageShell>
  );
}

function FolderSection({ onError }) {
  const ws = useWorkspace().data;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [next, setNext] = useState(null); // the folder picked to switch to, waiting for confirmation
  const [busy, setBusy] = useState(false);

  async function choose() {
    onError(null);
    const picked = await pickFolder();
    if (picked && !samePath(picked, ws?.root_path)) setNext(picked);
  }

  async function switchFolder() {
    setBusy(true);
    try {
      const updated = await setWorkspace(next, true);
      await startIndexing();
      qc.setQueryData(qk.workspace, updated);
      await qc.invalidateQueries();
      navigate("/", { replace: true });
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const c = ws?.counts;
  const unreadable = (c?.skipped ?? 0) + (c?.errors ?? 0);
  return (
    <Section id="folder" title="Folder" description="Smart Space reads this folder and its subfolders. It never changes, moves or deletes anything in it.">
      <Row
        Icon={FolderOpen}
        title={folderName(ws?.root_path) ?? "No folder"}
        description={
          <>
            <span className="break-all">{ws?.root_path}</span>
            {c && (
              <span className="mt-0.5 block tabular-nums">
                {c.files} files · {c.indexed} read{unreadable ? ` · ${unreadable} can’t be read` : ""}
              </span>
            )}
          </>
        }
      >
        {inTauri() && (
          <Button variant="ghost" size="sm" onClick={() => openFile(ws.root_path).catch((e) => onError(e.message))}>
            Show in Explorer
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={choose} disabled={!inTauri()} title={inTauri() ? undefined : "Works in the desktop app"}>
          Change folder…
        </Button>
      </Row>

      <ConfirmDialog
        open={!!next}
        onOpenChange={(o) => !o && setNext(null)}
        title={`Switch to “${folderName(next)}”?`}
        confirmLabel={busy ? "Switching…" : "Switch folder"}
        busy={busy}
        onConfirm={switchFolder}
      >
        <p>
          Smart Space forgets what it learned about <b className="text-foreground">{folderName(ws?.root_path)}</b>: its
          summaries, search index and chats. The files themselves stay exactly where they are.
        </p>
        <p>
          Then it reads <b className="text-foreground">{next}</b> from scratch. Small folders take a few minutes; you can
          use the app meanwhile.
        </p>
      </ConfirmDialog>
    </Section>
  );
}

const ROLE = {
  embedding: { title: "Search", text: "Finds files by what they mean." },
  llm: { title: "Answers and summaries", text: "Writes the summaries and answers your questions." },
};

function ModelsSection({ onError }) {
  const catalog = useCatalog();
  const llm = useLlmStatus().data;
  const [removing, setRemoving] = useState(null);
  const models = catalog.data ?? [];
  const active = models.filter((m) => m.is_active && m.status === "installed" && ROLE[m.role]);
  const spare = models.filter((m) => !m.is_active && m.status === "installed");

  function llmLine() {
    if (!llm || llm.state === "stopped") return "Starts when you ask a question.";
    if (llm.state === "starting") return "Starting…";
    if (llm.state === "error") return "Could not start. Ask a question to try again.";
    return llm.gpu_layers > 0 ? "Running on your graphics card." : "Running on the processor.";
  }

  async function remove(m) {
    setRemoving(m.id);
    try {
      await deleteModel(m.id);
      await catalog.refetch();
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <Section id="models" title="AI models" description="Both run on this PC. They were downloaded once and work offline.">
      {catalog.isPending && <Row title="Loading…" />}
      {active.map((m) => (
        <Row
          key={m.id}
          title={ROLE[m.role].title}
          description={
            <>
              {ROLE[m.role].text} {m.role === "llm" && llmLine()}
              <span className="mt-0.5 block tabular-nums">
                {plainModelName(m.display_name)} · {formatBytes(m.size_bytes)}
              </span>
            </>
          }
        >
          <span className="text-xs text-muted-foreground">In use</span>
        </Row>
      ))}
      {spare.map((m) => (
        <Row
          key={m.id}
          title={plainModelName(m.display_name)}
          description={<span className="tabular-nums">Downloaded, not in use · {formatBytes(m.size_bytes)}</span>}
        >
          <Button variant="ghost" size="sm" onClick={() => remove(m)} disabled={removing === m.id}>
            {removing === m.id ? <Loader2 className="animate-spin" /> : <Trash2 />} Delete
          </Button>
        </Row>
      ))}
    </Section>
  );
}

function DesktopSection() {
  const autostart = useAutostart();
  const shortcut = useQuickShortcut().data;
  const [closeAction, setCloseAction] = useState(() => getPref(PREF.closeAction) ?? "ask");
  const desktop = inTauri();

  function chooseClose(v) {
    setCloseAction(v);
    setPref(PREF.closeAction, v === "ask" ? null : v);
  }

  return (
    <Section id="desktop" title="On this PC">
      <Row
        title="Quick search"
        description={shortcut ? "Opens a search box from any app, without this window." : "No shortcut could be set; another app uses it."}
      >
        {shortcut && <Keys combo={shortcut} />}
        <Button variant="ghost" size="sm" onClick={openQuickSearch}>
          Try it
        </Button>
      </Row>
      <Row
        title="Start with Windows"
        description="Smart Space starts quietly in the tray when you sign in, so quick search works right away."
      >
        <Switch
          label="Start with Windows"
          checked={autostart.enabled}
          disabled={!desktop || autostart.pending}
          onChange={(v) => autostart.set(v)}
        />
      </Row>
      {autostart.error && <p className="py-2 text-sm text-ink-pink">{autostart.error.message}</p>}
      <Row
        title="When you close the window"
        description="In the tray, Smart Space keeps watching your folder and quick search keeps working."
      >
        <Segmented
          label="When you close the window"
          value={closeAction}
          onChange={chooseClose}
          options={[
            { value: "ask", label: "Ask" },
            { value: "tray", label: "Keep in tray" },
            { value: "quit", label: "Quit" },
          ]}
        />
      </Row>
    </Section>
  );
}

/**
 * Setup again, for demos and testing (MVP). "Run setup again" only walks through the steps. "Reset setup" makes
 * Smart Space forget the folder, its index, the chats and this window's remembered choices, but keeps the AI
 * models, so the next setup needs no download.
 */
function SetupSection({ onError }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const ws = useWorkspace().data;

  async function reset() {
    setBusy(true);
    try {
      await purge("chats");
      await deleteWorkspace();
      setPref(PREF.tourSeen, null);
      setPref(PREF.closeAction, null);
      qc.setQueryData(qk.workspace, null);
      await qc.invalidateQueries();
      navigate("/onboarding", { replace: true });
    } catch (e) {
      onError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section id="setup" title="Setup">
      <Row title="Run setup again" description="Go through the welcome, PC check, AI models and folder steps again. Nothing is deleted.">
        <Button variant="outline" size="sm" onClick={() => navigate("/onboarding")}>
          Run setup
        </Button>
      </Row>
      <Row
        title="Reset setup"
        description="Start from the welcome screen as on a new PC. The AI models stay installed, so no download is needed."
      >
        <Button variant="destructive" size="sm" onClick={() => setConfirm(true)}>
          Reset…
        </Button>
      </Row>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Reset Smart Space?"
        confirmLabel={busy ? "Resetting…" : "Reset setup"}
        busy={busy}
        onConfirm={reset}
      >
        <p>
          Smart Space forgets {ws?.root_path ? <b className="text-foreground">{folderName(ws.root_path)}</b> : "the folder"}, its
          summaries and search index, all chats, and the choices this window remembered (tour, closing).
        </p>
        <p>The AI models stay installed. Your files are not touched.</p>
      </ConfirmDialog>
    </Section>
  );
}

const SHORTCUTS = [
  ["Alt+Space", "Quick search from anywhere"],
  ["Enter", "Open the file (quick search) · send the question (chat)"],
  ["Ctrl+Enter", "Show the file in its folder (quick search)"],
  ["Shift+Enter", "Show the file in Smart Space (quick search) · new line (chat)"],
  ["Esc", "Close quick search"],
];

function HelpSection() {
  const navigate = useNavigate();
  const info = useSystemInfo().data;
  return (
    <Section id="help" title="Help">
      <Row title="Tour" description="A three-step walk through the files, the chat and quick search.">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPref(PREF.tourSeen, null);
            navigate("/", { state: { tour: true } });
          }}
        >
          Take the tour again
        </Button>
      </Row>
      <Row title="Keyboard shortcuts" description={<span>Also: double-click a file to open it.</span>} />
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-b py-3.5 text-sm">
        {SHORTCUTS.map(([keys, what]) => (
          <div key={keys} className="contents">
            <dt>
              <Keys combo={keys} />
            </dt>
            <dd className="text-muted-foreground">{what}</dd>
          </div>
        ))}
      </dl>
      <Row title="Privacy and your data" description="What Smart Space stores on this PC, and how to delete it.">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/privacy">
            Open <ArrowRight />
          </Link>
        </Button>
      </Row>
      {info && (
        <p className="pt-3 text-xs text-muted-foreground tabular-nums">Smart Space {info.version}</p>
      )}
    </Section>
  );
}

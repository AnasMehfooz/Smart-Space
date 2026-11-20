import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { CloudOff, FolderLock, FolderOpen, Loader2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell, Row, Section } from "@/components/settings/PageShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { usePrivacyAudit, usePrivacyOverview, usePurge } from "@/features/privacy/hooks";
import { useWorkspace } from "@/features/workspace/hooks";
import { inTauri, openDataFolder } from "@/lib/tauri";
import { formatBytes } from "@/lib/format";
import { errorMessage } from "@/lib/errors";

const folderName = (p) => p?.split(/[\\/]/).filter(Boolean).pop() ?? p;
const n = (x) => (x ?? 0).toLocaleString();

const SCOPE_LABEL = {
  index: "Search index",
  file: "One file’s data",
  chats: "Chat history",
  models: "AI models",
  everything: "Everything",
};

/**
 * Privacy: the promise, made checkable. What Smart Space keeps on this PC (with real counts and sizes),
 * where it lives, how to delete each part, and a record of past deletions.
 */
export default function Privacy() {
  const location = useLocation();
  const fromSetup = location.state?.from === "/onboarding";
  const hasFolder = !!useWorkspace().data;
  const overview = usePrivacyOverview();
  const o = overview.data;
  const [error, setError] = useState(null);

  return (
    <PageShell
      title="Privacy"
      lead="Smart Space runs entirely on this PC. This page shows exactly what it keeps, where, and how to delete it."
      back={fromSetup ? { to: "/onboarding", label: "Back to setup" } : { to: "/", label: "Back to files" }}
      showSettings={hasFolder && !fromSetup}
    >
      <Section id="promises" title="What Smart Space promises">
        <Row
          Icon={FolderLock}
          title="Your files are only read"
          description={
            o?.workspace_root
              ? `Nothing in ${folderName(o.workspace_root)} is ever changed, moved, deleted or uploaded.`
              : "Nothing in your folder is ever changed, moved, deleted or uploaded."
          }
        />
        <Row
          Icon={UserX}
          title="No account, no tracking"
          description="There is no sign-in and no cloud. Smart Space sends no usage data anywhere."
        />
        <Row
          Icon={CloudOff}
          title="Internet only to download the AI models"
          description="The models come from Hugging Face (huggingface.co), once. After that, search and chat work offline."
        />
      </Section>

      {error && (
        <p role="alert" className="mt-6 rounded-md border border-ink-pink/40 px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <StoredSection o={o} loading={overview.isPending} onError={setError} />
      <HistorySection />
    </PageShell>
  );
}

function StoredSection({ o, loading, onError }) {
  const navigate = useNavigate();
  const purge = usePurge();
  const [confirm, setConfirm] = useState(null); // scope waiting for confirmation

  const indexBytes = (o?.db_size_bytes ?? 0) + (o?.vectors_size_bytes ?? 0);
  const total = indexBytes + (o?.models_size_bytes ?? 0) + (o?.logs_size_bytes ?? 0);

  async function run(scope) {
    onError(null);
    try {
      await purge.mutateAsync(scope);
      if (scope === "models" || scope === "everything") navigate("/", { replace: true }); // setup takes over
    } catch (e) {
      onError(errorMessage(e));
    }
  }

  const dialogs = {
    index: {
      title: "Clear the search index?",
      label: "Clear and read again",
      body: (
        <p>
          Smart Space forgets what it learned about your files (summaries, tags and the search index) and reads the
          folder again from scratch. Your files are not touched.
        </p>
      ),
    },
    chats: {
      title: "Delete all chats?",
      label: "Delete chats",
      body: <p>All {n(o?.chat_sessions)} chats and their answers are deleted. This can’t be undone.</p>,
    },
    models: {
      title: "Delete the AI models?",
      label: "Delete models",
      body: (
        <p>
          This frees {formatBytes(o?.models_size_bytes)}. Search and chat stop working until the models are downloaded
          again; Smart Space takes you to that step.
        </p>
      ),
    },
    everything: {
      title: "Delete everything Smart Space stored?",
      label: "Delete everything",
      body: (
        <>
          <p>
            The search index, chats, AI models and logs are deleted ({formatBytes(total)}). Smart Space then starts setup
            again.
          </p>
          <p>Your files{o?.workspace_root ? ` in ${o.workspace_root}` : ""} are not touched.</p>
        </>
      ),
    },
  };
  const d = confirm && dialogs[confirm];

  return (
    <Section
      id="stored"
      title="What is stored on this PC"
      description={
        o ? (
          <>
            Everything below lives in <span className="text-foreground">{o.data_dir}</span>, {formatBytes(total)} in
            total.
          </>
        ) : null
      }
    >
      {loading && <Row title="Loading…" />}
      {o && (
        <>
          <Row
            title="Search index"
            description={
              <span className="tabular-nums">
                {n(o.files_indexed)} files read · {n(o.chunks)} passages · {n(o.summaries)} summaries · {n(o.tags)} tags ·{" "}
                {formatBytes(indexBytes)}
              </span>
            }
          >
            <Button variant="outline" size="sm" onClick={() => setConfirm("index")}>
              Clear…
            </Button>
          </Row>
          <Row
            title="Chat history"
            description={
              <span className="tabular-nums">
                {n(o.chat_sessions)} chats · {n(o.chat_messages)} messages
              </span>
            }
          >
            <Button variant="outline" size="sm" onClick={() => setConfirm("chats")} disabled={!o.chat_sessions}>
              Delete…
            </Button>
          </Row>
          <Row
            title="AI models"
            description={<span className="tabular-nums">{formatBytes(o.models_size_bytes) || "None downloaded"}</span>}
          >
            <Button variant="outline" size="sm" onClick={() => setConfirm("models")} disabled={!o.models_size_bytes}>
              Delete…
            </Button>
          </Row>
          <Row
            title="Logs"
            description={<span className="tabular-nums">Technical records for fixing problems · {formatBytes(o.logs_size_bytes)}</span>}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            {inTauri() ? (
              <Button variant="outline" size="sm" onClick={() => openDataFolder().catch((e) => onError(e.message))}>
                <FolderOpen /> Open the data folder
              </Button>
            ) : (
              <span />
            )}
            <Button variant="destructive" size="sm" onClick={() => setConfirm("everything")}>
              Delete everything…
            </Button>
          </div>
        </>
      )}

      {d && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setConfirm(null)}
          title={d.title}
          confirmLabel={purge.isPending ? "Deleting…" : d.label}
          busy={purge.isPending}
          onConfirm={() => run(confirm)}
        >
          {d.body}
        </ConfirmDialog>
      )}
    </Section>
  );
}

function HistorySection() {
  const audit = usePrivacyAudit();
  const items = audit.data?.items ?? [];
  return (
    <Section id="history" title="Deletion history" description="Every time Smart Space deleted its own data.">
      {audit.isPending && (
        <Row
          title={
            <span className="flex items-center gap-2 font-normal text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Loading…
            </span>
          }
        />
      )}
      {audit.isSuccess && items.length === 0 && <Row title="Nothing deleted yet." className="[&_div]:font-normal [&_div]:text-muted-foreground" />}
      {items.map((it) => (
        <Row
          key={it.id}
          title={SCOPE_LABEL[it.scope] ?? it.scope}
          description={
            <span className="tabular-nums">
              {n(it.items_deleted)} items · {formatBytes(it.bytes_freed) || "0 KB"} freed
              {it.target && it.scope !== "file" ? ` · ${folderName(it.target)}` : ""}
            </span>
          }
        >
          <time dateTime={it.performed_at} className="text-xs text-muted-foreground tabular-nums">
            {new Date(it.performed_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </time>
        </Row>
      ))}
    </Section>
  );
}

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { FileRow } from "@/components/FileRow";
import { ChatPanel } from "@/components/ChatPanel";
import { useWorkspace } from "@/features/workspace/hooks";
import { useFileActions, useFiles } from "@/features/files/hooks";
import { useIndexEvents, useIndexStatus } from "@/features/index/hooks";
import { errorMessage } from "@/lib/errors";

const parentOf = (relPath) => (relPath.includes("/") ? relPath.slice(0, relPath.lastIndexOf("/")) : null);

/** Home: sidebar (folder tree + scan status) | file list | chat. Search happens through the chat. */
export default function Home() {
  const ws = useWorkspace().data;
  const status = useIndexStatus().data;
  const current = useIndexEvents();
  const [folder, setFolder] = useState(null); // relative folder shown in the middle, null = everything
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState(null);

  // File actions with errors shown in the notice bar (e.g. "This file no longer exists.").
  const raw = useFileActions();
  const actions = useMemo(() => {
    const wrap = (fn) => async (id) => {
      setNotice(null);
      try {
        await fn(id);
      } catch (e) {
        setNotice(e.message ? e.message : errorMessage(e));
      }
    };
    return { open: wrap(raw.open), reveal: wrap(raw.reveal), remove: wrap(raw.remove), addBack: wrap(raw.addBack) };
  }, [raw.open, raw.reveal, raw.remove, raw.addBack]); // eslint-disable-line react-hooks/exhaustive-deps

  // Chat sources and tree files: show the file's folder in the list and highlight the file.
  function showFile(fileId, relPath) {
    setFolder(relPath ? parentOf(relPath) : null);
    setSelectedId(fileId);
  }
  useEffect(() => {
    if (selectedId == null) return;
    const t = setTimeout(() => {
      document.getElementById(`file-${selectedId}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 150); // after the list for the folder has rendered
    return () => clearTimeout(t);
  }, [selectedId, folder]);

  const allFiles = useFiles(null).data?.pages.flatMap((p) => p.items) ?? [];
  const examples = exampleQuestions(allFiles);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        rootPath={ws?.root_path}
        status={status}
        current={current}
        folder={folder}
        selectedId={selectedId}
        onSelectFolder={(f) => {
          setFolder(f);
          setSelectedId(null);
        }}
        onSelectFile={showFile}
        onOpenFile={actions.open}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[4.25rem] shrink-0 items-center px-6">
          <Breadcrumb rootPath={ws?.root_path} folder={folder} onSelect={setFolder} />
        </div>

        {notice && (
          <div role="alert" className="mx-6 mb-3 flex items-center justify-between gap-4 rounded-md border border-ink-pink/40 px-3 py-2 text-sm">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Dismiss">
              <X className="size-3.5" />
            </button>
          </div>
        )}

        <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          <FileList folder={folder} selectedId={selectedId} onSelect={setSelectedId} actions={actions} />
        </section>
      </main>

      <ChatPanel onOpenFile={(id) => showFile(id, allFiles.find((f) => f.id === id)?.rel_path)} examples={examples} />
    </div>
  );
}

function Breadcrumb({ rootPath, folder, onSelect }) {
  const rootName = rootPath?.split(/[\\/]/).filter(Boolean).pop() ?? "Files";
  const parts = folder ? folder.split("/") : [];
  return (
    <nav aria-label="Current folder" className="flex min-w-0 items-center gap-1.5 text-[15px]">
      <button onClick={() => onSelect(null)} className={parts.length ? "text-muted-foreground hover:text-foreground" : "font-semibold tracking-[-0.01em]"}>
        {rootName}
      </button>
      {parts.map((p, i) => (
        <span key={i} className="flex min-w-0 items-center gap-1.5">
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
          <button
            onClick={() => onSelect(parts.slice(0, i + 1).join("/"))}
            className={i === parts.length - 1 ? "truncate font-semibold tracking-[-0.01em]" : "truncate text-muted-foreground hover:text-foreground"}
          >
            {p}
          </button>
        </span>
      ))}
    </nav>
  );
}

// The AI's document type can be wrong (a sign photo tagged "invoice"), so purchase questions also need the
// name or tags to look like a bill.
const LOOKS_LIKE_BILL = /invoice|rechnung|receipt|quittung|bill|kassenbon/i;

/** A question someone would really ask about this file, by its AI document type. */
function questionFor(f) {
  const base = f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
  const type = f.doc_type === "invoice" && !LOOKS_LIKE_BILL.test(`${f.name} ${f.tags?.join(" ")}`) ? null : f.doc_type;
  switch (type) {
    case "invoice":
      return `What did I buy in “${base}”, and how much did it cost?`;
    case "contract":
      return `What does “${base}” say about the rent and start date?`;
    case "cv":
      return `Where did the person in “${base}” study and work?`;
    case "letter":
      return `What is the letter “${base}” about?`;
    default:
      return f.tags?.length ? `What does “${base}” say about ${f.tags[0]}?` : null;
  }
}

/**
 * Up to 3 specific questions from the user's own files: one per kind of question. Typed questions (invoice,
 * contract, CV, letter) come first; the generic "say about <tag>" question only fills the remaining slots.
 */
function exampleQuestions(files) {
  const indexed = files.filter((f) => f.status === "indexed");
  const typed = [];
  const generic = [];
  const seen = new Set();
  for (const f of indexed) {
    const q = questionFor(f);
    const kind = q?.split("“")[0]; // the question's wording, without the file name
    if (!q || seen.has(kind)) continue;
    seen.add(kind);
    (q.includes(" say about ") && !q.includes("the rent") ? generic : typed).push(q);
  }
  const order = ["What did I buy", "What does “", "Where did", "What is the letter"]; // invoice, contract, CV, letter
  const pos = (q) => order.findIndex((p) => q.startsWith(p));
  typed.sort((a, b) => pos(a) - pos(b));
  return [...typed, ...generic].slice(0, 3);
}

function FileList({ folder, selectedId, onSelect, actions }) {
  const files = useFiles(folder);
  const items = files.data?.pages.flatMap((p) => p.items) ?? [];
  const total = files.data?.pages[0]?.total ?? 0;

  return (
    <div className="file-list">
      <div className="file-row !cursor-auto text-xs text-muted-foreground hover:!bg-transparent">
        <span />
        <span>Name</span>
        <span className="flex min-w-0 justify-between gap-3">
          <span className="truncate">Description</span>
          <span className="shrink-0 whitespace-nowrap tabular-nums">
            {total} {total === 1 ? "file" : "files"}
          </span>
        </span>
        <span />
      </div>
      {files.isPending && <Loading text="Loading files…" />}
      {files.isError && <p className="py-4 text-sm text-destructive">{errorMessage(files.error)}</p>}
      {files.isSuccess && items.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">No files here yet. They appear as soon as they are found.</p>
      )}
      <ul>
        {items.map((f) => (
          <FileRow key={f.id} file={f} selected={f.id === selectedId} onSelect={onSelect} actions={actions} />
        ))}
      </ul>
      {files.hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => files.fetchNextPage()} disabled={files.isFetchingNextPage}>
            {files.isFetchingNextPage && <Loader2 className="animate-spin" />} Load more
          </Button>
        </div>
      )}
    </div>
  );
}

function Loading({ text }) {
  return (
    <p className="flex items-center gap-2 py-8 text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> {text}
    </p>
  );
}

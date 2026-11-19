import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Plus, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/features/chat/hooks";
import { FileIcon } from "./FileIcon";

/**
 * Chat with the files: streaming answers whose cited facts are highlighted, with numbered sources that point to files.
 * `examples`: suggested questions. Specific ones work best; the AI answers from matching passages, so
 * "What is this folder about?" usually finds nothing.
 */
export function ChatPanel({ onOpenFile, examples = [] }) {
  const { messages, busy, send, stop, reset } = useChat();
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function submit(text = input) {
    if (!text.trim() || busy) return;
    send(text);
    setInput("");
  }

  return (
    <aside className="flex w-[clamp(16rem,29vw,25rem)] shrink-0 flex-col border-l" aria-label="Ask your files">
      <div className="flex h-[4.25rem] shrink-0 items-center justify-between px-5">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Ask your files</h2>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={reset} disabled={busy} className="text-muted-foreground">
            <Plus /> New chat
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 pb-4">
        {messages.length === 0 && (
          <div className="space-y-4 pt-2">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ask in English or German. Answers come only from your files, and the facts they use are marked with
              their source.
            </p>
            {examples.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {examples.map((q) => (
                  <button
                    key={q}
                    onClick={() => submit(q)}
                    className="rounded-md border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-input hover:text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <p key={i} className="ml-10 rounded-xl rounded-br-sm bg-secondary px-3.5 py-2.5 text-sm leading-relaxed">
              {m.text}
            </p>
          ) : (
            <AssistantMessage key={i} message={m} onOpenFile={onOpenFile} />
          ),
        )}
        <div ref={endRef} />
      </div>

      <form
        className="p-4 pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex items-end gap-2 rounded-xl border bg-card p-2 transition-colors focus-within:border-ink-yellow/70 focus-within:bg-[#1d2025]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            aria-label="Your question"
            placeholder="Ask something about your files…"
            className="flex-1 resize-none bg-transparent px-1.5 py-1 text-sm outline-none focus-visible:outline-none"
          />
          {busy ? (
            <Button type="button" size="icon" variant="secondary" onClick={stop} aria-label="Stop the answer">
              <Square />
            </Button>
          ) : (
            // Yellow only when there is something to send; empty, it is plain graphite (never a dimmed ink).
            <Button
              type="submit"
              size="icon"
              variant={input.trim() ? "default" : "secondary"}
              disabled={!input.trim()}
              className="disabled:text-muted-foreground disabled:opacity-100"
              aria-label="Send"
            >
              <ArrowUp />
            </Button>
          )}
        </div>
      </form>
    </aside>
  );
}

// "Not found" answers in English and German. The small model sometimes says this and still cites files.
const NOT_FOUND = /could not find|couldn[’']t find|can(?:no|')t find|not (?:in|found in) the indexed|nicht (?:finden|gefunden)|keine .{0,40} gefunden/i;

function AssistantMessage({ message: m, onOpenFile }) {
  const byNumber = Object.fromEntries((m.citations ?? []).map((c) => [c.n, c]));
  // One source per cited file, in order of first citation.
  const sources = [...new Map((m.citations ?? []).map((c) => [c.file_id, c])).values()];
  // A "could not find it" answer has no facts to mark; what it cites is only possibly related.
  const notFound = !m.pending && NOT_FOUND.test(m.text ?? "");

  return (
    <div className="space-y-3">
      <div className="text-[15px] leading-[1.65] whitespace-pre-wrap">
        {m.text ? (
          <AnswerText text={m.text} byNumber={byNumber} onOpenFile={onOpenFile} marks={!notFound} />
        ) : m.pending ? (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Reading your files…
          </span>
        ) : null}
        {m.stopped && <span className="text-sm text-muted-foreground"> (stopped)</span>}
      </div>

      {m.searchOnly && (
        <p className="text-xs text-muted-foreground">Install a language model to get written answers. Matching files:</p>
      )}
      {m.error && <p className="text-xs text-destructive">{m.error}</p>}

      {sources.length > 0 && notFound && <p className="text-xs text-muted-foreground">Possibly related files:</p>}
      {sources.length > 0 && (
        <ul className="flex flex-col gap-1">
          {sources.map((c) => (
            <li key={c.file_id}>
              <button
                onClick={() => onOpenFile?.(c.file_id)}
                title={c.rel_path}
                className="flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors hover:border-input"
              >
                <span className="font-medium text-muted-foreground tabular-nums">{c.n}</span>
                <FileIcon ext={c.name?.split(".").pop()} className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{c.name}</span>
                {c.page && <span className="ml-auto shrink-0 text-muted-foreground">p. {c.page}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* The small model sometimes says "could not find it" although search found the right file
          (e.g. "coffee payments" vs. a receipt). Never leave that as a dead end: offer the best matches. */}
      {!m.pending && !m.searchOnly && sources.length === 0 && m.files?.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Possibly related files:</p>
          <ul className="flex flex-col gap-1">
            {m.files.slice(0, 3).map((f) => (
              <li key={f.file_id}>
                <button
                  onClick={() => onOpenFile?.(f.file_id)}
                  title={f.rel_path}
                  className="flex w-full items-center gap-2 rounded-md border border-dashed px-2.5 py-1.5 text-left text-xs transition-colors hover:border-input"
                >
                  <FileIcon ext={f.ext} kind={f.kind} className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{f.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {m.searchOnly && m.files?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {m.files.map((f) => (
            <button
              key={f.file_id}
              onClick={() => onOpenFile?.(f.file_id)}
              className="rounded-md border px-2 py-1 text-xs hover:border-input"
            >
              {f.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Renders the answer. The sentence right before each "[n]" is the fact it cites: it gets the highlighter mark
 * (drawn in as the citation streams in), and "[n]" becomes a small number that opens the file.
 */
function AnswerText({ text, byNumber, onOpenFile, marks = true }) {
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const cite = part.match(/^\[(\d+)\]$/);
    if (cite) {
      const c = byNumber[Number(cite[1])];
      return (
        <button
          key={i}
          onClick={() => c && onOpenFile?.(c.file_id)}
          title={c ? c.rel_path : undefined}
          aria-label={c ? `Source ${cite[1]}: ${c.name}` : `Source ${cite[1]}`}
          className="mx-0.5 align-super text-[11px] font-semibold text-ink-yellow tabular-nums hover:underline"
        >
          {cite[1]}
        </button>
      );
    }
    const citedNext = /^\[\d+\]$/.test(parts[i + 1] ?? "");
    if (!marks || !citedNext || !part.trim()) return part;
    // The cited claim is everything since the previous citation. Short claims are marked whole;
    // long ones (lists, paragraphs) only their last sentence, so an answer never turns into one yellow block.
    let before = "";
    let fact = part.trim();
    const after = part.match(/\s*$/)[0];
    if (fact.length > 160) {
      const m = part.match(/^([\s\S]*[.!?:]\s+|[\s\S]*\n)?([\s\S]+?)\s*$/);
      before = m?.[1] ?? "";
      fact = m?.[2] ?? fact;
    } else {
      before = part.match(/^\s*/)[0];
    }
    return (
      <span key={i}>
        {before}
        <span className="mark">{fact}</span>
        {after}
      </span>
    );
  });
}

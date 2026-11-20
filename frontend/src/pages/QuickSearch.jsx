import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CornerDownLeft, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileIcon } from "@/components/FileIcon";
import { useQuickSearch } from "@/features/search/hooks";
import { useFileActions } from "@/features/files/hooks";
import { errorMessage } from "@/lib/errors";
import { hideQuick, onWindowFocus, resizeQuick, showInApp } from "@/lib/tauri";

const parentOf = (relPath) => (relPath.includes("/") ? relPath.slice(0, relPath.lastIndexOf("/")) : "");

/**
 * The quick-search widget (its own small window, opened anywhere with Alt+Space).
 * Type → up to 6 files by name, text or meaning. ↵ opens, Ctrl+↵ shows in folder, Shift+↵ shows it in
 * Smart Space, Esc (or clicking elsewhere) closes. The window grows and shrinks with its content.
 */
export default function QuickSearch() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const rootRef = useRef(null);
  const actions = useFileActions();

  const search = useQuickSearch(query);
  const hasQuery = query.trim().length > 0;
  // Search always returns 6 files, also unrelated ones. Keep only those close to the best match
  // (real matches score ~0.03–0.05, the filler ~0.015).
  const all = hasQuery ? (search.data?.results ?? []) : [];
  const results = all.filter((r, i) => i === 0 || r.score >= all[0].score * 0.5);
  const starting = search.error?.code === "BACKEND_UNREACHABLE" || (search.isFetching && search.failureCount > 0);

  // Every time the widget is shown: focus the box and select the last query, so typing replaces it.
  useEffect(
    () =>
      onWindowFocus(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
        setError(null);
      }),
    [],
  );

  // Fit the window to the content.
  useLayoutEffect(() => {
    const el = rootRef.current;
    const ro = new ResizeObserver(() => resizeQuick(Math.ceil(el.getBoundingClientRect().height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => setActive(0), [search.data]);

  async function run(kind, r = results[active]) {
    if (!r) return;
    setError(null);
    try {
      if (kind === "app") return await showInApp(r.file_id, r.rel_path);
      await (kind === "reveal" ? actions.reveal : actions.open)(r.file_id);
      await hideQuick();
    } catch (e) {
      setError(e.message || errorMessage(e));
    }
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      hideQuick();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(e.ctrlKey ? "reveal" : e.shiftKey ? "app" : "open");
    }
  }

  let status = null;
  if (error) status = <span className="text-ink-pink">{error}</span>;
  else if (starting) status = "Smart Space is starting…";
  else if (search.isError) status = errorMessage(search.error);
  else if (hasQuery && search.isSuccess && !search.isPlaceholderData && results.length === 0)
    status = <>No files match “{query.trim()}”.</>;

  return (
    <div ref={rootRef} className="quick select-none bg-popover text-popover-foreground">
      <div className="flex h-14 items-center gap-3 px-4">
        <Search className="size-[18px] shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search your files…"
          aria-label="Search your files"
          aria-controls="quick-results"
          spellCheck={false}
          className="h-full min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-muted-foreground focus-visible:outline-none"
        />
        {search.isFetching && hasQuery && <Loader2 className="size-4 shrink-0 animate-spin text-ink-blue" />}
      </div>

      {(results.length > 0 || status) && (
        <div className="border-t">
          {results.length > 0 && (
            <ul id="quick-results" role="listbox" aria-label="Files" className="space-y-px p-1.5">
              {results.map((r, i) => (
                <li
                  key={r.file_id}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run("open", r)}
                  className={cn("quick-row", i === active && "is-active")}
                >
                  <FileIcon ext={r.ext} kind={r.kind} className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      {/* The name keeps its space; the folder gives way first. */}
                      <span className="max-w-[78%] shrink-0 truncate text-sm font-medium">
                        {i === active ? <span className="mark">{r.name}</span> : r.name}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{parentOf(r.rel_path)}</span>
                    </div>
                    {r.snippet?.text && (
                      // Backend snippets are HTML-escaped; only <mark> around matched words is added.
                      <p className="quick-snippet truncate" dangerouslySetInnerHTML={{ __html: r.snippet.text }} />
                    )}
                  </div>
                  {i === active && <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" />}
                </li>
              ))}
            </ul>
          )}
          {status && <p className="px-4 py-3 text-sm text-muted-foreground">{status}</p>}
        </div>
      )}

      {results.length > 0 && (
        <div className="flex items-center gap-4 border-t px-4 py-2 text-[12px] text-muted-foreground">
          <Hint keys={["↵"]}>Open</Hint>
          <Hint keys={["Ctrl", "↵"]}>Show in folder</Hint>
          <Hint keys={["Shift", "↵"]}>Show in Smart Space</Hint>
          <Hint keys={["Esc"]} className="ml-auto">
            Close
          </Hint>
        </div>
      )}
    </div>
  );
}

function Hint({ keys, children, className }) {
  return (
    <span className={cn("flex items-center gap-1", className)}>
      {keys.map((k) => (
        <kbd key={k} className="kbd">
          {k}
        </kbd>
      ))}
      <span className="ml-0.5">{children}</span>
    </span>
  );
}

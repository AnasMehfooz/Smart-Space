import { useCallback } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { openFile, revealInFolder } from "@/lib/tauri";
import { getFile, getTree, listFiles, reindexFile, removeFromIndex } from "./api";

const PAGE = 100;

/** Files of the workspace (or of one folder), 100 at a time ("Load more"). */
export function useFiles(folder = null, sort = "name") {
  return useInfiniteQuery({
    queryKey: qk.files({ folder, sort }),
    queryFn: ({ pageParam, signal }) => listFiles({ folder, limit: PAGE, offset: pageParam, sort }, { signal }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.offset + last.items.length < last.total ? last.offset + last.items.length : undefined),
  });
}

/** One level of the folder tree, loaded when the folder is expanded. */
export function useTree(parent, enabled = true) {
  return useQuery({
    queryKey: qk.tree(parent),
    queryFn: ({ signal }) => getTree(parent, { signal }),
    enabled,
  });
}

/** Full detail of one file (incl. the whole AI summary), loaded only when `enabled` (e.g. while a tooltip is open). */
export function useFileDetail(id, enabled) {
  return useQuery({
    queryKey: qk.file(id),
    queryFn: ({ signal }) => getFile(id, { signal }),
    enabled,
    staleTime: 60_000,
  });
}

/** Actions on one file. Each returns a promise; errors are thrown with a readable message. */
export function useFileActions() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["files"] });

  const absPath = useCallback(async (id) => (await getFile(id)).abs_path, []);

  return {
    open: async (id) => openFile(await absPath(id)),
    reveal: async (id) => revealInFolder(await absPath(id)),
    remove: async (id) => {
      await removeFromIndex(id);
      refresh();
    },
    addBack: async (id) => {
      await reindexFile(id);
      refresh();
    },
  };
}

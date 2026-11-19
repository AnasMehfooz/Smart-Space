// All TanStack Query keys in one place, so invalidation always matches.
// Everything under ["files", ...] is refreshed together when the index changes.
export const qk = {
  health: ["health"],
  workspace: ["workspace"],
  hardware: ["hardware"],
  models: ["models"],
  recommendations: ["recommendations"],
  indexStatus: ["index", "status"],
  files: (filters) => ["files", "list", filters],
  tree: (parent) => ["files", "tree", parent],
  file: (id) => ["files", "detail", id],
};

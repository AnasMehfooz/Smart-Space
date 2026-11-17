# SMART SPACE

Local-first, privacy-focused AI file manager. Pick one folder; the app indexes it on your machine
(text extraction, OCR, embeddings, summaries) and lets you search by meaning or chat with your files.
The only network use is downloading models.

Specification: *SMART SPACE Technical Specification (SDD) v0.1*.

| Part | Owner | Status |
|---|---|---|
| `backend/` FastAPI sidecar: indexing, hybrid search, RAG chat, model manager, llama-server runner, privacy | Developer B | **Working prototype** (see [backend/README.md](backend/README.md)) |
| `apps/desktop/` Tauri v2 + React UI, quick-search window | Developer A | Not in this repo yet |

- Backend setup, run, test: [backend/README.md](backend/README.md)
- API guide for the frontend (endpoints, SSE events, flows): [docs/API.md](docs/API.md)
- Machine-readable contract: [docs/openapi.json](docs/openapi.json) (`npx openapi-typescript docs/openapi.json -o src/lib/api-types.ts`)
- Scripts: [scripts/](scripts/) (dev server, llama-server download, demo workspace, PyInstaller build)

```
smartspace/
  backend/            FastAPI app (app/), tests (tests/), pyproject.toml
  docs/               API guide + openapi.json
  scripts/            dev_backend.ps1, fetch_llama_server.ps1, make_demo_workspace.ps1, build_backend.ps1
  apps/desktop/       (frontend, Developer A)
```

# Demo PC results (19 Nov 2026)

Run by Developer A's AI assistant (Claude Code) on the demo laptop, following `docs/TESTING_GUIDE.md` on `main`
at `8a28c96`. No backend code was changed. Data folder `C:\SmartSpaceDemo`, documents `C:\SmartSpaceDemoFiles`,
laptop on AC power the whole time.

**Summary:** everything in A2.1, A2.2, A2.5 and A2.7 passes. **CUDA is the chosen build** (72 tok/s). Nothing
blocks the demo. Problems 1 and 3 below are small things in the guide or backend worth fixing. Problem 4 is an AI
quality note that affects which demo questions to use. One step is still open: the real offline check with Wi-Fi
off (see A2.7).

## Machine
- CPU / RAM / GPU / driver: Intel Core i7-11800H, 16 GB RAM (16085 MB), NVIDIA GeForce RTX 3050 Laptop GPU 4 GB
  (driver 621.24, CUDA 13.5) plus Intel UHD Graphics (iGPU). Windows 11 Home.
- tier and recommended models: **tier 2**, `emb-mini` + `llm-3b` + `ocr-rapid`, `ctx_cap 6144`, no warnings.
  The RTX 3050 shows as `nvidia`, 4096 MB (3962 free), `backend cuda`, `usable True`. The Intel UHD shows as
  `integrated True`, `usable False`. All as expected.

## A2.1 full flow
- pytest: **91 passed** in 49.8 s, no failures.
- setup: `uv sync` OK. llama.cpp `b12475` cpu / vulkan / cuda builds installed, SHA-256 OK (see Problem 1 for the
  command). Model download: `emb-mini` + `llm-3b` installed in 491 s, and `emb-mini`, `llm-3b`, `ocr-rapid`
  became active by themselves.
- indexing: total **17** / indexed **15** / skipped **2** (`Misc/empty.txt` empty, `Misc/song.mp3`
  unsupported) / errors **0** / summaries **15** (0 failed), time **39 s**. `node_modules`, `.hidden` and
  `~$lockfile.docx` were ignored.
- file list: 17 rows. Every indexed file has a `doc_type`, tags and a `summary_short` (max 159 characters).
  Skipped files have no tags and no summary.
- search checks (4): all **pass**, first result as expected.

  | query | first result | took_ms |
  |---|---|---|
  | rental contract | Housing/Mietvertrag_2024.pdf | 34 |
  | Rechnung für den Laptop | Finance/Invoice_Laptop_2024.pdf | 14 |
  | how much was the cappuccino | Images/receipt_coffee.png | 15 |
  | Haftpflichtversicherung | Scans/Scanned_Insurance_Letter.pdf | 14 |

- chat: answer and citation **OK**. "Your monthly rent is 950 Euro. The lease started on March 1, 2024. [1]"
  with `[1] Housing/Mietvertrag_2024.pdf`. "Die Kaution beträgt 2.850,00 Euro. [1]" with the same citation.
  `error` was empty both times. First answer **1.2 s**: the model was already loaded by the summary step, so
  there was no extra load time. LLM status: `ready`, `llm-3b`, ctx 6144, `gpu_layers 99`, `backend cuda`,
  `device` empty (see Problem 3).
- live events: re-indexing `Notes/Pancake_Recipe.md` produced `file_processing {"file_id": 7, "rel_path":
  "Notes/Pancake_Recipe.md"}`, then `file_indexed`, then `progress`, then `summary_done`, in the expected order.

## A2.2 GPU build
Each round ran from a fresh backend start. The guide's four questions were asked in rounds A and B, and one
question in round C. Speeds come from `Get-LlmSpeed`.

| build | gpu_layers | device | vram_used_mb | generation_tok_s | prompt_tok_s | errors |
|---|---|---|---|---|---|---|
| CUDA | 99 | *(empty)* | 2233 (nvidia-smi: 2221 MiB) | **72.0** | **2509.6** | none, no OOM |
| Vulkan | 99 | Vulkan1 | 2233 (nvidia-smi: 2147 MiB) | 58.1 | 1611.4 | none, no OOM; first answer took 15.2 s (warm-up) |
| CPU | 0 | — | — | 17.7 | 123.1 | none; correct answer with citation in 9.8 s |

- Every answer in rounds A and B cited a file, and VRAM stayed well under the 3500 MB limit.
- **Chosen build: CUDA.** It is about 24 % faster than Vulkan at generation and about 56 % faster at prompt
  processing, with no errors and no first-answer warm-up. The folders were restored (`cpu`, `cuda`, `vulkan`).
  After a restart, `/models/llm/status` shows `backend cuda`.
- Answers in each round took 0.6–1.0 s, apart from the Vulkan warm-up.

## A2.5 search eval and demo queries
- recall@3 / recall@10: **0.969 / 1.0** (n = 32; same as the developer PC). The only miss in the top 3 is the
  typo `mietvertrg` (rank 4; on its own its first result is `Personal/Lebenslauf_Anna_Schmidt.docx`), as the
  guide expected.
- All 7 candidate searches put the expected file first in **3 of 3 runs** (12–14 ms). All 4 candidate chat
  questions gave the expected answer and cited the expected file in **2 of 2 runs** (0.2–1.4 s).
- final demo queries and expected file:

  | # | type | query | expected | shows |
  |---|---|---|---|---|
  | 1 | search | `rental contract` | Housing/Mietvertrag_2024.pdf | English query finds a German file |
  | 2 | search | `Rechnung für den Laptop` | Finance/Invoice_Laptop_2024.pdf | German query finds an English file |
  | 3 | search | `how much was the cappuccino` | Images/receipt_coffee.png | OCR from a photo |
  | 4 | search | `Haftpflichtversicherung` | Scans/Scanned_Insurance_Letter.pdf | scanned PDF |
  | 5 | search | `slides about supervised learning` | University/Machine_Learning_Intro.pptx | meaning, not keywords |
  | 6 | search | `INV-20417` | Finance/Invoice_Laptop_2024.pdf | exact match |
  | 7 | chat | How much is my monthly rent and when did the lease start? | 950 Euro, 1 March 2024; cites Housing/Mietvertrag_2024.pdf | |
  | 8 | chat | Wie hoch ist die Kaution? | 2.850,00 Euro; cites Housing/Mietvertrag_2024.pdf | |

  These also worked every time: `vacation in Florence by train` → Notes/Urlaubsplanung.md; "Who builds the
  onboarding wizard?" → Developer A (Work/Meeting_Notes_Kickoff.docx); "Wo hat Anna studiert?" → TU Berlin and
  Universität Hamburg (Personal/Lebenslauf_Anna_Schmidt.docx). **Avoid in the demo:** typo queries, and asking
  about the insurance letter in chat (Problem 4).

## A2.7 demo state
- models in `C:\SmartSpaceDemo\models`: 6 files, 2.20 GiB (≈ 2.4 GB). Do not delete before the presentation.
- `C:\SmartSpaceDemoFiles` is indexed (15 indexed / 2 skipped / 0 errors) under `C:\SmartSpaceDemo`.
- offline check: **only a proxy has been done so far.** During a search and a chat question, the backend and
  llama-server processes held **0** non-loopback TCP connections, and both requests worked. The real check (turn
  Wi-Fi off, then run one search and one chat question) still has to be done by hand before the demo. The
  assistant did not turn Wi-Fi off, because that would also cut its own connection.
- frontend (section 8): CORS preflight from `http://localhost:5173` returns 200 with
  `access-control-allow-origin: http://localhost:5173` and `allow-headers: authorization`. Another origin gets
  400. A request without a token returns `{"error": {"code": "UNAUTHORIZED", "message": "Missing or invalid
  token", "details": {}}}`.

## Problems
1. **Guide: `fetch_llama_server.ps1 -Variants cpu,vulkan,cuda` fails when called through `powershell -File`.**
   With `-File`, the comma list arrives as one string:

   ```
   Unknown variant 'cpu,vulkan,cuda' (use cpu, vulkan, cuda)
   At scripts\fetch_llama_server.ps1:40 char:47
   ```

   Workaround used: run the script once per variant (`-Variants cpu`, then `vulkan`, then `cuda`). Possible fix:
   add `$Variants = $Variants -split ','` at the top of the script, or change the guide to use
   `powershell -ExecutionPolicy Bypass -Command "& scripts\fetch_llama_server.ps1 -Variants cpu,vulkan,cuda"`.
2. **Environment only, not a backend bug:** `uv sync --python 3.11` failed when run from inside the Claude desktop
   app, with `Missing expected target directory for Python minor version link at
   %APPDATA%\uv\python\cpython-3.11.18-windows-x86_64-none`. The app is an MSIX package, so its writes to
   `%APPDATA%` are redirected, and that breaks uv's junctions. Fixed by setting
   `UV_PYTHON_INSTALL_DIR=%USERPROFILE%\.local\share\uv\python` for those shells. A normal PowerShell window is
   not affected, but uv will download Python 3.11 again the first time it runs there.
3. **`/models/llm/status` leaves `device` empty with the CUDA build**, where the guide expects e.g. `CUDA0`.
   `llama-server.log` shows `==== start gpu_layers=99 ctx=6144 device=None ====`, so no `--device` is passed and
   llama.cpp uses CUDA device 0. That is the RTX 3050, the only CUDA GPU here, so this works, but the field is
   empty for the UI. Vulkan reports `Vulkan1`. Also, `vram_used_mb` is exactly 2233 for both CUDA and Vulkan,
   while nvidia-smi showed 2221 and 2147 MiB. It looks like an estimate rather than a measurement.
4. **AI quality, insurance letter:** its tags include `health`. In the CUDA round, the answer to "What does the
   insurance letter say about liability?" was "The insurance letter is for a health insurance policy
   (Haftpflichtversicherung), which covers liability. [1]". Haftpflicht means liability, not health. The Vulkan
   round got it right ("liability insurance"). Some `doc_type` labels are also off: `Notes/Pancake_Recipe.md` is
   `lecture`, and `Images/Hinweisschild.jpg` and `Finance/Steuererklaerung_2023.pdf` are `invoice`. Search is not
   affected. These questions are kept out of the demo list.
5. Minor: in guide section 10, the A2.2 table header has 7 columns but its separator row has 6. The table above
   uses 7.

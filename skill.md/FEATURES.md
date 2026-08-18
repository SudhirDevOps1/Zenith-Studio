# 🚀 FEATURES (CodeStudio Evolution & Matrix)

## 1. What was built recently? (v1.0.4 Release)
* **System Node.js NetBridge (`electron/netBridge.js`):** Standalone subprocess bridge executed via Windows-trusted `node.exe` engine. Completely bypasses Windows Defender / Firewall `ERR_NETWORK_ACCESS_DENIED` blocks on `electron.exe`.
* **Universal Custom Provider Engine & Presets (`AiSetupModal.tsx`):** 1-click preset integrations for Together AI, Cerebras, LM Studio, Ollama, vLLM, DeepInfra, Mistral, SambaNova, and arbitrary OpenAI-compatible custom endpoints with dual-verification test suites.
* **Reasoning LLM Multi-Token Support (`aiService.ts`):** Robust response parsing handling `choices[0].message.reasoning` for OpenAI OSS (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`) and DeepSeek R1 models.
* **Open VSX Marketplace NetBridge Integration:** 100% firewall-immune live extension browsing, searching, and downloads.
* **Multi-File Agentic AI ("Composer Mode") (`useComposerStore.ts` & `AiComposerModal.tsx`):** Cursor-grade multi-file code planner and auto-diff patcher (`Ctrl+Shift+I` / `Ctrl+I`) with workspace context scanning, file selection, and 1-click **Accept All Files** patching.
* **Interactive Step-by-Step Debugger UI (`DebugToolbar.tsx` & `DebugPanel.tsx`):** Monaco Gutter Red Breakpoints (`glyphMargin`), floating draggable step execution toolbar (`Continue`, `Step Over`, `Step Into`, `Step Out`, `Stop`), Call Stack trace, Variables tree, and Watch expressions panel.
* **3-Way Visual Git Merge Conflict Resolver (`conflictParser.ts` & `conflictCodeLens.ts`):** Inline Monaco CodeLens actions (`🟢 Accept Current Change`, `🟣 Accept Incoming Change`, `Accept Both`) with emerald/cyan background decorations and 1-click conflict resolution.
* **Full Language Server & Cross-File Intellisense (`languageServer.ts`):** Full TypeScript/JavaScript Language Service compiler options with ambient React type definitions, JSON schema validation, and dynamic cross-file extraLib synchronization across all workspace files.
* **Native Full System Shell Execution:** Full PATH & environment inheritance in Electron (`terminal:execCommand`) for zero-friction execution of MinGW GCC, Python 3.12, Node, Git, and Cargo.
* **100% Reliable Open VSX Marketplace Search:** Native Electron IPC search + multi-proxy web fallback for instant, CORS-free extension and theme searches.
* **Advanced Customizable Integrated Terminal:** Multi-session tabs (`PowerShell`, `CMD`, `Git Bash`, `Node.js`, `Python`), dual split-pane execution, 8 color themes (Matrix, Cyberpunk, Dracula, OLED Black), custom font selector, prompt glyphs (`❯`, `➜`, `$`), `Ctrl + F` buffer search, log export, and 1-click Quick Task Runner chips.


* **Universal AI Multi-Provider & Model Discovery (`AiSetupModal.tsx`):** Complete integration for Google Gemini, OpenAI, Claude, Groq, OpenRouter, DeepSeek, Ollama, and Custom OpenAI-compatible endpoints with `/v1/models` remote auto-discovery, manual model override priority, and millisecond latency test.
* **Native System Python 3.12 & MinGW GCC/G++ Execution:** Direct execution of local Python 3.12 and MinGW GCC/G++ compilers with Windows PATH environment support and 1-click `▶ Run` button in `TabsBar.tsx`.

* **Universal Multi-Language Code Formatter:** Prettier-style formatting for JS/TS/JSX/TSX, HTML/SVG, CSS/SCSS, JSON, Markdown, and Python (`Shift + Alt + F` and format-on-save).
* **Problems & Diagnostics Panel:** Live Monaco marker sync with real-time error/warning counters in StatusBar and instant jump-to-line navigation.
* **Clean Code Viewport:** 100% full-screen Monaco editor for YAML, JSON, and source code files with zero unwanted empty preview sidebars.
* **Extensions Marketplace (`Ctrl+Shift+X`):** Live Open VSX API registry search, 10 curated editor themes (One Dark Pro, Catppuccin, Tokyo Night, SynthWave '84, etc.), linters, formatters, and snippets with IndexedDB persistence.
* **Simple Browser & Webview:** Built-in browser with internet access, localhost dev server preview, navigation history, and responsive viewport presets.
* **Native System File & Folder Opening:** OS native folder scan via Electron IPC + browser File System Access API (`showDirectoryPicker()`).

* **Standalone Mermaid & Markdown Preview:** Direct SVG rendering of `.mermaid` and `.mmd` diagrams with synchronized scrolling.
* **Integrated Terminal:** Full command line interface with workspace state commands (`ls`, `cat`, `touch`, `rm`, `open`, `stats`, `eval`).
* **Binary File Safety:** Base64 binary-safe import/export for Excel (`.xlsx`, `.xls`), images, PDFs, and ZIP archives.
* **Dual Platform Delivery:** Singlefile web bundle deployed on Cloudflare Pages (`https://zenith-studio-web.pages.dev/`) + Windows `.exe` setup installer.


## 2. What should be added? (Future 2027 Vision)
* **WebRTC Pair Programming:** Real-time peer-to-peer collaborative multi-cursor coding directly in browser.
* **WebAssembly Language Server Protocol (Wasm-LSP):** Clangd, Pyright, and Rust-analyzer running entirely inside WebAssembly workers.
* **AI Copilot with Local WebGPU:** On-device code completion and chat using quantized local models without API costs.

---
**Linked Files:** [MANIFEST.md](MANIFEST.md) | [TODO.md](TODO.md) | [CHANGELOG.md](CHANGELOG.md)

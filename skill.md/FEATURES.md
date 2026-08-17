# 🚀 FEATURES (CodeStudio Evolution & Matrix)

## 1. What was built recently? (v1.0.3 Release)
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
* **Dual Platform Delivery:** Singlefile web bundle deployed on Cloudflare Pages (`https://codestudio-web-app.pages.dev/`) + Windows `.exe` setup installer.

## 2. What should be added? (Future 2027 Vision)
* **WebRTC Pair Programming:** Real-time peer-to-peer collaborative multi-cursor coding directly in browser.
* **WebAssembly Language Server Protocol (Wasm-LSP):** Clangd, Pyright, and Rust-analyzer running entirely inside WebAssembly workers.
* **AI Copilot with Local WebGPU:** On-device code completion and chat using quantized local models without API costs.

---
**Linked Files:** [MANIFEST.md](MANIFEST.md) | [TODO.md](TODO.md) | [CHANGELOG.md](CHANGELOG.md)

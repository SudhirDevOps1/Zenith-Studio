# 🧠 CodeStudio Vibe Coding Brain

> This is your persistent memory. **READ THIS FIRST** on every invocation. **UPDATE THIS** before ending your turn.

## 📋 Current Project Status
* **Project:** CodeStudio (Production-Grade VS Code / VSCodium Alternative)
* **Version:** `1.0.3` (Production Released & Tagged)
* **Active Enhancement:** Advanced Customizable Integrated Terminal (Multi-Tabs, Split View, Themes, Quick Task Runners) — COMPLETED


## 🎯 Project Overview
* **Goal:** A modern, lightweight, high-performance web and desktop code editor alternative to VS Code/VSCodium.
* **Tech Stack:**
  - **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Lucide React icons
  - **State Management & Storage:** Zustand, IndexedDB (`idb-keyval`)
  - **Desktop App:** Electron, Electron Builder (`nsis`, `portable`)
  - **Previews & Execution:** Local System Python 3.12 (`python.exe`), MinGW GCC/G++ (`gcc.exe`), Pyodide (Wasm Web), Babel standalone (TS/JS), Mermaid.js, XLSX, DOMPurify
  - **Live Web Deployment:** Cloudflare Pages ([https://codestudio-web-app.pages.dev/](https://codestudio-web-app.pages.dev/))
  - **Registry:** Open VSX Extensions API (`https://open-vsx.org/api/`)
  - **AI Providers:** Google Gemini, OpenAI, Claude, Groq, OpenRouter, DeepSeek, Ollama, and Custom OpenAI-Compatible Endpoints with remote `/v1/models` discovery

## 🏗️ Architectural Decisions
* `[2026-08-17]` - Decided to use Monaco Editor with dynamic theme registration (`monaco.editor.defineTheme`) for 10 custom themes.
* `[2026-08-17]` - Integrated Open VSX API registry for live extension package search with offline fallback.
* `[2026-08-17]` - Implemented File System Access API (`showDirectoryPicker`) for browser folder access and native Electron IPC recursive folder scanning.
* `[2026-08-17]` - Added Built-in Simple Browser Webview with full internet and localhost access.
* `[2026-08-17]` - Configured Electron `webPreferences: { webviewTag: true, webSecurity: false }` for zero-CORS dev server testing.
* `[2026-08-17]` - Universal AI Engine: Remote model discovery queries `/v1/models` while prioritizing manually defined models and custom presets first without overwriting.
* `[2026-08-17]` - Native Windows Shell & Compiler: `code:runNative` in Electron uses `shell: true` and `process.env` to inherit system PATH for MinGW GCC/G++ and local Python 3.12.
* `[2026-08-17]` - Clean Viewport: Monaco Editor takes 100% full-screen width on YAML, JSON, and source code files, eliminating unwanted empty preview placeholder sidebars.
* `[2026-08-17]` - Advanced Terminal: Multi-tab session architecture with Zustand state persistence, dual split-pane execution, 8 color themes, and custom Quick Task Runner chips.

## 📝 Pending / Verified Status
* [x] TypeScript Strict Mode passes with 0 errors (`npx tsc --noEmit`).
* [x] Singlefile production build passes (`npm run build` -> `dist/index.html` 9.63 MB).
* [x] Advanced Integrated Terminal with Multi-Tabs, Split View, Themes, and Quick Runners.
* [x] All version references synchronized to `1.0.3`.
* [x] Git Tag `v1.0.3` created locally.



## 📂 System File Pointers (For AI Reference)
* **The Core Brain (Router & Rules):** `01_SYSTEM_CORE.md`
* **Design & UI Rules:** `02_PRODUCT_DESIGN.md`
* **Code & Engineering:** `03_ENGINEERING_STANDARDS.md`
* **Security & Testing:** `04_SECURITY_TESTING.md`
* **Deployment & Skills:** `05_DEPLOYMENT_MAINTAIN.md`
* **Skills Folder:** `skills/`

## 🧠 [LESSONS] — Permanent Error Log
* `[2026-08-17]` - When working with base64 binary files (images, Excel, PDFs), avoid UTF-8 decoding to prevent string corruption; decode directly into binary Uint8Arrays for ZIP archiving and blob creation.
* `[2026-08-17]` - In PowerShell script generation, avoid double quotes when interpolating `$1` or `$2` regex replacements to prevent PowerShell variable expansion.
* `[2026-08-17]` - In Electron desktop execution on Windows, always pass `{ shell: true, env: process.env }` to `execFile` so environment PATHs (MinGW, Python) are resolved accurately.
* `[2026-08-17]` - Rule: Never recreate `docs/` folder; maintain all project intelligence and tracking exclusively inside `skill.md/` folder.

---
**Related Files:** [MANIFEST.md](MANIFEST.md) | [CHANGELOG.md](CHANGELOG.md) | [FEATURES.md](FEATURES.md) | [TODO.md](TODO.md)


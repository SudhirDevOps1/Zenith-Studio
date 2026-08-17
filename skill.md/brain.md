# 🧠 CodeStudio Vibe Coding Brain

> This is your persistent memory. **READ THIS FIRST** on every invocation. **UPDATE THIS** before ending your turn.

## 📋 Current Project Status
* **Project:** CodeStudio (Production-Grade VS Code / VSCodium Alternative)
* **Phase:** Production Complete & Deployment Ready
* **Active Task:** Extensions Marketplace, Webview & Internet Access, Electron Desktop Build & Web Live Deploy

## 🎯 Project Overview
* **Goal:** A modern, lightweight, high-performance web and desktop code editor alternative to VS Code/VSCodium.
* **Tech Stack:**
  - **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), Lucide React icons
  - **State Management & Storage:** Zustand, IndexedDB (`idb-keyval`)
  - **Desktop App:** Electron, Electron Builder (`nsis`, `portable`)
  - **Previews & Execution:** Pyodide (Python), Babel standalone (TS/JS), Mermaid.js, XLSX, DOMPurify
  - **Live Web Deployment:** Cloudflare Pages ([https://codestudio-web-app.pages.dev/](https://codestudio-web-app.pages.dev/))
  - **Registry:** Open VSX Extensions API (`https://open-vsx.org/api/`)

## 🏗️ Architectural Decisions
* `[2026-08-17]` - Decided to use Monaco Editor with dynamic theme registration (`monaco.editor.defineTheme`) for 10 custom themes.
* `[2026-08-17]` - Integrated Open VSX API registry for live extension package search with offline fallback.
* `[2026-08-17]` - Implemented File System Access API (`showDirectoryPicker`) for browser folder access and native Electron IPC recursive folder scanning.
* `[2026-08-17]` - Added Built-in Simple Browser Webview with full internet and localhost access.
* `[2026-08-17]` - Configured Electron `webPreferences: { webviewTag: true, webSecurity: false }` for zero-CORS dev server testing.

## 📝 Pending / Verified Status
* [x] TypeScript Strict Mode passes with 0 errors (`npm run typecheck`).
* [x] Singlefile production build passes (`npm run build`).
* [x] Electron Windows setup installer configured (`npm run electron:build`).

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

---
**Related Files:** [MANIFEST.md](MANIFEST.md) | [CHANGELOG.md](CHANGELOG.md) | [FEATURES.md](FEATURES.md) | [TODO.md](TODO.md)

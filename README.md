# 🚀 Zenith Studio — Production-Grade Universal AI Code & Text Editor

<p align="center">
  <img src="public/icon.png" width="120" alt="Zenith Studio Logo" style="border-radius: 20px;" />
</p>

<p align="center">
  <strong>The Ultra-Fast, Lightweight, and Extensible AI-Native VS Code / Cursor Alternative for Web & Desktop</strong>
</p>

<p align="center">
  <a href="https://zenith-studio-web.pages.dev/"><img src="https://img.shields.io/badge/Live%20Demo-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflarepages&logoColor=white" alt="Live Demo" /></a>
  <a href="https://github.com/SudhirDevOps1/Zenith-Studio.git"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo" /></a>
  <a href="https://github.com/SudhirDevOps1/Zenith-Studio/actions"><img src="https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions" /></a>
  <img src="https://img.shields.io/badge/TypeScript-Strict%200%20Errors-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Monaco%20Editor-100%25%20Offline%20Bundled-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="Monaco Editor" />
  <img src="https://img.shields.io/badge/Electron-Windows%20Setup%20.exe-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/Version-v1.0.4%20Production-success?style=for-the-badge" alt="Version" />
</p>

---

## 📌 Quick Access & Deployment
- 🌐 **Live Web Application**: [https://zenith-studio-web.pages.dev/](https://zenith-studio-web.pages.dev/)
- 📦 **GitHub Repository**: [https://github.com/SudhirDevOps1/Zenith-Studio.git](https://github.com/SudhirDevOps1/Zenith-Studio.git)
- 🚀 **GitHub Releases & `.exe` Downloads**: [https://github.com/SudhirDevOps1/Zenith-Studio/releases](https://github.com/SudhirDevOps1/Zenith-Studio/releases)
- 💻 **Desktop Executable (`.exe`)**: Built via `npm run electron:build` (Outputs `Zenith Studio Setup 1.0.4.exe` NSIS Installer and portable executable in `dist-electron/`)
- ⚡ **Zero Setup Required**: Open directly in any modern browser or run as a standalone desktop executable on Windows.

---

## 🌟 Key Architecture & Breakthrough Features

### 🛡️ 1. System Node.js NetBridge & Windows Defender Bypass (`electron/netBridge.js`)
- **100% Windows Firewall & Defender Immunity**: Spawns a dedicated standalone process through system `node.exe` (whitelisted by OS firewall) to execute network calls via IPC, eliminating `net::ERR_NETWORK_ACCESS_DENIED` blocks on `electron.exe`.
- **Zero-CORS Multi-Hop Networking**: Powers all AI provider requests and Open VSX marketplace searches with automatic redirect resolution (up to 5 hops) and direct socket fallbacks.
- **QUIC / HTTP3 Protocol Immunity**: Includes Chromium switches `--disable-quic` and `--disable-http2-grease` with dual-layer TLS socket fallback to guarantee 0 dropped packets.

### 🤖 2. Universal Custom Provider Engine & 8 Quick Presets
Zenith Studio connects to any AI provider in the world with zero vendor lock-in:
- **Supported Providers**: Google Gemini (Flash 2.0, Pro 1.5), OpenAI (GPT-4o, o3-mini), Anthropic Claude (3.5 Sonnet, 3.5 Haiku), Groq, OpenRouter, DeepSeek, Ollama (Local), and Custom Endpoints.
- **1-Click Quick Presets**: Built-in instant configuration chips for **Together AI**, **Cerebras**, **LM Studio**, **Ollama**, **vLLM**, **DeepInfra**, **Mistral**, and **SambaNova**.
- **Reasoning LLM Token Extraction**: Seamlessly extracts `choices[0].message.reasoning` alongside `content` for **OpenAI OSS** (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`) and **DeepSeek R1**.
- **Dynamic Model Discovery & Priority Override**: Auto-queries `/v1/models` while prioritizing user presets and manual model inputs.
- **Live Ping & Round-Trip Validation**: Real per-provider HTTP test with millisecond latency reporting.

### 🧩 3. Open VSX Extensions Marketplace (`Ctrl + Shift + X`)
Full-featured VSCodium-compatible extensions ecosystem:
- **Live Popular Feed**: Automatically loads community top-downloaded extensions on launch (`sortBy=downloadCount`).
- **Race-Condition Locked Search**: Atomic sequence counter locks search responses, preventing stale async queries from overwriting results.
- **Curated Local + Remote Catalog**: Instant 1-click install for themes (One Dark Pro, Catppuccin, Tokyo Night, Dracula), linters, formatters, and snippets.
- **IndexedDB Persistence**: All installed extensions and active preferences persist locally in IndexedDB (`idb-keyval`).

### 💻 4. Advanced Integrated Terminal (`` Ctrl + ` ``)
- **Dedicated MenuBar & Status Access**: Access via top **Terminal** menu (`New Terminal`, `Toggle`, `Split`, `Clear`), View menu, ActivityBar, and bottom StatusBar button (`>_ Terminal`).
- **Multi-Session Tabs**: Run PowerShell, CMD, Git Bash, Node.js, and Python concurrently with tab rename and kill controls.
- **Dual Split-Pane Layout**: Run tests and live dev servers side-by-side.
- **Customizable Environment**: 8 terminal themes (Matrix, Cyberpunk, Dracula, OLED Black), prompt glyphs (`❯`, `➜`, `$`), `Ctrl + F` buffer search, and 1-click Quick Task Runner chips.

### 🪄 5. Multi-File Agentic AI ("Composer Mode") (`Ctrl + Shift + I`)
- **Cursor-Grade Multi-File Composition**: Formulates architectural plans across multiple workspace files from a single natural language prompt.
- **Interactive Diff Reviewer**: Side-by-side diff previews with line-by-line inspection.
- **1-Click Patching**: Click **"Accept All Files"** to apply changes across all targeted files atomically.

### 🐛 6. Interactive Step-by-Step Debugger UI (DAP)
- **Monaco Gutter Breakpoints**: Click the editor glyph margin to place visual red breakpoints.
- **Floating Draggable Toolbar**: Step Over (`F10`), Step Into (`F11`), Step Out (`Shift+F11`), Continue (`F5`), and Stop (`Shift+F5`).
- **Run & Debug Panel**: Call Stack hierarchy, Variables Scope inspector, and Watch expressions.

### 🌿 7. 3-Way Visual Git Merge Conflict Resolver
- **Interactive Monaco CodeLens**: Highlights `<<<<<<< HEAD`, `=======`, and `>>>>>>>` blocks with dedicated 1-click action buttons:
  - `🟢 Accept Current Change`
  - `🟣 Accept Incoming Change`
  - `Accept Both Changes`
- **Full Source Control Panel (`Ctrl + Shift + G`)**: Staging, custom commit messages, and commit timeline history.

### 📁 8. Native File Explorer & Workspace Tools (`Ctrl + O`, `Ctrl + Shift + O`)
- **HTML5 Drag & Drop**: Drag files and folders into folder targets with visual highlight outlines.
- **System Folder Scan**: Full recursive directory opening via native Electron dialogs and browser File System Access API.
- **Quick Open (`Ctrl + P`) & Go to Line (`Ctrl + G`)**: Sub-millisecond fuzzy search and line navigation.
- **Global Search & Replace (`Ctrl + Shift + F`)**: Workspace-wide regex search with batch Replace All.
- **Spreadsheet & Media Previews**: Built-in SheetJS tabular viewer for Excel (`.xlsx`, `.xls`, `.csv`), SVG editor sync, video/audio players, and multi-page PDF rendering.

---

## ⌨️ Complete Keyboard Shortcuts Cheatsheet

| Category | Shortcut | Action |
|---|---|---|
| **AI & Composition** | `Ctrl + Shift + I` / `Ctrl + I` | **Open Multi-File AI Composer** |
| | `Ctrl + Shift + A` | Focus AI Assistant Chat Panel |
| **Navigation** | `Ctrl + P` | **Quick Open File Switcher** |
| | `Ctrl + G` | **Go to Line Number (`:line`)** |
| | `Ctrl + Shift + P` | Open Command Palette |
| | `Ctrl + Shift + X` | Extensions Marketplace |
| | `Ctrl + Shift + E` | Focus File Explorer |
| | `Ctrl + Shift + F` | **Focus Workspace Search & Replace** |
| | `Ctrl + Shift + G` | Source Control / Git |
| | `` Ctrl + ` `` | Toggle Integrated Terminal |
| | `F1` / `Ctrl + /` | Keyboard Shortcuts Help |
| **File Operations** | `Ctrl + O` | Open File from System |
| | `Ctrl + Shift + O` | Open Folder from System |
| | `Ctrl + S` | Save Active File |
| | `Ctrl + W` | Close Active Tab |
| | `Ctrl + F` | Monaco In-File Find & Replace |
| | `Shift + Alt + F` | Format Document (Prettier) |
| | `Esc` | Close Modals / Exit Zen Mode |
| **Multi-Cursor Editing** | `Alt + Click` | Add Multiple Cursors |
| | `Ctrl + Alt + Up/Down` | Add Cursor Above/Below |
| | `Shift + Alt + Down` | Duplicate Line Down |

---

## 🛠️ Tech Stack & Architecture

```
Zenith Studio Core Stack
├── Frontend Engine: React 19 + Vite 7 + Tailwind CSS 4
├── Code Editing: Monaco Editor Core (@monaco-editor/react + 100% offline bundled)
├── Network Engine: System Node.js NetBridge (electron/netBridge.js) + Chromium safeStorage
├── Extensions Engine: Zustand + IndexedDB (idb-keyval) + Open VSX API
├── Desktop Runtime: Electron 43 + Electron Builder (NSIS / Portable)
├── CI/CD & Builds: GitHub Actions (.github/workflows/build.yml)
├── Media & Previews: SheetJS (XLSX) + Mermaid.js + react-markdown + Babel
└── Single-File Bundle: vite-plugin-singlefile (Direct file:// load & Cloudflare Pages)
```

---

## 🚀 Getting Started & Build Commands

### 1. Installation
```bash
git clone https://github.com/SudhirDevOps1/Zenith-Studio.git
cd Zenith-Studio
npm install
```

### 2. Local Web Development
```bash
npm run dev
# Starts local Vite dev server at http://localhost:5173
```

### 3. TypeScript Strict Verification
```bash
npm run typecheck
# Strict tsc --noEmit verification (0 errors)
```

### 4. Production Web Build
```bash
npm run build
# Generates optimized singlefile bundle in dist/index.html (~10.5MB / 3.2MB gzipped)
```

### 5. Desktop Development (Electron)
```bash
npm run electron:dev
# Launches hot-reloading desktop window with System Node NetBridge
```

### 6. Build Windows Executable Installer (`.exe`)
```bash
npm run electron:build
# Generates Zenith Studio Setup 1.0.4.exe (NSIS Installer) and Portable executable in dist-electron/
```

---

## 🥊 Zenith Studio vs VS Code / VSCodium / Cursor

| Feature | Standard VS Code | Cursor | Zenith Studio |
|---|---|---|---|
| **Multi-File AI Composer** | ❌ None | ✅ Paid Subscription | **✅ Built-in (`Ctrl+Shift+I`)** |
| **Custom LLM Presets** | ❌ Extension needed | ⚠️ Limited | **✅ 8 Presets + Any Endpoint** |
| **Firewall Bypass NetBridge** | ❌ Subject to OS blocks | ❌ Subject to OS blocks | **✅ 100% System Node Bridge** |
| **Reasoning Tokens (OSS 120B/R1)** | ❌ Manual parse | ⚠️ Cloud only | **✅ Native Reasoning Extraction** |
| **Open VSX Marketplace** | ❌ Proprietary only | ❌ Proprietary only | **✅ Live Open VSX Feed & Search** |
| **Step-by-Step Debugger** | ⚠️ Complex config | ⚠️ Complex config | **✅ Gutter Red Breakpoints & DAP** |
| **3-Way Git Conflict Resolver** | ⚠️ Extension needed | ⚠️ Extension needed | **✅ Built-in CodeLens Actions** |
| **Monaco Offline Bundle** | Local | Local | **✅ 100% Offline (0 CDN Delay)** |
| **Spreadsheet Viewer** | ❌ Extension needed | ❌ Extension needed | **✅ Built-in SheetJS (Excel, CSV)** |
| **Carbon Code Snapshots** | ❌ Extension needed | ❌ Extension needed | **✅ Built-in Image Generator** |
| **Privacy & Telemetry** | ⚠️ Microsoft Telemetry | ⚠️ Cloud Analytics | **✅ 100% Client-side, Zero Tracking** |

---

## 📜 License
Distributed under the **MIT License**. Free for personal, commercial, and open-source use.

---

<p align="center">
  Crafted with ❤️ by <strong>SudhirDevOps</strong> • Universal Zenith Studio AI Editor
</p>
<p align="center">
  <strong>⭐ Star this repository on GitHub if you love this project!</strong>
</p>


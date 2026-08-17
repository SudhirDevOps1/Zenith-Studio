---
name: codestudio-capabilities
description: Comprehensive architecture, feature matrix, and AI integration guidelines for CodeStudio.
---

# 🚀 CodeStudio — System Architecture & Capabilities

CodeStudio is a lightweight, high-performance, and extensible IDE built with Electron, React 19, Tailwind CSS, Monaco Editor, and Zustand.

---

## 🤖 1. AI Assistant & Multi-Provider Engine
CodeStudio provides a unified LLM interface supporting multiple providers:
- **Google Gemini**: Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash
- **OpenAI**: GPT-4o, GPT-4o-mini, o1, o3-mini, GPT-4 Turbo
- **Anthropic Claude**: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus
- **Groq**: Llama 3.3 70B, DeepSeek R1 Distill, Mixtral 8x7B
- **OpenRouter**: Unified model hub
- **DeepSeek**: DeepSeek V3, DeepSeek R1 Reasoner
- **Ollama**: Local offline LLMs (`http://localhost:11434`)
- **Custom Provider**: Any OpenAI-compatible REST API endpoint

### ⚡ Model Auto-Detection & Live Test
- **`detectProviderModels(settings)`**: Dynamically queries the provider's `/models` endpoint to retrieve active models available on the user's API key.
- **`testAiConnection(settings)`**: Sends a test ping to measure roundtrip latency in milliseconds (`ms`).

---

## 🪄 2. Code Formatter Engine (`src/utils/codeFormatter.ts`)
- **Supported Languages**: JS, TS, JSX, TSX, HTML, XML, SVG, CSS, SCSS, Less, JSON, Markdown, Python
- **Keybindings**: `Shift + Alt + F` (Format Document), `Ctrl + S` (Format on Save)

---

## ⚠️ 3. Problems & Diagnostics Panel (`src/components/ui/ProblemsPanel.tsx`)
- Tracks live Monaco syntax markers, errors, and warnings.
- Real-time counter badge in StatusBar (`AlertCircle`, `AlertTriangle`).
- One-click navigation to jump directly to exact line and column in editor.

---

## 🔍 4. Editor Visual & Zoom Controls
- **Zoom In**: `Ctrl + =`, `Ctrl + Shift + =`, `Ctrl + NumpadAdd`
- **Zoom Out**: `Ctrl + -`, `Ctrl + NumpadSubtract`
- **Reset Zoom**: `Ctrl + 0`, `Ctrl + Numpad0`
- **Mouse Wheel Zoom**: `Ctrl + Mouse Wheel`
- **Visual Features**: Bracket Pair Colorization, Sticky Scroll, Font Ligatures, Indent Guides.

---

## ⚡ 5. Native Code Execution Engine (`electron/main.js` & `AdvancedCodeRunner.tsx`)
- **C & C++ (GCC/G++)**: Automatically locates system `gcc` or `g++` via Windows PATH (e.g., `C:\MinGW\bin\gcc.exe`) and compiles with `-O2 -std=c17` / `-std=c11`.
- **Python 3.x**: Automatically detects and executes installed system Python (`python.exe`, `py.exe`, `python3.exe`) directly on the local machine with unbuffered `-u` flag.
- **Web Browser Fallback**: Pyodide WebAssembly engine executes Python in offline/browser environments when not in Electron.
- **Node.js & Go & Rust**: Supported natively inside Electron desktop.
- **Quick Run Action**: Top `TabsBar` includes a direct 1-click `Run` button (`Play` icon) for runnable files (`.py`, `.c`, `.cpp`, `.js`, `.ts`).

---

## 📄 6. Clean File Viewport & Preview Separation
- **Code Files** (`.yml`, `.yaml`, `.json`, `.py`, `.ts`, `.cpp`, etc.): Always take 100% of the Monaco Editor workspace without unwanted placeholder sidebars.
- **Structured Data Previews** (`.csv`, `.tsv`, `.xlsx`): Dedicated spreadsheet viewer.
- **Markup Previews** (`.md`, `.html`, `.svg`): Dynamic split preview side-by-side with Monaco.
- **Media Previews** (`.png`, `.jpg`, `.mp4`, `.mp3`, `.pdf`): Full viewport interactive media player.


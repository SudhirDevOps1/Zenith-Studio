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

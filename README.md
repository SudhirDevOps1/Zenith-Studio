# 🚀 CodeStudio — Next-Gen Universal Code & Text Editor

<p align="center">
  <img src="public/icon.png" width="120" alt="CodeStudio Logo" />
</p>

<p align="center">
  <strong>React 19 + Vite 7 + Tailwind CSS 4 + Monaco Editor + Electron</strong>
</p>

<p align="center">
  🌐 Browser Me Chale • 💻 Desktop App Bane • 📦 GitHub Ready • 🔥 Production-Grade • ⚡ Ultra Fast
</p>

---

## 📌 GitHub Repository
- **Repository URL**: [`https://github.com/SudhirDevOps1/CodeStudio.git`](https://github.com/SudhirDevOps1/CodeStudio.git)
- **Production Build Size**: ~4.4MB (gzipped: 1.24MB)
- **Zero Errors** • **Zero Warnings** • **TypeScript Strict Mode**

---

## ✨ Key Features

### 🎨 Professional In-App Dialogs (No Browser Prompts!)
| Feature | Description |
|---------|-------------|
| **Custom Modal System** | Beautiful dark-themed dialogs for file creation, folder creation, and user inputs |
| **No Browser `prompt()`** | Sab kuch app ke andar hota hai, browser ka prompt nahi dikhta |
| **OK/Cancel Buttons** | Professional button styling with keyboard support (Enter, Escape) |
| **File Extension Suggestions** | New file dialog mein popular extensions ki suggestions |

### ⚙️ Code Compile & Run Options
| Runtime | Status | Notes |
|---------|--------|-------|
| **JavaScript Runner** | ✅ Built-in | Runs inside browser with console output and timing |
| **Python Pyodide Runner** | ✅ Optional | Enable from Settings. Loads Pyodide from CDN when first used |
| **C / C++ GCC Runner** | ✅ Electron Desktop | Requires gcc/g++ installed in PATH. Works in `.exe`, `.dmg`, `.deb` desktop app |
| **Cloudflare Sandbox SDK/Worker** | ✅ Optional | Enable from Settings and add your Cloudflare Worker endpoint |

### 🧩 Built-In Extension Manager
| Extension | Description |
|-----------|-------------|
| **Monaco Editor Core** | Syntax highlighting, minimap, multi-cursor |
| **Media Preview Pack** | Image, PDF, SVG, CSV, TSV, JSON, XLSX previews |
| **Spreadsheet Viewer** | Excel/CSV/JSON table rendering |
| **Native GCC/G++ Runner** | Desktop C/C++ compile and run |
| **Pyodide Python Runner** | Optional Python execution |
| **Cloudflare Sandbox Connector** | Optional serverless sandbox execution |

### 📸 Built-In Code Snapshot Image Export
| Feature | Description |
|---------|-------------|
| **Code to PNG** | Active code ko beautiful PNG image mein export karo |
| **No VS Code Extension Needed** | Carbon/SnapCode jaise effect app mein hi built-in hai |
| **Themes** | Blue, Purple, Emerald snapshot backgrounds |
| **Branding** | Footer mein `Generated with CodeStudio by SudhirDevOps1` |

### 📦 ZIP File Auto-Extraction
| Feature | Description |
|---------|-------------|
| **Drag & Drop ZIP** | ZIP file ko drag karke drop karo, auto-extract hoga |
| **Preserves Structure** | Folder structure maintain hoti hai extract hone ke baad |
| **File Upload Button** | Upload button se bhi ZIP select kar sakte ho |
| **Toast Notifications** | Extraction success/error messages |

### 🖼️ Universal File Previews
| File Type | Preview Support |
|-----------|----------------|
| **Images** (PNG, JPG, GIF, WebP, ICO) | Zoom, Rotate, Fullscreen, Download |
| **PDF Documents** | Page navigation, Zoom controls, Download |
| **SVG Graphics** | Live preview + Edit mode, Save changes back to file |
| **Spreadsheets** (CSV, TSV, JSON) | Table view with headers, row numbers, scrollable |
| **Excel** (XLS, XLSX, XLSM) | SheetJS powered workbook preview |
| **Audio/Video** | Built-in audio/video player with download |
| **Markdown** | Live preview with Mermaid diagrams |
| **HTML** | Live sandbox with responsive viewports |
| **JavaScript/TypeScript** | Interactive console with execution timer |

### 🌿 Git Source Control Panel
- Modified files ka live list with "M" badge
- Stage/Unstage individual files
- Stage All functionality
- Commit with custom message
- Commit history with timestamps
- Branch indicator (main)

### ✨ Snippets Library
| Snippet | Description |
|---------|-------------|
| **React Component (TSX)** | Functional component with props interface |
| **Mermaid Sequence Diagram** | API flow with actors and participants |
| **Mermaid Flowchart** | Conditional flowchart template |
| **Tailwind Glassmorphism Card** | Modern glassmorphism UI component |
| **Async Fetch with Error Handling** | TypeScript async/await pattern |
| **Markdown Table** | Pre-formatted table template |
| **SQL JOIN Query** | Multi-table SELECT query |

### 🎨 Advanced Customization
| Setting | Options |
|---------|---------|
| **6 Color Themes** | VS Code Dark, Dracula, Nord, Monokai Pro, GitHub Dark, Light |
| **6 Accent Colors** | Electric Blue, Deep Purple, Emerald, Amber, Rose, Cyan |
| **Cursor Styles** | Line (\|), Block (█), Underline (\_) |
| **Auto-Closing Brackets** | Always, Language Defined, Never |
| **Font & Tab Settings** | Size (10-28px), Family, Tab size (2/4 spaces) |

### ⌨️ Keyboard Shortcuts (F1 for Help)
| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+S` | Save File |
| `Ctrl+W` | Close Tab |
| `Ctrl+F` | Find & Replace |
| `Ctrl+Shift+E` | Explorer Sidebar |
| `Ctrl+Shift+F` | Global Search |
| `` Ctrl+` `` | Toggle Terminal |
| `F1` or `Ctrl+/` | Keyboard Shortcuts Help |
| `Esc` | Close Panels / Exit Zen Mode |

### 💻 Integrated Terminal
- Custom commands: `help`, `clear`, `date`, `ls`, `pwd`, `echo`, `whoami`, `version`, `theme`
- Resizable panel with drag handle
- Maximize/Minimize support
- Command history with timestamps

### 🔒 Privacy & Security
- **100% Client-Side** — No server, no backend
- **IndexedDB Storage** — Files persist locally in browser
- **No Telemetry** — Zero tracking, zero analytics
- **Offline Working** — Works without internet

---

## 🚀 How to Use

### Web Version (No Installation)
```bash
npm install
npm run dev
# Open http://localhost:5173
```

### Build for Production
```bash
npm run build
# Output: dist/index.html (single file, ~4.4MB)
```

### Desktop App (Electron)
```bash
npm run electron:dev     # Development mode
npm run electron:build   # Build .exe / .dmg / .deb
```

### Deploy to GitHub Pages / Vercel / Netlify
```bash
npm run build
cp dist/index.html dist/404.html  # For SPAs
git add dist
git commit -m "Deploy"
git push origin main
```

---

## 📂 Project Structure

```
codestudio/
├── public/
│   └── icon.png                    # App icon (1024x1024)
├── electron/
│   ├── main.js                     # Electron main process
│   └── preload.js                  # Secure IPC bridge
├── src/
│   ├── components/
│   │   ├── editor/                 # Monaco Editor + themes
│   │   ├── filetree/               # File explorer with dialogs
│   │   ├── preview/                # All file preview components
│   │   │   ├── MarkdownPreview.tsx
│   │   │   ├── HtmlPreview.tsx
│   │   │   ├── JsSandboxPreview.tsx
│   │   │   ├── ImagePreview.tsx    # 🆕 Image zoom/rotate
│   │   │   ├── PdfPreview.tsx      # 🆕 PDF viewer
│   │   │   ├── SvgPreview.tsx      # 🆕 SVG edit/preview
│   │   │   └── SpreadsheetPreview.tsx  # 🆕 CSV/TSV/JSON
│   │   ├── sidebar/                # All sidebar panels
│   │   │   ├── ActivityBar.tsx
│   │   │   ├── FileTree.tsx
│   │   │   ├── GlobalSearch.tsx
│   │   │   ├── GitControlPanel.tsx # 🆕 Git simulator
│   │   │   ├── SnippetsPanel.tsx   # 🆕 Code snippets
│   │   │   └── WorkspaceInfo.tsx
│   │   ├── statusbar/
│   │   │   └── StatusBar.tsx
│   │   ├── tabs/
│   │   │   └── TabsBar.tsx
│   │   └── ui/                     # All UI components
│   │       ├── AppDialog.tsx       # 🆕 Custom dialogs
│   │       ├── CommandPalette.tsx
│   │       ├── FindReplacePanel.tsx
│   │       ├── IntegratedTerminal.tsx
│   │       ├── MenuBar.tsx
│   │       ├── SettingsModal.tsx
│   │       ├── ShortcutsHelpModal.tsx
│   │       ├── ToastContainer.tsx
│   │       └── WelcomeScreen.tsx
│   ├── stores/                     # Zustand state management
│   │   ├── useDialogStore.ts       # 🆕 Dialog state
│   │   ├── useFileStore.ts
│   │   ├── useSettingsStore.ts
│   │   └── useToastStore.ts
│   ├── types/                      # TypeScript interfaces
│   ├── utils/                      # Utilities
│   │   ├── fileUtils.ts
│   │   ├── storage.ts
│   │   └── zipExtractor.ts         # 🆕 ZIP extraction
│   ├── App.tsx                     # Main app component
│   ├── index.css                   # Global styles + animations
│   └── main.tsx                    # Vite entry point
├── .gitignore                      # Git ignore rules
├── index.html                      # HTML entry
├── package.json                    # Dependencies
├── README.md                       # This file
└── vite.config.ts                  # Vite configuration
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite 7 | Build Tool & Dev Server |
| Tailwind CSS 4 | Styling |
| Monaco Editor | Code Editing Engine |
| Zustand | State Management |
| JSZip | ZIP extraction |
| Lucide React | Icons |
| Mermaid | Diagram rendering |
| react-markdown | Markdown preview |
| Electron | Desktop app packaging |

---

## 🎯 CodeStudio vs VS Code

| Feature | VS Code | CodeStudio |
|---------|---------|------------|
| Installation Required | ✅ Yes | ❌ No (Browser) |
| Size | ~300MB | ✅ ~4.4MB |
| Startup Time | ~2-3 sec | ✅ <1 sec |
| Offline Support | Limited | ✅ Full |
| Privacy | Telemetry | ✅ Zero tracking |
| ZIP Auto-Extract | ❌ Manual | ✅ Built-in |
| Image/PDF/SVG Preview | Extensions | ✅ Built-in |
| In-App Dialogs | ✅ Yes | ✅ Yes (Custom) |
| Git Integration | Full Git | ✅ Basic simulator |
| Snippets Library | Configurable | ✅ Built-in templates |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

**MIT License** — Free for personal and commercial use.

---

<p align="center">
  Made with ❤️ in India • Universal CodeStudio Editor
</p>

<p align="center">
  <strong>⭐ Star this repository if you found it useful!</strong>
</p>

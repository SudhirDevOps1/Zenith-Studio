# 📜 CHANGELOG

> AI MUST update this file before ending any session where codebase modifications occurred.

## [2026-08-17] - Robust C/C++ & Multi-Language Marketplace Search & Auto Pyodide Engine
* **User Request:** "ye kaisa dikha raa hain live search not work and download bahut se kami hain"
* **Features Added & Fixed:**
  - Added official **C/C++ IntelliSense & Tools (`ms-vscode.cpptools`)**, **clangd (`llvm-vs-code-extensions.vscode-clangd`)**, **Code Runner (`formulahendry.code-runner`)**, **Live Server (`ritwickdey.LiveServer`)**, **Java (`redhat.java`)**, **C# Dev Kit (`ms-dotnettools.csharp`)**, and **Docker** to the curated extensions catalog with rich tag aliases.
  - Upgraded Open VSX live search with query normalization (`c++` -> `cpp`, `c#` -> `csharp`) and automated CORS proxy fallback.
  - Enabled Pyodide in-browser Python runtime by default in `DEFAULT_SETTINGS`.
  - Upgraded Advanced Code Runner with clean dynamic runtime status indicators and seamless multi-language execution.
* **Files Modified:** `src/data/defaultExtensions.ts`, `src/stores/useExtensionStore.ts`, `src/components/sidebar/ExtensionsPanel.tsx`, `src/types/settings.ts`, `src/components/preview/AdvancedCodeRunner.tsx`, `skill.md/CHANGELOG.md`.

---
## [2026-08-17] - Ultra-Vibrant Carbon / Ray.so Style Code to Image Generator
* **User Request:** "ye bekar hain example ese analysis kro example live web https://sudhirdevops1.github.io/code-to-image-generator/ and es repo ko analysis kro https://github.com/SudhirDevOps1/code-to-image-generator.git yesa image bane"
* **Features Added & Upgraded:**
  - Full syntax highlighting engine inside `CodeSnapshotModal.tsx` tokenizing keywords (purple), strings (green), comments (italic gray), builtins/functions (cyan), types (gold), numbers (orange), and JSX/HTML tags (coral).
  - 8 Premium gradient themes: Cosmic Purple, Sunset Rose, Cyberpunk Neon, Emerald Forest, Midnight Slate, Electric Cyan, Solar Amber, and Pure Dark.
  - 2x High-DPI Retina resolution canvas export with deep drop shadows (`box-shadow: 0 40px 120px rgba(0,0,0,0.7)`).
  - macOS 3-dot window buttons (`#ff5f56`, `#ffbd2e`, `#27c93f`), uppercase glowing Language Badges (e.g. `TYPESCRIPT`, `PYTHON`, `REACT TSX`), Padding selector (24/48/64), Line numbers toggle, and Watermark toggle.
  - 1-Click **Copy Image to Clipboard** (`navigator.clipboard.write([new ClipboardItem(...)])`) & **Download 2x PNG**.
* **Files Modified:** `src/components/ui/CodeSnapshotModal.tsx`, `skill.md/CHANGELOG.md`.

---
## [2026-08-17] - Robust Marketplace & Open VSX Live Search Engine
* **User Request:** "Curated Catalog + Open VSX Live Registry not ache se kam kr raha hain search krne pr aa hi nahi raha hain"
* **Root Cause & Enhancements:**
  - `ExtensionsPanel` was restricting searches to the currently selected tab (e.g. Popular/Installed) instead of pooling all catalog & live Open VSX results when user typed a query.
  - Added request abort controller in `useExtensionStore` to prevent older search queries from overwriting newer query results.
  - Added unified search pool combining all curated extensions and live Open VSX registry items.
  - Added Quick Search Pills (`Python`, `Live Server`, `One Dark`, `React`, `Prettier`, `Tailwind`, `C++`, `Rust`, `GitLens`) for one-click discovery.
  - Added clear button (`X`), search counter, and live Open VSX status indicator.
* **Files Modified:** `src/stores/useExtensionStore.ts`, `src/components/sidebar/ExtensionsPanel.tsx`, `skill.md/CHANGELOG.md`.

---
## [2026-08-17] - Automated GitHub Actions CI/CD Workflow & Tag Release
* **User Request:** ".github workflow banao taki auto app bn jaye tag bana kr"
* **Features Added:**
  - Created `.github/workflows/build.yml` configured for automated multi-platform builds:
    - **Web Build Job**: Runs `npm run typecheck` + `npm run build` on `ubuntu-latest` and saves `dist/` artifacts.
    - **Desktop Build Job**: Builds full Windows Desktop Electron app (`.exe` installer & portable) on `windows-latest` and stores `dist-electron/*.exe` artifacts.
    - **Automated GitHub Release Job**: Automatically triggered on git tags (e.g. `v1.0.0`) or manual workflow dispatch (`workflow_dispatch`), generating releases with `.exe` installers and web `.zip` bundles attached!
* **Files Modified:** `.github/workflows/build.yml`, `skill.md/CHANGELOG.md`.

---
## [2026-08-17] - VS Code Parity Power Features (Quick Open Ctrl+P, Go to Line Ctrl+G, Global Workspace Replace, Interactive Status Bar)
* **User Request:** "proceed" (Executing comprehensive plan to add Quick Open, Go to Line, Workspace Search & Replace, and Status Bar Controls)
* **Features Added & Enhanced:**
  1. **Quick Open File Switcher (`Ctrl + P`)**:
     - Built `src/components/ui/QuickOpenModal.tsx` with fuzzy file filtering, keyboard navigation (Arrow Up/Down, Enter), and relative path tags.
  2. **Go to Line Number (`Ctrl + G` or `:line`)**:
     - Embedded `:line` mode in Quick Open modal to directly jump and center cursor in Monaco Editor.
  3. **Global Workspace Search & Replace (`Ctrl + Shift + F`)**:
     - Enhanced `src/components/sidebar/GlobalSearch.tsx` with Match Case (`Aa`), Whole Word (`\b`), Regex (`.*`), Replace bar, Per-file replace, and Global "Replace All" with batch file store save and toast summaries.
  4. **Interactive Status Bar Click Controls**:
     - Enhanced `src/components/statusbar/StatusBar.tsx`:
       - Click line count: Opens Go to Line jumper (`Ctrl + G`).
       - Click "Spaces: X": Opens Indentation Picker popover (2 spaces, 4 spaces, Word Wrap toggle).
       - Click Language: Opens settings.
  5. **Shortcuts & Commands**:
     - Updated `ShortcutsHelpModal.tsx`, `CommandPalette.tsx`, and `App.tsx` global keyboard listeners.
* **Files Modified:** `src/components/ui/QuickOpenModal.tsx`, `src/components/sidebar/GlobalSearch.tsx`, `src/components/statusbar/StatusBar.tsx`, `src/App.tsx`, `src/components/ui/ShortcutsHelpModal.tsx`, `src/components/ui/CommandPalette.tsx`, `skill.md/CHANGELOG.md`.

---
## [2026-08-17] - Monaco Local Offline Loader & Marketplace Search Enhancement
* **Fix/Enhancement:** Bound local bundled `monaco-editor` instance in `src/main.tsx` and `src/components/editor/MonacoEditorWrapper.tsx` using `loader.config({ monaco: monacoInstance })`. Added "Live Preview & Simple Browser" and "Live Server" extensions with fuzzy search.

---
## [2026-08-17] - Professional Documentation Overhaul (README.md)
* **Fix/Enhancement:** Revamped `README.md` with official badges, feature matrices, shortcuts cheatsheet, and architecture guide.

---
**Related Files:** [brain.md](brain.md) | [TODO.md](TODO.md) | [MANIFEST.md](MANIFEST.md)

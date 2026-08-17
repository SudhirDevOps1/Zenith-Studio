# 📜 CHANGELOG

> AI MUST update this file before ending any session where codebase modifications occurred.

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

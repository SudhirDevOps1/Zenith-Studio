import { useEffect, useState, useRef, useCallback } from 'react';
import { useFileStore } from './stores/useFileStore';
import { useSettingsStore } from './stores/useSettingsStore';
import { useToastStore } from './stores/useToastStore';
import { useDialogStore } from './stores/useDialogStore';
import { MenuBar } from './components/ui/MenuBar';
import { ActivityBar } from './components/sidebar/ActivityBar';
import { FileTree } from './components/filetree/FileTree';
import { GlobalSearch } from './components/sidebar/GlobalSearch';
import { WorkspaceInfo } from './components/sidebar/WorkspaceInfo';
import { GitControlPanel } from './components/sidebar/GitControlPanel';
import { SnippetsPanel } from './components/sidebar/SnippetsPanel';
import { ExtensionsPanel } from './components/sidebar/ExtensionsPanel';
import { AiAssistantPanel } from './components/sidebar/AiAssistantPanel';
import { TabsBar } from './components/tabs/TabsBar';
import { MonacoEditorWrapper } from './components/editor/MonacoEditorWrapper';
import { MarkdownPreview } from './components/preview/MarkdownPreview';
import { HtmlPreview } from './components/preview/HtmlPreview';
import { AdvancedCodeRunner } from './components/preview/AdvancedCodeRunner';
import { ImagePreview } from './components/preview/ImagePreview';
import { PdfPreview } from './components/preview/PdfPreview';
import { SvgPreview } from './components/preview/SvgPreview';
import { SpreadsheetPreview } from './components/preview/SpreadsheetPreview';
import { MediaPreview } from './components/preview/MediaPreview';
import { SimpleBrowserWebview } from './components/preview/SimpleBrowserWebview';
import { StatusBar } from './components/statusbar/StatusBar';
import { SettingsModal } from './components/ui/SettingsModal';
import { CommandPalette } from './components/ui/CommandPalette';
import { WelcomeScreen } from './components/ui/WelcomeScreen';
import { ToastContainer } from './components/ui/ToastContainer';
import { FindReplacePanel } from './components/ui/FindReplacePanel';
import { IntegratedTerminal } from './components/ui/IntegratedTerminal';
import { ProblemsPanel } from './components/ui/ProblemsPanel';
import { ShortcutsHelpModal } from './components/ui/ShortcutsHelpModal';
import { QuickOpenModal } from './components/ui/QuickOpenModal';
import { AppDialog } from './components/ui/AppDialog';
import { CodeSnapshotModal } from './components/ui/CodeSnapshotModal';
import { UpdateModal } from './components/ui/UpdateModal';
import { DebugPanel } from './components/debugger/DebugPanel';
import { DebugToolbar } from './components/debugger/DebugToolbar';
import { AiComposerModal } from './components/composer/AiComposerModal';
import { useComposerStore } from './stores/useComposerStore';
import { useDebugStore } from './stores/useDebugStore';
import { useUpdateStore } from './stores/useUpdateStore';
import { useDiagnosticsStore } from './stores/useDiagnosticsStore';

import { applyAccentToDOM } from './utils/accentThemes';
import { X, PanelRightClose, PanelLeftClose } from 'lucide-react';








export default function App() {
  const {
    files,
    activeFileId,
    openTabs,
    isInitialized,
    initializeStore,
    updateFileContent,
    saveCurrentFile,
    closeTab,
    activePreviewMode,
    setActivePreviewMode,
    openSystemFile,
    openSystemFolder,
  } = useFileStore();

  const {
    activeSidebarTab,
    setActiveSidebarTab,
    isZenMode,
    toggleZenMode,
    setCommandPaletteOpen,
    setShortcutsModalOpen,
    setSettingsOpen,
    settings,
  } = useSettingsStore();

  const { addToast } = useToastStore();
  const { isOpen: isDialogOpen, type: dialogType, title: dialogTitle, message: dialogMessage, defaultValue: dialogDefaultValue, placeholder: dialogPlaceholder, confirmText: dialogConfirmText, cancelText: dialogCancelText, confirm: dialogConfirm, cancel: dialogCancel } = useDialogStore();
  const { checkForUpdates } = useUpdateStore();
  const { isProblemsOpen, setProblemsOpen } = useDiagnosticsStore();

  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [editorSplitPct, setEditorSplitPct] = useState(50);
  const [scrollPercentage, setScrollPercentage] = useState<number>(0);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [quickOpenMode, setQuickOpenMode] = useState<'file' | 'line' | null>(null);


  const isDraggingSidebar = useRef(false);
  const isDraggingSplit = useRef(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const handleNavigateToLine = useCallback((lineNumber: number, column: number = 1) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(lineNumber);
      editorRef.current.setPosition({ lineNumber, column });
      editorRef.current.focus();
    }
  }, []);


  // Sync accent color to DOM
  useEffect(() => {
    applyAccentToDOM(settings.accentColor);
  }, [settings.accentColor]);

  // Initialize store (silently)
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);


  // Auto check for releases after startup (silent, with longer delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdates(false); // false = silent mode, no error toast
    }, 8000); // 8s delay so app fully loads before network check
    return () => clearTimeout(timer);
  }, [checkForUpdates]);


  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setQuickOpenMode('file');
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        setQuickOpenMode('line');
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        openSystemFolder();
      } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        openSystemFile();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setSidebarOpen(true);
        setActiveSidebarTab('debug');
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        useComposerStore.getState().setIsOpen(true);
      } else if (e.key === 'F5') {
        e.preventDefault();
        const dbg = useDebugStore.getState();
        if (dbg.sessionState === 'inactive' && activeFile) {
          dbg.startDebugging(activeFile.id, activeFile.path || activeFile.name, activeFile.content || '');
        } else if (dbg.sessionState === 'paused') {
          dbg.continueExecution();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'X' || e.key === 'x')) {
        e.preventDefault();
        setSidebarOpen(true);
        setActiveSidebarTab('extensions');
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'G' || e.key === 'g')) {
        e.preventDefault();
        setSidebarOpen(true);
        setActiveSidebarTab('git');
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        setSidebarOpen(true);
        setActiveSidebarTab('explorer');
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        setSidebarOpen(true);
        setActiveSidebarTab('search');

      } else if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setShowSnapshot(true);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        saveCurrentFile();
        addToast({ type: 'success', title: 'File Saved', message: 'Changes saved to storage.' });
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        if (activeFileId) closeTab(activeFileId);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setShowFindReplace(true);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        setShowTerminal((prev) => !prev);
      } else if (e.key === 'F1' || ((e.ctrlKey || e.metaKey) && e.key === '/')) {
        e.preventDefault();
        setShortcutsModalOpen(true);
      } else if (e.key === 'Escape') {
        setShowFindReplace(false);
        setShowTerminal(false);
        setCommandPaletteOpen(false);
        setShortcutsModalOpen(false);
        setSettingsOpen(false);
        setQuickOpenMode(null);
        if (isZenMode) toggleZenMode();
      }
    };

    const handleOpenSnapshotEvent = () => setShowSnapshot(true);
    window.addEventListener('zenith:open-snapshot', handleOpenSnapshotEvent);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('zenith:open-snapshot', handleOpenSnapshotEvent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setCommandPaletteOpen, setActiveSidebarTab, saveCurrentFile, activeFileId, closeTab, addToast, setShortcutsModalOpen, setSettingsOpen, isZenMode, toggleZenMode, openSystemFile, openSystemFolder]);

  // Mouse move resize handling
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingSidebar.current) {
      const newWidth = Math.max(160, Math.min(500, e.clientX - 48));
      setSidebarWidth(newWidth);
    } else if (isDraggingSplit.current) {
      const mainContainer = document.getElementById('editor-preview-container');
      if (mainContainer) {
        const rect = mainContainer.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const pct = Math.max(20, Math.min(80, (relativeX / rect.width) * 100));
        setEditorSplitPct(pct);
      }
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingSidebar.current = false;
    isDraggingSplit.current = false;
    document.body.style.cursor = 'default';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#14141f] text-slate-300 font-sans space-y-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/30 animate-bounce border border-cyan-500/30 p-1 bg-slate-900 flex items-center justify-center">
          <img src="/icon.png" alt="Zenith Studio" className="w-full h-full rounded-xl object-cover" />
        </div>
        <p className="text-sm font-mono text-slate-400 animate-pulse">Initializing Zenith Studio Workspace...</p>


        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    );
  }

  const activeFile = files.find((f) => f.id === activeFileId);
  const ext = activeFile?.extension?.toLowerCase() || '';
  const content = activeFile?.content || '';

  // Determine preview type
  const isMarkdown = ext === 'md' || ext === 'markdown' || ext === 'mermaid' || ext === 'mmd';
  const isHtml = ext === 'html' || ext === 'htm';
  const isJsTs = ext === 'js' || ext === 'ts' || ext === 'jsx' || ext === 'tsx';
  const isRunnable = isJsTs || ext === 'py' || ext === 'c' || ext === 'cpp' || ext === 'cc' || ext === 'cxx' || ext === 'rs' || ext === 'go';
  const isImage = ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' || ext === 'webp' || ext === 'ico';
  const isAudio = ext === 'mp3' || ext === 'wav' || ext === 'ogg' || ext === 'flac';
  const isVideo = ext === 'mp4' || ext === 'webm' || ext === 'mov' || ext === 'avi';
  const isPdf = ext === 'pdf';
  const isSvg = ext === 'svg';
  const isSpreadsheet = ext === 'csv' || ext === 'tsv' || ext === 'xlsx' || ext === 'xls' || ext === 'xlsm';
  const isWebview = activePreviewMode === 'webview' || activePreviewMode === 'browser';
  const isMediaOnly = isImage || isAudio || isVideo || isPdf;

  // Split preview is active for markdown/html/svg or when explicitly enabled
  const isSplitContent = (isMarkdown || isHtml || isSvg) && activePreviewMode !== 'off';
  const showPreview =
    isWebview ||
    isSplitContent ||
    ((isRunnable || isSpreadsheet) && (activePreviewMode === 'split-edit' || activePreviewMode === 'preview-only'));

  // Get image source for image preview
  const getImageSrc = () => {
    if (!activeFile?.content) return '';
    if (activeFile.content.startsWith('data:')) {
      return activeFile.content;
    }
    return '';
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#14141f] text-slate-200 overflow-hidden font-sans select-none">
      {/* Top Menu Bar */}
      {!isZenMode && <MenuBar />}

      {/* Main Center Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Activity Bar */}
        {!isZenMode && (
          <div className="flex flex-col shrink-0 min-h-0 h-full">
            <ActivityBar />
          </div>
        )}

        {/* Left Resizable Sidebar Panel */}
        {!isZenMode && sidebarOpen && (
          <>
            {/* Mobile Backdrop */}
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-20 bg-black/50 backdrop-blur-xs sm:hidden"
            />
            <div
              style={{ width: `${Math.min(sidebarWidth, typeof window !== 'undefined' ? window.innerWidth - 60 : sidebarWidth)}px` }}
              className="h-full shrink-0 relative animate-slide-in-left z-25 bg-[#12131f]"
            >
              {activeSidebarTab === 'explorer' && <FileTree />}
              {activeSidebarTab === 'search' && <GlobalSearch />}
              {activeSidebarTab === 'git' && <GitControlPanel />}
              {activeSidebarTab === 'snippets' && <SnippetsPanel />}
              {activeSidebarTab === 'extensions' && <ExtensionsPanel />}
              {activeSidebarTab === 'ai' && <AiAssistantPanel />}
              {activeSidebarTab === 'debug' && <DebugPanel />}
              {activeSidebarTab === 'info' && <WorkspaceInfo />}

              <div
                onMouseDown={() => {
                  isDraggingSidebar.current = true;
                  document.body.style.cursor = 'col-resize';
                }}
                className="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 bg-transparent hover:bg-blue-500/80 cursor-col-resize z-20 transition-all hidden sm:block"
              />
            </div>
          </>
        )}


        {/* Center Editor & Preview Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#1e1e2e] relative">
          {/* Open Tabs & Breadcrumbs */}
          {!isZenMode && <TabsBar />}

          {/* Editor and Split Preview Viewport */}
          {openTabs.length === 0 || !activeFile ? (
            <WelcomeScreen />
          ) : (
            <div id="editor-preview-container" className="flex-1 flex flex-col h-full overflow-hidden relative">
              {/* Main Editor + Preview Row */}
              <div className="flex-1 flex h-full overflow-hidden relative">
                {/* Media-Only View (Images, Video, Audio, PDF) */}
                {isMediaOnly ? (
                  <div className="flex-1 h-full overflow-hidden bg-[#11111b] flex items-center justify-center p-4">
                    {isImage && <ImagePreview src={getImageSrc()} fileName={activeFile.name} />}
                    {isAudio && <MediaPreview src={content} fileName={activeFile.name} kind="audio" />}
                    {isVideo && <MediaPreview src={content} fileName={activeFile.name} kind="video" />}
                    {isPdf && <PdfPreview url={content} fileName={activeFile.name} />}
                  </div>
                ) : (
                  <>
                    {/* Monaco Code Editor Pane */}
                    {activePreviewMode !== 'preview-only' && (
                      <div
                        style={{ width: showPreview ? `${editorSplitPct}%` : '100%' }}
                        className="h-full overflow-hidden relative animate-fade-in-up flex-1"
                      >
                        <MonacoEditorWrapper
                          fileId={activeFile.id}
                          content={content}
                          extension={activeFile.extension || ''}
                          onChange={(val) => updateFileContent(activeFile.id, val)}
                          onScrollPercentage={setScrollPercentage}
                          editorRef={editorRef}
                          monacoRef={monacoRef}
                        />
                      </div>
                    )}

                    {/* Split Drag Divider */}
                    {showPreview && activePreviewMode !== 'preview-only' && (
                      <div
                        onMouseDown={() => {
                          isDraggingSplit.current = true;
                          document.body.style.cursor = 'col-resize';
                        }}
                        className="w-1.5 hover:w-2 bg-slate-800 hover:bg-blue-500 cursor-col-resize z-10 shrink-0 transition-all shadow-md"
                      />
                    )}

                    {/* Live Preview Pane */}
                    {showPreview && (
                      <div
                        style={{ width: activePreviewMode === 'preview-only' ? '100%' : `${100 - editorSplitPct}%` }}
                        className="h-full overflow-hidden shrink-0 animate-slide-in-right"
                      >
                        {isMarkdown && (
                          <MarkdownPreview
                            content={content}
                            scrollPercentage={scrollPercentage}
                            extension={ext}
                          />
                        )}
                        {isHtml && <HtmlPreview htmlContent={content} />}
                        {isRunnable && <AdvancedCodeRunner code={content} extension={ext} fileName={activeFile.name} />}
                        {isSvg && (
                          <SvgPreview
                            content={content}
                            onContentChange={(newContent) => updateFileContent(activeFile.id, newContent)}
                            fileName={activeFile.name}
                          />
                        )}
                        {isSpreadsheet && (
                          <SpreadsheetPreview
                            content={content}
                            fileName={activeFile.name}
                            type={ext === 'tsv' ? 'tsv' : ext === 'xlsx' ? 'xlsx' : ext === 'xls' ? 'xls' : ext === 'xlsm' ? 'xlsm' : 'csv'}
                          />
                        )}
                        {isWebview && <SimpleBrowserWebview onClose={() => setActivePreviewMode('auto')} />}
                      </div>
                    )}
                  </>
                )}
              </div>


              {/* Integrated Terminal */}
              {showTerminal && <IntegratedTerminal onClose={() => setShowTerminal(false)} />}

              {/* Problems & Diagnostics Panel */}
              {isProblemsOpen && (
                <ProblemsPanel
                  onClose={() => setProblemsOpen(false)}
                  onNavigateToLine={handleNavigateToLine}
                />
              )}
            </div>
          )}


          {/* Floating Find & Replace Panel */}
          {showFindReplace && activeFile && (
            <FindReplacePanel
              content={content}
              editorRef={editorRef}
              monacoRef={monacoRef}
              onClose={() => setShowFindReplace(false)}
            />
          )}

          {/* Sidebar Toggle Buttons */}
          {!sidebarOpen && !isZenMode && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-2 left-2 z-30 p-1.5 bg-[#1e1e2e] border border-slate-700 rounded shadow-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="Open Explorer (Ctrl+Shift+E)"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}

          {sidebarOpen && !isZenMode && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-2 left-14 z-30 p-1.5 bg-[#1e1e2e] border border-slate-700 rounded shadow-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="Close Sidebar"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          )}



          {/* Zen Mode Exit Button */}
          {isZenMode && (
            <button
              onClick={toggleZenMode}
              className="absolute top-3 right-3 z-40 p-2 bg-[#1e1e2e] border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition shadow-lg"
              title="Exit Zen Mode (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      {!isZenMode && <StatusBar onOpenGoToLine={() => setQuickOpenMode('line')} />}

      {/* Dialog Modals */}
      <SettingsModal />
      <CommandPalette />
      <ShortcutsHelpModal />
      <QuickOpenModal
        isOpen={quickOpenMode !== null}
        onClose={() => setQuickOpenMode(null)}
        initialMode={quickOpenMode || 'file'}
        editorRef={editorRef}
      />
      <ToastContainer />
      <CodeSnapshotModal
        isOpen={showSnapshot}
        code={activeFile?.content || ''}
        fileName={activeFile?.name || 'snapshot'}
        selectedCode={null}
        onClose={() => setShowSnapshot(false)}
      />

      <UpdateModal />
      <DebugToolbar />
      <AiComposerModal />
      
      {/* Global App Dialog */}

      <AppDialog
        isOpen={isDialogOpen}
        type={dialogType}
        title={dialogTitle}
        message={dialogMessage}
        defaultValue={dialogDefaultValue}
        placeholder={dialogPlaceholder}
        confirmText={dialogConfirmText}
        cancelText={dialogCancelText}
        onConfirm={dialogConfirm}
        onCancel={dialogCancel}
      />
    </div>
  );
}

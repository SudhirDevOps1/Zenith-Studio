import React, { useRef, useEffect, useCallback } from "react";
import Editor, { OnMount, OnChange, loader } from "@monaco-editor/react";
import * as monacoInstance from "monaco-editor";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useFileStore } from "../../stores/useFileStore";
import { useDiagnosticsStore } from "../../stores/useDiagnosticsStore";
import { getLanguageFromExtension } from "../../utils/fileUtils";
import { formatCode } from "../../utils/codeFormatter";
import { registerCustomThemes } from "./monacoThemes";
import { registerEmmetProviders } from "./emmetProvider";
import { registerLanguageSnippets } from "./suggestionsProvider";
import { Loader2 } from "lucide-react";

loader.config({ monaco: monacoInstance });

const ZOOM_STEP = 1;
const BASE_FONT_SIZE = 14;

interface MonacoEditorWrapperProps {
  fileId: string;
  content: string;
  extension: string;
  onChange: (value: string) => void;
  onScrollPercentage?: (percentage: number) => void;
  editorRef?: React.MutableRefObject<any>;
  monacoRef?: React.MutableRefObject<any>;
}

export const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({
  fileId,
  content,
  extension,
  onChange,
  onScrollPercentage,
  editorRef: parentEditorRef,
  monacoRef: parentMonacoRef,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const { settings, increaseZoom, decreaseZoom, resetZoom } = useSettingsStore();
  const { saveCurrentFile, files } = useFileStore();
  const { updateFileDiagnostics } = useDiagnosticsStore();
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const language = getLanguageFromExtension(extension);
  const activeFile = files.find((f) => f.id === fileId);

  const baseFontSize = settings.fontSize ?? BASE_FONT_SIZE;
  const zoomLevel = settings.editorZoom ?? 0;
  const effectiveFontSize = Math.max(8, Math.min(72, baseFontSize + zoomLevel * ZOOM_STEP));
  const zoomPercent = Math.round((effectiveFontSize / baseFontSize) * 100);

  const handleFormatDocument = useCallback(() => {
    if (!editorRef.current) return;
    const currentVal = editorRef.current.getValue();
    const result = formatCode(currentVal, extension || language, settings.tabSize || 2);
    if (result.formatted && result.formatted !== currentVal) {
      editorRef.current.setValue(result.formatted);
      onChange(result.formatted);
    }
  }, [extension, language, settings.tabSize, onChange]);

  const handleEditorWillMount = (monaco: any) => {
    registerCustomThemes(monaco);
    registerEmmetProviders(monaco);
    registerLanguageSnippets(monaco);
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    if (parentEditorRef) parentEditorRef.current = editor;
    if (parentMonacoRef) parentMonacoRef.current = monaco;

    // Ctrl+S: Save (with optional Format on Save)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (settings.formatOnSave) {
        handleFormatDocument();
      }
      saveCurrentFile();
    });

    // Shift+Alt+F: Format Document (Standard VS Code shortcut)
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      handleFormatDocument();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal, () => { increaseZoom(); });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Equal, () => { increaseZoom(); });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.NumpadAdd, () => { increaseZoom(); });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus, () => { decreaseZoom(); });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.NumpadSubtract, () => { decreaseZoom(); });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit0, () => { resetZoom(); });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Numpad0, () => { resetZoom(); });

    // Sync editor syntax diagnostics markers with Problems panel
    monaco.editor.onDidChangeMarkers(() => {
      const model = editor.getModel();
      if (model) {
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        updateFileDiagnostics(fileId, activeFile?.name || 'File', markers);
      }
    });

    if (onScrollPercentage) {
      editor.onDidScrollChange(() => {
        const scrollTop = editor.getScrollTop();
        const scrollHeight = editor.getScrollHeight() - editor.getLayoutInfo().height;
        if (scrollHeight > 0) onScrollPercentage(scrollTop / scrollHeight);
      });
    }
    editor.focus();
  };


  const handleChange: OnChange = (value) => {
    const val = value ?? "";
    onChange(val);
    if (settings.autoSave === "afterDelay") {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => { saveCurrentFile(); }, settings.autoSaveDelay);
    }
  };

  useEffect(() => { return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); }; }, [fileId]);

  useEffect(() => { if (monacoRef.current && settings.theme) monacoRef.current.editor.setTheme(settings.theme); }, [settings.theme]);
  useEffect(() => { if (editorRef.current) editorRef.current.updateOptions({ fontSize: effectiveFontSize }); }, [effectiveFontSize]);
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        wordWrap: settings.wordWrap,
        minimap: { enabled: settings.minimap },
        lineNumbers: settings.lineNumbers,
        cursorStyle: settings.cursorStyle,
        tabSize: settings.tabSize,
        fontFamily: settings.fontFamily,
        bracketPairColorization: { enabled: settings.bracketPairColorization ?? true },
        guides: { indentation: settings.indentGuides ?? true },
        stickyScroll: { enabled: settings.stickyScroll ?? true },
        fontLigatures: settings.fontLigatures ?? true,
        mouseWheelZoom: settings.mouseWheelZoom ?? true,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.wordWrap, settings.minimap, settings.lineNumbers, settings.cursorStyle, settings.tabSize, settings.fontFamily, settings.bracketPairColorization, settings.indentGuides, settings.stickyScroll, settings.fontLigatures, settings.mouseWheelZoom]);

  useEffect(() => { document.documentElement.setAttribute("data-zoom", String(zoomPercent)); }, [zoomPercent]);

  return (
    <div className="w-full h-full overflow-hidden relative bg-[#14141f]">
      <Editor
        height="100%"
        path={fileId}
        defaultLanguage={language}
        language={language}
        value={content}
        theme={settings.theme || "vs-dark"}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        onChange={handleChange}
        loading={
          <div className="flex flex-col items-center justify-center h-full bg-[#14141f] text-slate-400 gap-2 font-sans">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-xs font-mono text-slate-400">Initializing Monaco Editor...</span>
          </div>
        }
        options={{
          fontSize: effectiveFontSize,
          fontFamily: settings.fontFamily,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap,
          minimap: { enabled: settings.minimap },
          lineNumbers: settings.lineNumbers,
          autoClosingBrackets: settings.autoClosingBrackets,
          autoClosingQuotes: "always",
          autoClosingDelete: "always",
          autoClosingOvertype: "always",
          autoSurround: "languageDefined",
          cursorStyle: settings.cursorStyle,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          renderWhitespace: "selection",
          formatOnPaste: true,
          formatOnType: true,
          mouseWheelZoom: settings.mouseWheelZoom ?? true,
          bracketPairColorization: { enabled: settings.bracketPairColorization ?? true },
          guides: { indentation: settings.indentGuides ?? true },
          stickyScroll: { enabled: settings.stickyScroll ?? true },
          fontLigatures: settings.fontLigatures ?? true,
          quickSuggestions: { other: true, comments: false, strings: true },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          tabCompletion: "on",
          wordBasedSuggestions: "allDocuments",
          snippetSuggestions: "top",
          parameterHints: { enabled: true },
          suggest: {
            showSnippets: true, showWords: true, showClasses: true,
            showFunctions: true, showConstructors: true, showVariables: true,
            showInterfaces: true, showModules: true, showProperties: true,
            showKeywords: true, showIcons: true, preview: true,
          },
        }}
      />
    </div>
  );
};

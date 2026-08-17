import React, { useRef, useEffect } from 'react';
import Editor, { OnMount, OnChange, loader } from '@monaco-editor/react';
import * as monacoInstance from 'monaco-editor';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useFileStore } from '../../stores/useFileStore';
import { getLanguageFromExtension } from '../../utils/fileUtils';
import { registerCustomThemes } from './monacoThemes';
import { Loader2 } from 'lucide-react';

// Configure local monaco bundle (offline & Electron safe, 0 CDN dependency)
loader.config({ monaco: monacoInstance });

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
  const { settings } = useSettingsStore();
  const { saveCurrentFile } = useFileStore();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const language = getLanguageFromExtension(extension);

  const handleEditorWillMount = (monaco: any) => {
    registerCustomThemes(monaco);
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    if (parentEditorRef) parentEditorRef.current = editor;
    if (parentMonacoRef) parentMonacoRef.current = monaco;

    // Custom keybinding for Ctrl+S / Cmd+S
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveCurrentFile();
    });

    // Listen to scroll for Markdown sync
    if (onScrollPercentage) {
      editor.onDidScrollChange(() => {
        const scrollTop = editor.getScrollTop();
        const scrollHeight = editor.getScrollHeight() - editor.getLayoutInfo().height;
        if (scrollHeight > 0) {
          const pct = scrollTop / scrollHeight;
          onScrollPercentage(pct);
        }
      });
    }

    editor.focus();
  };

  const handleChange: OnChange = (value) => {
    const val = value ?? '';
    onChange(val);

    if (settings.autoSave === 'afterDelay') {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        saveCurrentFile();
      }, settings.autoSaveDelay);
    }
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [fileId]);

  return (
    <div className="w-full h-full overflow-hidden relative bg-[#14141f]">
      <Editor
        height="100%"
        path={fileId}
        defaultLanguage={language}
        language={language}
        value={content}
        theme={settings.theme || 'vs-dark'}
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
          fontSize: settings.fontSize,
          fontFamily: settings.fontFamily,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap,
          minimap: { enabled: settings.minimap },
          lineNumbers: settings.lineNumbers,
          autoClosingBrackets: settings.autoClosingBrackets,
          cursorStyle: settings.cursorStyle,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderWhitespace: 'selection',
          formatOnPaste: true,
          formatOnType: true,
        }}
      />
    </div>
  );
};

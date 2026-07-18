import React, { useRef, useEffect } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useFileStore } from '../../stores/useFileStore';
import { getLanguageFromExtension } from '../../utils/fileUtils';
import { registerCustomThemes } from './monacoThemes';

interface MonacoEditorWrapperProps {
  fileId: string;
  content: string;
  extension: string;
  onChange: (value: string) => void;
  onScrollPercentage?: (percentage: number) => void;
}

export const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({
  fileId,
  content,
  extension,
  onChange,
  onScrollPercentage,
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

  const themeMap: Record<string, string> = {
    'vs-dark': 'vs-dark',
    'light': 'light',
    'dracula': 'dracula',
    'nord': 'nord',
    'monokai': 'monokai',
    'github-dark': 'github-dark',
  };

  const currentTheme = themeMap[settings.theme] || 'vs-dark';

  return (
    <div className="w-full h-full overflow-hidden relative">
      <Editor
        height="100%"
        path={fileId}
        defaultLanguage={language}
        language={language}
        value={content}
        theme={currentTheme}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        onChange={handleChange}
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

import type { editor } from 'monaco-editor';

export const draculaTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', background: '282a36', foreground: 'f8f8f2' },
    { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
    { token: 'string', foreground: 'f1fa8c' },
    { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
    { token: 'number', foreground: 'bd93f9' },
    { token: 'identifier', foreground: '50fa7b' },
    { token: 'type', foreground: '8be9fd' },
  ],
  colors: {
    'editor.background': '#282a36',
    'editor.foreground': '#f8f8f2',
    'editor.selectionBackground': '#44475a',
    'editor.lineHighlightBackground': '#44475a44',
    'editorCursor.foreground': '#f8f8f0',
    'editorWhitespace.foreground': '#6272a4',
  },
};

export const nordTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', background: '2e3440', foreground: 'd8dee9' },
    { token: 'comment', foreground: '616e88', fontStyle: 'italic' },
    { token: 'string', foreground: 'a3be8c' },
    { token: 'keyword', foreground: '81a1c1', fontStyle: 'bold' },
    { token: 'number', foreground: 'b48ead' },
    { token: 'type', foreground: '8fbcbb' },
  ],
  colors: {
    'editor.background': '#2e3440',
    'editor.foreground': '#d8dee9',
    'editor.selectionBackground': '#434c5e',
    'editor.lineHighlightBackground': '#3b4252',
    'editorCursor.foreground': '#d8dee9',
  },
};

export const monokaiTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', background: '272822', foreground: 'f8f8f2' },
    { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
    { token: 'string', foreground: 'e6db74' },
    { token: 'keyword', foreground: 'f92672', fontStyle: 'bold' },
    { token: 'number', foreground: 'ae81ff' },
    { token: 'type', foreground: '66d9ef' },
  ],
  colors: {
    'editor.background': '#272822',
    'editor.foreground': '#f8f8f2',
    'editor.selectionBackground': '#49483e',
    'editor.lineHighlightBackground': '#3e3d32',
    'editorCursor.foreground': '#f8f8f0',
  },
};

export const githubDarkTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', background: '0d1117', foreground: 'c9d1d9' },
    { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
    { token: 'string', foreground: 'a5d6ff' },
    { token: 'keyword', foreground: 'ff7b72', fontStyle: 'bold' },
    { token: 'number', foreground: '79c0ff' },
    { token: 'type', foreground: 'ffa657' },
  ],
  colors: {
    'editor.background': '#0d1117',
    'editor.foreground': '#c9d1d9',
    'editor.selectionBackground': '#263850',
    'editor.lineHighlightBackground': '#161b22',
    'editorCursor.foreground': '#58a6ff',
  },
};

export const registerCustomThemes = (monaco: any) => {
  monaco.editor.defineTheme('dracula', draculaTheme);
  monaco.editor.defineTheme('nord', nordTheme);
  monaco.editor.defineTheme('monokai', monokaiTheme);
  monaco.editor.defineTheme('github-dark', githubDarkTheme);
};

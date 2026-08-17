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

export const oneDarkProTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', background: '282c34', foreground: 'abb2bf' },
    { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'c678dd' },
    { token: 'string', foreground: '98c379' },
    { token: 'number', foreground: 'd19a66' },
    { token: 'type', foreground: 'e5c07b' },
    { token: 'function', foreground: '61afef' },
    { token: 'variable', foreground: 'e06c75' },
  ],
  colors: {
    'editor.background': '#282c34',
    'editor.foreground': '#abb2bf',
    'editor.selectionBackground': '#3e4451',
    'editor.lineHighlightBackground': '#2c313a',
    'editorCursor.foreground': '#528bff',
  },
};

export const catppuccinTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', background: '24273a', foreground: 'cad3f5' },
    { token: 'comment', foreground: '6e738d', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'c6a0f6' },
    { token: 'string', foreground: 'a6da95' },
    { token: 'number', foreground: 'f5a97f' },
    { token: 'type', foreground: 'eed49f' },
    { token: 'function', foreground: '8aadf4' },
    { token: 'variable', foreground: 'cad3f5' },
  ],
  colors: {
    'editor.background': '#24273a',
    'editor.foreground': '#cad3f5',
    'editor.selectionBackground': '#363a4f',
    'editor.lineHighlightBackground': '#2e324a',
    'editorCursor.foreground': '#f4dbd6',
  },
};

export const synthwave84Theme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', background: '262335', foreground: 'ffffff' },
    { token: 'comment', foreground: '614d85', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'f92aad' },
    { token: 'string', foreground: 'ff8b39' },
    { token: 'number', foreground: 'f97e72' },
    { token: 'type', foreground: 'fe4450' },
    { token: 'function', foreground: '36f9f6' },
    { token: 'variable', foreground: 'ff7edb' },
  ],
  colors: {
    'editor.background': '#262335',
    'editor.foreground': '#ffffff',
    'editor.selectionBackground': '#492348',
    'editor.lineHighlightBackground': '#2a2139',
    'editorCursor.foreground': '#f92aad',
  },
};

export const tokyoNightTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: '', background: '1a1b26', foreground: 'a9b1d6' },
    { token: 'comment', foreground: '565f89', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'bb9af7' },
    { token: 'string', foreground: '9ece6a' },
    { token: 'number', foreground: 'ff9e64' },
    { token: 'type', foreground: 'e0af68' },
    { token: 'function', foreground: '7aa2f7' },
    { token: 'variable', foreground: 'c0caf5' },
  ],
  colors: {
    'editor.background': '#1a1b26',
    'editor.foreground': '#a9b1d6',
    'editor.selectionBackground': '#283457',
    'editor.lineHighlightBackground': '#24283b',
    'editorCursor.foreground': '#c0caf5',
  },
};

export const registerCustomThemes = (monaco: any) => {
  monaco.editor.defineTheme('dracula', draculaTheme);
  monaco.editor.defineTheme('nord', nordTheme);
  monaco.editor.defineTheme('monokai', monokaiTheme);
  monaco.editor.defineTheme('github-dark', githubDarkTheme);
  monaco.editor.defineTheme('one-dark-pro', oneDarkProTheme);
  monaco.editor.defineTheme('catppuccin', catppuccinTheme);
  monaco.editor.defineTheme('synthwave-84', synthwave84Theme);
  monaco.editor.defineTheme('tokyo-night', tokyoNightTheme);
};

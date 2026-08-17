export type ThemeMode =
  | 'vs-dark'
  | 'light'
  | 'dracula'
  | 'nord'
  | 'monokai'
  | 'github-dark'
  | 'one-dark-pro'
  | 'catppuccin'
  | 'synthwave-84'
  | 'tokyo-night';
export type AccentColor = 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan';

export type AiProvider =
  | 'gemini'
  | 'openai'
  | 'anthropic'
  | 'groq'
  | 'openrouter'
  | 'ollama'
  | 'deepseek'
  | 'custom';

export interface EditorSettings {
  theme: ThemeMode;
  accentColor: AccentColor;
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  minimap: boolean;
  lineNumbers: 'on' | 'off' | 'relative';
  autoSave: 'off' | 'afterDelay' | 'onFocusChange';
  autoSaveDelay: number; // in milliseconds
  formatOnSave: boolean;
  showBreadcrumbs: boolean;
  defaultFileExtension: string;
  previewPosition: 'right' | 'bottom';
  previewAutoRefresh: boolean;
  autoClosingBrackets: 'always' | 'languageDefined' | 'never';
  cursorStyle: 'line' | 'block' | 'underline' | 'line-thin' | 'block-outline';
  uiDensity: 'compact' | 'comfortable';
  soundEffects: boolean;
  enableNativeCompiler: boolean;
  enablePyodideRunner: boolean;
  enableCloudflareSandbox: boolean;
  cloudflareSandboxEndpoint: string;
  // Zoom: 0 = 100%, each step = +/-10%. Range: -5 to +20
  editorZoom: number;
  // Editor visual enhancements
  bracketPairColorization: boolean;
  stickyScroll: boolean;
  fontLigatures: boolean;
  indentGuides: boolean;
  mouseWheelZoom: boolean;
  // Multi-Provider AI Assistant Configuration
  aiProvider: AiProvider;
  geminiApiKey: string;
  aiModel: string;
  aiApiKey: string;
  aiCustomProviderName: string;
  aiCustomEndpoint: string;
  aiCustomModelName: string;
  aiTemperature: number;
}

export const DEFAULT_SETTINGS: EditorSettings = {
  theme: 'vs-dark',
  accentColor: 'blue',
  fontSize: 14,
  fontFamily: "'Fira Code', 'Consolas', monospace",
  tabSize: 2,
  wordWrap: 'on',
  minimap: true,
  lineNumbers: 'on',
  autoSave: 'afterDelay',
  autoSaveDelay: 2000,
  formatOnSave: true,
  showBreadcrumbs: true,
  defaultFileExtension: 'md',
  previewPosition: 'right',
  previewAutoRefresh: true,
  autoClosingBrackets: 'always',
  cursorStyle: 'line',
  uiDensity: 'comfortable',
  soundEffects: false,
  enableNativeCompiler: true,
  enablePyodideRunner: true,
  enableCloudflareSandbox: false,
  cloudflareSandboxEndpoint: '',
  editorZoom: 0,
  bracketPairColorization: true,
  stickyScroll: true,
  fontLigatures: true,
  indentGuides: true,
  mouseWheelZoom: true,
  aiProvider: 'gemini',
  geminiApiKey: '',
  aiModel: 'gemini-1.5-flash',
  aiApiKey: '',
  aiCustomProviderName: 'My Custom API',
  aiCustomEndpoint: 'https://api.example.com/v1/chat/completions',
  aiCustomModelName: 'gpt-4o',
  aiTemperature: 0.3,
};




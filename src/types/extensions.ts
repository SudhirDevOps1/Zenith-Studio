export type ExtensionCategory =
  | 'All'
  | 'Themes'
  | 'Programming Languages'
  | 'Formatters'
  | 'Linters'
  | 'Snippets'
  | 'AI & Productivity'
  | 'Icons'
  | 'Keymaps';

export interface MonacoCustomTheme {
  base: 'vs' | 'vs-dark' | 'hc-black';
  inherit: boolean;
  rules: Array<{ token: string; foreground?: string; background?: string; fontStyle?: string }>;
  colors: Record<string, string>;
}

export interface ExtensionSnippet {
  label: string;
  prefix: string;
  body: string;
  description: string;
  language: string;
}

export interface ExtensionItem {
  id: string;
  name: string;
  displayName: string;
  publisher: string;
  version: string;
  description: string;
  category: ExtensionCategory;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  downloads: string;
  downloadsCount: number;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  installed: boolean;
  enabled: boolean;
  readme: string;
  changelog?: string;
  tags: string[];
  themeData?: MonacoCustomTheme;
  snippetsData?: ExtensionSnippet[];
  source: 'builtin' | 'marketplace' | 'open-vsx';
}

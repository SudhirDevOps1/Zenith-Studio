import { ExtensionItem } from "../types/extensions";
import { useSettingsStore } from "../stores/useSettingsStore";
import { ThemeMode } from "../types/settings";

// Map extension IDs to the ThemeMode they apply
const THEME_MAP: Record<string, ThemeMode> = {
  "zhuangtongfa.material-theme": "one-dark-pro",
  "catppuccin.catppuccin-vsc": "catppuccin",
  "dracula-theme.theme-dracula": "dracula",
  "arcticicestudio.nord-visual-studio-code": "nord",
  "monokai.theme-monokai-pro-vscode": "monokai",
  "github.github-vscode-theme": "github-dark",
  "enkia.tokyo-night": "tokyo-night",
  "rokoroku.vscode-theme-darcula": "dracula",
};

// Map extension IDs to Monaco editor option patches
interface MonacoOptionPatch {
  bracketPairColorization?: { enabled: boolean };
  guides?: { indentation: boolean };
  stickyScroll?: { enabled: boolean };
  fontLigatures?: boolean;
  minimap?: { enabled: boolean };
  wordWrap?: "on" | "off";
  renderWhitespace?: "all" | "none" | "boundary" | "selection";
  lineHeight?: number;
}

const EDITOR_OPTION_MAP: Record<string, Partial<MonacoOptionPatch>> = {
  // Bracket pair colorization extensions
  "coenraads.bracket-pair-colorizer": { bracketPairColorization: { enabled: true } },
  "coenraads.bracket-pair-colorizer-2": { bracketPairColorization: { enabled: true } },
  // Indent rainbow
  "oderwat.indent-rainbow": { guides: { indentation: true } },
  // GitLens — sticky scroll
  "eamodio.gitlens": { stickyScroll: { enabled: true } },
  // Better Comments — no Monaco option, just installed state
  "aaron-bond.better-comments": {},
  // Font ligatures
  "be5invis.vscode-custom-css": { fontLigatures: true },
};

/**
 * Apply the real effects of an extension to the Monaco editor and/or settings.
 * Called when an extension is installed or enabled.
 */
export function applyExtensionEffect(ext: ExtensionItem): void {
  const { updateSettings } = useSettingsStore.getState();

  // 1. Theme extension → switch Monaco theme
  if (ext.category === "Themes" && THEME_MAP[ext.id]) {
    const targetTheme = THEME_MAP[ext.id];
    updateSettings({ theme: targetTheme });
    return;
  }

  // 2. If the extension has inline themeData (custom Monaco theme), register + apply it
  if (ext.category === "Themes" && ext.themeData) {
    // ThemeData is registered in monacoThemes.ts at editor init time.
    // We mark the theme by its extension id as custom theme.
    const customThemeId = ext.id.replace(/\./g, "-") as ThemeMode;
    updateSettings({ theme: customThemeId });
    return;
  }

  // 3. Editor option patch extensions
  const patch = EDITOR_OPTION_MAP[ext.id];
  if (patch) {
    // Map Monaco option patches to our settings fields
    if (patch.bracketPairColorization !== undefined) {
      updateSettings({ bracketPairColorization: patch.bracketPairColorization.enabled });
    }
    if (patch.guides !== undefined) {
      updateSettings({ indentGuides: patch.guides.indentation });
    }
    if (patch.stickyScroll !== undefined) {
      updateSettings({ stickyScroll: patch.stickyScroll.enabled });
    }
    if (patch.fontLigatures !== undefined) {
      updateSettings({ fontLigatures: patch.fontLigatures });
    }
    if (patch.minimap !== undefined) {
      updateSettings({ minimap: patch.minimap.enabled });
    }
    if (patch.wordWrap !== undefined) {
      updateSettings({ wordWrap: patch.wordWrap });
    }
  }
}

/**
 * Revert the effects of an extension when uninstalled/disabled.
 * Only reverts if no other installed extension relies on the same setting.
 */
export function revertExtensionEffect(ext: ExtensionItem): void {
  const { updateSettings, settings } = useSettingsStore.getState();

  // Revert theme back to vs-dark only if this extension was the active theme
  if (ext.category === "Themes") {
    const appliedTheme = THEME_MAP[ext.id];
    if (appliedTheme && settings.theme === appliedTheme) {
      updateSettings({ theme: "vs-dark" });
    }
  }
}

/**
 * Get a human-readable description of what an extension does when installed.
 */
export function getExtensionEffectLabel(ext: ExtensionItem): string {
  if (ext.category === "Themes") {
    const theme = THEME_MAP[ext.id];
    if (theme) return `Applies "${theme}" theme to editor`;
    if (ext.themeData) return "Applies custom color theme to editor";
    return "Applies color theme to editor";
  }
  const patch = EDITOR_OPTION_MAP[ext.id];
  if (patch) {
    const effects: string[] = [];
    if (patch.bracketPairColorization?.enabled) effects.push("Bracket Pair Colorization");
    if (patch.guides?.indentation) effects.push("Indent Guides");
    if (patch.stickyScroll?.enabled) effects.push("Sticky Scroll");
    if (patch.fontLigatures) effects.push("Font Ligatures");
    if (effects.length > 0) return effects.join(", ");
  }
  if (ext.category === "Formatters") return "Formats code on save";
  if (ext.category === "Linters") return "Highlights code issues";
  if (ext.category === "Snippets") return "Adds code snippets";
  if (ext.category === "Programming Languages") return "Syntax highlighting & IntelliSense";
  return "Enhances editor functionality";
}

/**
 * Check if extension has a real working effect in CodeStudio.
 */
export function hasRealEffect(ext: ExtensionItem): boolean {
  if (ext.category === "Themes") return true;
  if (EDITOR_OPTION_MAP[ext.id] !== undefined) return true;
  if (ext.snippetsData && ext.snippetsData.length > 0) return true;
  return false;
}

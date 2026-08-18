/// <reference types="vite/client" />

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

interface Window {
  loadPyodide?: any;
  pyodide?: any;
  electronAPI?: {
    openFileDialog: () => Promise<any>;
    openFolderDialog: () => Promise<any>;
    readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
    saveFile: (data: { filePath: string; content: string }) => Promise<{ success: boolean; error?: string }>;
    runNativeCode: (data: any) => Promise<any>;
    execTerminalCommand: (data: { command: string; cwd?: string; shell?: string }) => Promise<any>;

    searchOpenVSX: (query: string) => Promise<any>;
    getPopularOpenVSX: () => Promise<any>;
    getExtensionDetails: (data: { namespace: string; name: string }) => Promise<any>;
    aiFetch: (data: { url: string; method?: string; headers?: Record<string, string>; body?: any }) => Promise<{
      ok: boolean;
      status: number;
      statusText?: string;
      data: any;
      error?: string;
    }>;
    openExternal: (url: string) => Promise<void>;
    openHtmlPreview: (data: { content?: string; filePath?: string }) => Promise<{ success: boolean; url?: string; error?: string }>;
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    closeWindow: () => void;

    // 🛡️ Enterprise OS Credential Vault
    setSecret: (key: string, value: string) => Promise<{ success: boolean; error?: string }>;
    getSecret: (key: string) => Promise<{ success: boolean; value: string | null; error?: string }>;
    deleteSecret: (key: string) => Promise<{ success: boolean; error?: string }>;
    hasSecret: (key: string) => Promise<{ success: boolean; exists: boolean }>;
  };
}



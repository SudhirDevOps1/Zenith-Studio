export type FileType = 'file' | 'folder';

export interface FileItem {
  id: string;
  name: string;
  path: string; // Relative path e.g. "src/App.tsx"
  type: FileType;
  parentId: string | null;
  content?: string;
  extension?: string;
  isExpanded?: boolean;
  isModified?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface OpenTab {
  fileId: string;
  path: string;
  title: string;
  isModified: boolean;
  extension: string;
  cursorPosition?: { lineNumber: number; column: number };
}

export type ActivePreviewMode = 'auto' | 'markdown' | 'html' | 'js-sandbox' | 'split-edit' | 'preview-only' | 'webview' | 'browser' | 'off';

export interface ContextMenuTarget {
  x: number;
  y: number;
  fileId: string | null; // null means target is root container
  isFolder: boolean;
}

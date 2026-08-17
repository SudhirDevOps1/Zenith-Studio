import { FileItem } from '../../types/fileSystem';


// Core React & standard ambient type declarations for in-editor zero-setup intellisense
const REACT_DECLARATIONS = `
declare module 'react' {
  export type ReactNode = any;
  export type CSSProperties = { [key: string]: any };
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useRef<T>(initialValue?: T): { current: T };
  export function useMemo<T>(factory: () => T, deps: readonly any[] | undefined): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useContext<T>(context: any): T;
  export function createContext<T>(defaultValue: T): any;
  export type FC<P = {}> = (props: P) => any;
  export type ReactElement = any;
  export const Fragment: any;
  export default {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
    useContext,
    createContext,
    Fragment,
  };
}

declare module 'react-dom' {
  export function render(element: any, container: any): void;
  export function createRoot(container: any): { render(element: any): void; unmount(): void; };
}

declare module 'react-dom/client' {
  export function createRoot(container: any): { render(element: any): void; unmount(): void; };
}

declare module 'lucide-react' {
  export const [key: string]: any;
}

declare module 'clsx' {
  export default function clsx(...args: any[]): string;
}

declare module 'tailwind-merge' {
  export function twMerge(...classLists: (string | undefined | null | false)[]): string;
}

declare module 'zustand' {
  export function create<T>(initializer: (set: any, get: any, api: any) => T): () => T;
}
`;

let isLanguageServerConfigured = false;
const extraLibsDisposables: { dispose: () => void }[] = [];

/**
 * Configure Monaco Editor Language Server, Compiler Options, and React Ambient Types
 */
export function configureLanguageServer(monaco: any) {
  if (isLanguageServerConfigured || !monaco?.languages?.typescript) return;

  const ts = monaco.languages.typescript;

  // Configure TypeScript Compiler Options
  ts.typescriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    module: ts.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    reactNamespace: 'React',
    allowJs: true,
    allowSyntheticDefaultImports: true,
    typeRoots: ['node_modules/@types'],
  });

  // Configure JavaScript Compiler Options
  ts.javascriptDefaults.setCompilerOptions({
    target: ts.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    module: ts.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    allowJs: true,
    allowSyntheticDefaultImports: true,
  });

  // Enable semantic & syntax diagnostics
  ts.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
  });

  ts.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  // Register built-in React, JSX, and Utility libraries
  ts.typescriptDefaults.addExtraLib(REACT_DECLARATIONS, 'ts:react_ambient.d.ts');
  ts.javascriptDefaults.addExtraLib(REACT_DECLARATIONS, 'ts:react_ambient.d.ts');

  // Configure JSON Schemas (Package.json, Tsconfig)
  if (monaco.languages.json) {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [
        {
          uri: 'http://myserver/package-schema.json',
          fileMatch: ['package.json'],
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              version: { type: 'string' },
              description: { type: 'string' },
              main: { type: 'string' },
              scripts: { type: 'object' },
              dependencies: { type: 'object' },
              devDependencies: { type: 'object' },
            },
          },
        },
      ],
    });
  }

  isLanguageServerConfigured = true;
}

/**
 * Synchronize workspace files into Monaco TypeScript extraLibs for cross-file auto-completion and type inference
 */
export function syncWorkspaceFilesToLanguageServer(monaco: any, files: FileItem[], activeFileId: string) {
  if (!monaco?.languages?.typescript || !Array.isArray(files)) return;

  const ts = monaco.languages.typescript;

  // Clear previous extra libs disposables
  extraLibsDisposables.forEach((d) => {
    try {
      d.dispose();
    } catch (_) {}
  });
  extraLibsDisposables.length = 0;

  // Add all other workspace TS/TSX/JS files as ambient modules
  for (const file of files) {
    if (file.id === activeFileId || file.type !== 'file' || !file.content) continue;

    const ext = (file.extension || '').toLowerCase();
    if (['ts', 'tsx', 'js', 'jsx', 'd.ts'].includes(ext)) {

      const filePath = file.path ? `file:///${file.path.replace(/\\/g, '/')}` : `file:///${file.name}`;
      try {
        const libDisposable = ts.typescriptDefaults.addExtraLib(file.content, filePath);
        extraLibsDisposables.push(libDisposable);
      } catch (err) {
        // Silently catch duplicates
      }
    }
  }
}

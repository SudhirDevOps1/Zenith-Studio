import JSZip from 'jszip';
import { FileItem } from '../types/fileSystem';

// Language detection map for Monaco Editor
export const getLanguageFromExtension = (extension: string): string => {
  const ext = extension.toLowerCase().replace('.', '');
  switch (ext) {
    case 'js':
    case 'cjs':
    case 'mjs':
      return 'javascript';
    case 'ts':
    case 'cts':
    case 'mts':
      return 'typescript';
    case 'jsx':
      return 'javascript';
    case 'tsx':
      return 'typescript';
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
    case 'scss':
    case 'less':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'mmd':
    case 'mermaid':
      return 'mermaid';
    case 'py':
    case 'python':
      return 'python';
    case 'java':
      return 'java';
    case 'cpp':
    case 'cxx':
    case 'cc':
    case 'c':
    case 'h':
    case 'hpp':
      return 'cpp';
    case 'cs':
      return 'csharp';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'php':
      return 'php';
    case 'rb':
      return 'ruby';
    case 'sh':
      return 'shell';
    case 'sql':
      return 'sql';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'xml':
    case 'svg':
      return 'xml';
    case 'txt':
    default:
      return 'plaintext';
  }
};

export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() || '' : '';
};

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as any).electronAPI);
};

// Default clean starter project files for Zenith Studio
export const INITIAL_SAMPLE_FILES: FileItem[] = [
  {
    id: 'file-welcome-md',
    name: 'README.md',
    path: 'README.md',
    type: 'file',
    parentId: null,
    extension: 'md',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: `# 🚀 Welcome to Zenith Studio (v1.0.3)

**Zenith Studio** is a high-performance, lightweight cross-platform AI code and text editor designed for both Web browsers and Desktop.

---

## 🔥 Key Capabilities

- ⚡ **Monaco Code Editor** — Full syntax highlighting with 100+ languages, IntelliSense, and multi-cursor editing.
- 🤖 **Multi-File AI Composer (\`Ctrl+Shift+I\`)** — Cursor-grade multi-file AI Agent that plans, generates, and patches changes across your workspace.
- 🐛 **Interactive DAP Debugger (\`F5\`)** — Monaco gutter red breakpoints, Step Over, Step Into, Call Stack, Variables Scope, and Watch panel.
- 🔀 **3-Way Git Merge Conflict Resolver** — Visual 1-click **Accept Current**, **Accept Incoming**, and **Accept Both** CodeLens actions.
- 💻 **Advanced Multi-Session Terminal (\`Ctrl+\`\`)** — PowerShell, CMD, Git Bash, Node.js, Python REPL, split panes, and 8 themes.
- 🌐 **Full Language Server** — Cross-file TypeScript diagnostics, ambient React types, and auto-completion.
- 🧩 **Open VSX Marketplace (\`Ctrl+Shift+X\`)** — 100% reliable CORS-free extension & theme searches.

---

## ⌨️ Essential Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **Ctrl + P** | Quick Open File Switcher |
| **Ctrl + Shift + P** | Command Palette |
| **Ctrl + Shift + I** | AI Multi-File Composer |
| **Ctrl + Shift + D** | Run & Debug Panel |
| **Ctrl + \`** | Toggle Integrated Terminal |
| **Shift + Alt + F** | Format Document |
| **Ctrl + S** | Save File |
| **Ctrl + Shift + F** | Global Search & Replace |

---

Ready to build. Open or create files in the Explorer to get started!
`,
  },
  {
    id: 'file-main-ts',
    name: 'index.ts',
    path: 'src/index.ts',
    type: 'file',
    parentId: null,
    extension: 'ts',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: `/**
 * Zenith Studio Starter Entrypoint
 */

interface WorkspaceConfig {
  name: string;
  version: string;
  mode: 'web' | 'desktop';
}

export const workspace: WorkspaceConfig = {
  name: 'Zenith Studio Workspace',
  version: '1.0.3',
  mode: 'desktop',
};

export function initialize(): void {
  console.log(\`Starting \${workspace.name} v\${workspace.version}...\`);
}

initialize();
`,
  },
  {
    id: 'file-package-json',
    name: 'package.json',
    path: 'package.json',
    type: 'file',
    parentId: null,
    extension: 'json',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: `{
  "name": "my-zenith-project",
  "version": "1.0.3",
  "description": "Project created in Zenith Studio",
  "main": "src/index.ts",
  "scripts": {
    "dev": "npm run build && node dist/index.js",
    "build": "tsc",
    "test": "echo \\"Running tests...\\" && exit 0"
  },
  "keywords": ["zenith-studio", "typescript"],
  "author": "",
  "license": "MIT"
}
`,
  },
  {
    id: 'file-index-html',
    name: 'index.html',
    path: 'index.html',
    type: 'file',
    parentId: null,
    extension: 'html',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zenith Studio App</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: #1e293b;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      border: 1px solid #334155;
      text-align: center;
      max-width: 450px;
    }
    h1 { margin-top: 0; color: #38bdf8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Zenith Studio App</h1>
    <p>Your web preview is live and responsive!</p>
  </div>
</body>
</html>
`,
  },
  {
    id: 'file-script-js',
    name: 'script.js',
    path: 'script.js',
    type: 'file',
    parentId: null,
    extension: 'js',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: `// Zenith Studio JavaScript Interactive Sandbox
// Press "Run" to execute in browser or native Node!

function calculateFibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    let temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

console.log("🚀 Fibonacci benchmark:");
[5, 10, 15, 20, 25].forEach(num => {
  console.log(\`Fibonacci(\${num}) = \${calculateFibonacci(num)}\`);
});

`,
  }
];

// Helper to bundle all files in file list into a zip blob
export const createZipFromFiles = async (files: FileItem[]): Promise<Blob> => {
  const zip = new JSZip();

  files.forEach(file => {
    if (file.type === 'file') {
      const content = file.content || '';
      if (content.startsWith('data:') && content.includes(';base64,')) {
        const base64Data = content.split(';base64,')[1];
        zip.file(file.path, base64Data, { base64: true });
      } else {
        zip.file(file.path, content);
      }
    } else if (file.type === 'folder') {
      zip.folder(file.path);
    }
  });

  return await zip.generateAsync({ type: 'blob' });
};

// Helper to trigger browser download for any file item (text or binary Data URL)
export const downloadFileItem = (file: FileItem) => {
  const content = file.content ?? '';
  const a = document.createElement('a');
  a.download = file.name;

  if (content.startsWith('data:')) {
    a.href = content;
    a.click();
  } else {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};

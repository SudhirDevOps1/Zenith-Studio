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

// Default sample project files for CodeStudio
export const INITIAL_SAMPLE_FILES: FileItem[] = [
  {
    id: 'folder-docs',
    name: 'docs',
    path: 'docs',
    type: 'folder',
    parentId: null,
    isExpanded: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'file-welcome-md',
    name: 'README.md',
    path: 'README.md',
    type: 'file',
    parentId: null,
    extension: 'md',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: `# 🚀 Welcome to CodeStudio!

**CodeStudio** is a high-performance, lightweight cross-platform code and text editor designed for both Web browsers and Desktop (Electron).

---

## 🔥 Key Features

- ⚡ **Monaco Code Editor Engine** - The core editor powering VS Code with 100+ language syntax highlighting.
- 📊 **Live Markdown & Mermaid Diagrams** - Side-by-side sync-scrolling preview with rich flowchart, sequence & class diagrams.
- 🌐 **HTML Live Web Sandbox** - Instant iframe preview with live reload for HTML, CSS, & JS.
- 🧪 **JavaScript / TypeScript Console** - Run scripts in-browser with live output & logging!
- 📂 **Virtual & Native File System** - Supports IndexedDB storage for Web & direct native OS filesystem integration in Desktop.
- 🎨 **Multi-Theme Support** - VS Dark, Dracula, Nord, Monokai, GitHub Dark, and Light themes.
- ⌨️ **Command Palette (Ctrl+Shift+P)** - Rapid keyboard access to actions, commands, and search.

---

## 🎨 Mermaid Flowchart Example

\`\`\`mermaid
graph TD
    A[🚀 User opens CodeStudio] --> B{Choose Workflow}
    B -->|Code Editing| C[Monaco Editor + IntelliSense]
    B -->|Markdown & Docs| D[Live Markdown + Mermaid Render]
    B -->|Web Dev| E[Live HTML Sandbox Preview]
    B -->|Scripting| F[JS/TS Interactive Sandbox]
    C --> G[Auto-save & Persistence]
    D --> G
    E --> G
    F --> G
    G --> H[Export PDF or Download Zip]
\`\`\`

---

## 💻 Code Sample (TypeScript)

\`\`\`typescript
interface UserProfile {
  id: string;
  name: string;
  role: 'developer' | 'architect';
  editor: string;
}

const developer: UserProfile = {
  id: 'usr_01',
  name: 'Alex Developer',
  role: 'architect',
  editor: 'CodeStudio',
};

console.log(\`Running \${developer.editor} for \${developer.name}!\`);
\`\`\`

Enjoy building with **CodeStudio**!
`,
  },
  {
    id: 'file-mermaid-doc',
    name: 'architecture.mermaid',
    path: 'docs/architecture.mermaid',
    type: 'file',
    parentId: 'folder-docs',
    extension: 'mermaid',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: `sequenceDiagram
    autonumber
    actor User
    participant App as CodeStudio React App
    participant Monaco as Monaco Editor Engine
    participant Store as Zustand File Store
    participant VFS as IndexedDB / FileSystem

    User->>App: Types code / edits text
    App->>Monaco: OnContentChange Event
    Monaco->>Store: Dispatch updateFileContent
    Store->>VFS: Persist changes asynchronously
    Store-->>App: Re-render Markdown / HTML / Mermaid preview
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
  <title>Live Web Sandbox</title>
  <style>
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
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
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      border: 1px solid #334155;
      text-align: center;
      max-width: 400px;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.6rem 1.4rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s ease;
    }
    button:hover {
      background: #2563eb;
      transform: translateY(-2px);
    }
    #counter {
      font-size: 2.5rem;
      font-weight: bold;
      color: #38bdf8;
      margin: 1rem 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>⚡ CodeStudio Live Preview</h2>
    <p>Edit this HTML file to see instant hot updates!</p>
    <div id="counter">0</div>
    <button onclick="increment()">Click Me!</button>
  </div>

  <script>
    let count = 0;
    function increment() {
      count++;
      document.getElementById('counter').innerText = count;
    }
  </script>
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
    content: `// CodeStudio JavaScript Interactive Sandbox
// Press "Run Script" in the right preview panel to execute!

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

console.log("🚀 Starting Fibonacci sequence benchmark...");
const numbers = [5, 10, 15, 20, 25, 30];

numbers.forEach(num => {
  const result = calculateFibonacci(num);
  console.log(\`Fibonacci(\${num}) = \${result}\`);
});

console.log("✅ Code execution completed successfully!");
`,
  },
  {
    id: 'file-data-json',
    name: 'package.json',
    path: 'package.json',
    type: 'file',
    parentId: null,
    extension: 'json',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: `{
  "name": "codestudio-workspace",
  "version": "1.0.0",
  "description": "Next-gen code and text editor project workspace",
  "author": "CodeStudio Developer",
  "license": "MIT",
  "dependencies": {
    "react": "^19.0.0",
    "monaco-editor": "^0.45.0"
  }
}
`,
  }
];

// Helper to bundle all files in file list into a zip blob
export const createZipFromFiles = async (files: FileItem[]): Promise<Blob> => {
  const zip = new JSZip();

  const fileMap = new Map<string, FileItem>();
  files.forEach(f => fileMap.set(f.id, f));

  files.forEach(file => {
    if (file.type === 'file') {
      zip.file(file.path, file.content || '');
    } else if (file.type === 'folder') {
      zip.folder(file.path);
    }
  });

  return await zip.generateAsync({ type: 'blob' });
};

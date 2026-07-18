import React from 'react';
import { useFileStore } from '../../stores/useFileStore';
import { useToastStore } from '../../stores/useToastStore';
import { Sparkles, Plus } from 'lucide-react';

interface Snippet {
  id: string;
  title: string;
  category: 'React' | 'HTML/CSS' | 'Mermaid' | 'JS/TS' | 'Markdown' | 'SQL';
  language: string;
  code: string;
}

export const SnippetsPanel: React.FC = () => {
  const { activeFileId, updateFileContent, files } = useFileStore();
  const { addToast } = useToastStore();

  const snippets: Snippet[] = [
    {
      id: 'react-component',
      title: 'React Functional Component (TSX)',
      category: 'React',
      language: 'tsx',
      code: `import React, { useState } from 'react';

interface Props {
  title: string;
  initialCount?: number;
}

export const CounterCard: React.FC<Props> = ({ title, initialCount = 0 }) => {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg shadow-md space-y-2 text-white">
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="text-2xl font-bold text-blue-400">{count}</p>
      <button
        onClick={() => setCount(c => c + 1)}
        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-semibold"
      >
        Increment
      </button>
    </div>
  );
};
`,
    },
    {
      id: 'mermaid-sequence',
      title: 'Mermaid Sequence Diagram',
      category: 'Mermaid',
      language: 'mermaid',
      code: `sequenceDiagram
    autonumber
    actor Client as Web Browser
    participant API as REST API Gateway
    participant DB as Postgres Database

    Client->>API: POST /api/v1/auth/login
    API->>DB: Query User Profile
    DB-->>API: User Record
    API-->>Client: JWT Bearer Token (200 OK)
`,
    },
    {
      id: 'mermaid-flowchart',
      title: 'Mermaid Flowchart',
      category: 'Mermaid',
      language: 'mermaid',
      code: `graph TD
    Start[🚀 Launch App] --> CheckAuth{Is Authenticated?}
    CheckAuth -->|Yes| Dashboard[📊 Render Dashboard]
    CheckAuth -->|No| Login[🔐 Render Login Page]
    Login --> AuthAPI[POST /login]
    AuthAPI --> Dashboard
`,
    },
    {
      id: 'tailwind-card',
      title: 'Tailwind Glassmorphism Card',
      category: 'HTML/CSS',
      language: 'html',
      code: `<div class="max-w-sm p-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl shadow-xl space-y-3">
  <div class="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
    ⚡
  </div>
  <h2 class="text-lg font-bold text-white">Card Header Title</h2>
  <p class="text-xs text-slate-400 leading-relaxed">
    Responsive glassmorphism card styled with Tailwind CSS utility classes.
  </p>
  <button class="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition">
    Action Button
  </button>
</div>
`,
    },
    {
      id: 'js-async-fetch',
      title: 'Async/Await API Fetch with Error Handling',
      category: 'JS/TS',
      language: 'typescript',
      code: `async function fetchUserData(userId: string) {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`);
    if (!response.ok) {
      throw new Error(\`HTTP Error: \${response.status}\`);
    }
    const data = await response.json();
    console.log("Fetched user data:", data);
    return data;
  } catch (error: any) {
    console.error("Fetch failed:", error.message);
  }
}
`,
    },
    {
      id: 'markdown-table',
      title: 'Markdown Table Template',
      category: 'Markdown',
      language: 'markdown',
      code: `| Feature | Status | Priority |
| :--- | :---: | ---: |
| Monaco Editor | ✅ Done | High |
| Live Markdown Preview | ✅ Done | High |
| Integrated Terminal | ✅ Done | Medium |
| Export ZIP | ✅ Done | Low |
`,
    },
    {
      id: 'sql-query',
      title: 'SQL Select Join Query',
      category: 'SQL',
      language: 'sql',
      code: `SELECT 
    u.id AS user_id,
    u.name,
    u.email,
    COUNT(o.id) AS total_orders
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.name, u.email
ORDER BY total_orders DESC;
`,
    },
  ];

  const insertSnippet = (snippet: Snippet) => {
    if (!activeFileId) {
      addToast({ type: 'warning', title: 'No File Open', message: 'Open or create a file to insert snippet.' });
      return;
    }

    const file = files.find((f) => f.id === activeFileId);
    if (!file) return;

    const currentContent = file.content || '';
    const newContent = currentContent ? `${currentContent}\n\n${snippet.code}` : snippet.code;

    updateFileContent(activeFileId, newContent);

    addToast({
      type: 'success',
      title: 'Snippet Inserted',
      message: `Appended ${snippet.title} into ${file.name}.`,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#181825] border-r border-slate-800/80 text-slate-300 font-sans select-none overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 bg-[#1e1e2e] flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">Snippet Library</span>
      </div>

      {/* Snippet list */}
      <div className="p-3 space-y-3">
        {snippets.map((snippet) => (
          <div
            key={snippet.id}
            className="p-3 bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-lg space-y-2 transition shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 font-semibold bg-purple-950/40 border border-purple-800/40 px-1.5 py-0.5 rounded">
                {snippet.category}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{snippet.language}</span>
            </div>

            <h3 className="text-xs font-semibold text-white group-hover:text-purple-300 transition">{snippet.title}</h3>

            <pre className="text-[10px] font-mono text-slate-400 bg-black/40 p-2 rounded overflow-x-auto max-h-24 truncate">
              {snippet.code}
            </pre>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => insertSnippet(snippet)}
                className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-medium transition"
              >
                <Plus className="w-3 h-3" /> Insert into Active File
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

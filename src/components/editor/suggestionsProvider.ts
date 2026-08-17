// Rich Multi-Language VS Code Snippets & Auto-Suggestions for Monaco Editor
import * as monaco from 'monaco-editor';

interface SnippetItem {
  label: string;
  detail: string;
  documentation: string;
  insertText: string;
}

// 1. JavaScript / TypeScript / React Snippets
const JS_TS_SNIPPETS: SnippetItem[] = [
  {
    label: 'clg',
    detail: 'console.log()',
    documentation: 'Logs output to debugging console.',
    insertText: 'console.log(${1:object});',
  },
  {
    label: 'cle',
    detail: 'console.error()',
    documentation: 'Logs error message to console.',
    insertText: 'console.error(${1:error});',
  },
  {
    label: 'clw',
    detail: 'console.warn()',
    documentation: 'Logs warning message to console.',
    insertText: 'console.warn(${1:warning});',
  },
  {
    label: 'rfc',
    detail: 'React Functional Component',
    documentation: 'Creates a standard React functional component.',
    insertText: `import React from 'react';

interface \${1:ComponentName}Props {
  \${2}
}

export const \${1:ComponentName}: React.FC<\${1:ComponentName}Props> = () => {
  return (
    <div>
      \${0}
    </div>
  );
};
`,
  },
  {
    label: 'rafce',
    detail: 'React Arrow Function Component with Export',
    documentation: 'Arrow function React component exported as default/named.',
    insertText: `import React from 'react';

export const \${1:ComponentName} = () => {
  return (
    <div>
      \${0}
    </div>
  );
};

export default \${1:ComponentName};
`,
  },
  {
    label: 'useState',
    detail: 'React useState hook',
    documentation: 'Declares state variable and updater function.',
    insertText: 'const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialValue});',
  },
  {
    label: 'useEffect',
    detail: 'React useEffect hook',
    documentation: 'Runs side effects in function components.',
    insertText: `useEffect(() => {
  \${1}
  return () => {
    \${2}
  };
}, [\${3}]);`,
  },
  {
    label: 'useMemo',
    detail: 'React useMemo hook',
    documentation: 'Memoizes computed value.',
    insertText: 'const ${1:memoizedValue} = useMemo(() => ${2:computeValue()}, [${3:dependencies}]);',
  },
  {
    label: 'useCallback',
    detail: 'React useCallback hook',
    documentation: 'Memoizes callback function.',
    insertText: `const \${1:memoizedCallback} = useCallback((\${2:params}) => {
  \${3}
}, [\${4:dependencies}]);`,
  },
  {
    label: 'useRef',
    detail: 'React useRef hook',
    documentation: 'Creates mutable ref object.',
    insertText: 'const ${1:ref} = useRef<${2:HTMLDivElement}>(null);',
  },
  {
    label: 'imp',
    detail: 'Import module',
    documentation: 'Standard ES6 module import statement.',
    insertText: "import { \${1:module} } from '\${2:package}';",
  },
  {
    label: 'trycatch',
    detail: 'Try/Catch/Finally block',
    documentation: 'Handles runtime exceptions.',
    insertText: `try {
  \${1}
} catch (\${2:error}) {
  console.error(\${2:error});
  \${3}
}`,
  },
  {
    label: 'asyncfn',
    detail: 'Async Arrow Function',
    documentation: 'Defines asynchronous function with try/catch.',
    insertText: `const \${1:fetchData} = async (\${2:params}) => {
  try {
    \${3}
  } catch (error) {
    console.error(error);
  }
};`,
  },
  {
    label: 'fetchapi',
    detail: 'Async Fetch API Request',
    documentation: 'Fetches JSON data from HTTP endpoint.',
    insertText: `const response = await fetch('\${1:https://api.example.com/data}', {
  method: '\${2:GET}',
  headers: {
    'Content-Type': 'application/json',
  },
});
const data = await response.json();
\${0}`,
  },
  {
    label: 'prom',
    detail: 'New Promise',
    documentation: 'Creates new Promise wrapper.',
    insertText: `new Promise((resolve, reject) => {
  \${1}
});`,
  },
];

// 2. Python Snippets
const PYTHON_SNIPPETS: SnippetItem[] = [
  {
    label: 'def',
    detail: 'Function definition',
    documentation: 'Defines a Python function with docstring.',
    insertText: `def \${1:function_name}(\${2:args}):
    """\${3:Docstring description}"""
    \${0:pass}`,
  },
  {
    label: 'class',
    detail: 'Class definition',
    documentation: 'Defines a Python class with __init__ constructor.',
    insertText: `class \${1:ClassName}:
    def __init__(self, \${2:params}):
        \${0:pass}`,
  },
  {
    label: 'ifmain',
    detail: "if __name__ == '__main__':",
    documentation: 'Standard Python script entry point.',
    insertText: `if __name__ == '__main__':
    \${0:main()}`,
  },
  {
    label: 'tryex',
    detail: 'Try / Except block',
    documentation: 'Exception handling in Python.',
    insertText: `try:
    \${1:pass}
except \${2:Exception} as e:
    print(f"Error: {e}")`,
  },
  {
    label: 'fori',
    detail: 'For range loop',
    documentation: 'Iterates through a numeric range.',
    insertText: `for \${1:i} in range(\${2:10}):
    \${0:pass}`,
  },
  {
    label: 'withopen',
    detail: 'File context manager (with open)',
    documentation: 'Safely reads/writes file with automatic close.',
    insertText: `with open('\${1:filename.txt}', '\${2:r}', encoding='utf-8') as f:
    content = f.read()
    \${0}`,
  },
  {
    label: 'fastapi_route',
    detail: 'FastAPI endpoint',
    documentation: 'Defines asynchronous route handler in FastAPI.',
    insertText: `@app.get("/\${1:items}")
async def get_\${1:items}():
    return {"status": "success", "data": \${0:[]}}`,
  },
];

// 3. C / C++ Snippets
const CPP_SNIPPETS: SnippetItem[] = [
  {
    label: 'main',
    detail: 'C++ Main Boilerplate',
    documentation: 'Standard C++ main entrypoint with iostream.',
    insertText: `#include <iostream>
using namespace std;

int main() {
    \${0}
    return 0;
}`,
  },
  {
    label: 'cout',
    detail: 'std::cout << endl',
    documentation: 'Prints output to standard stream.',
    insertText: 'cout << ${1:output} << endl;',
  },
  {
    label: 'cin',
    detail: 'std::cin >> var',
    documentation: 'Reads user input from standard stream.',
    insertText: 'cin >> ${1:var};',
  },
  {
    label: 'fori',
    detail: 'for loop with index i',
    documentation: 'Standard for loop iteration.',
    insertText: `for (int i = 0; i < \${1:n}; i++) {
    \${0}
}`,
  },
  {
    label: 'vector',
    detail: 'std::vector<T>',
    documentation: 'Dynamic array container.',
    insertText: 'vector<${1:int}> ${2:vec};',
  },
  {
    label: 'class',
    detail: 'C++ Class structure',
    documentation: 'C++ class with public & private members.',
    insertText: `class \${1:ClassName} {
public:
    \${1:ClassName}() {
        \${2}
    }
    ~\${1:ClassName}() {}

private:
    \${0}
};`,
  },
];

// 4. Java Snippets
const JAVA_SNIPPETS: SnippetItem[] = [
  {
    label: 'psvm',
    detail: 'public static void main(String[] args)',
    documentation: 'Java main entry point method.',
    insertText: `public static void main(String[] args) {
    \${0}
}`,
  },
  {
    label: 'sout',
    detail: 'System.out.println()',
    documentation: 'Prints line to standard output.',
    insertText: 'System.out.println(${1});',
  },
  {
    label: 'class',
    detail: 'Java Class boilerplate',
    documentation: 'Public Java class structure.',
    insertText: `public class \${1:ClassName} {
    public static void main(String[] args) {
        \${0}
    }
}`,
  },
];

let isRegistered = false;

export function registerLanguageSnippets(m: typeof monaco) {
  if (isRegistered) return;
  isRegistered = true;

  // JS/TS/React
  ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'].forEach((lang) => {
    m.languages.registerCompletionItemProvider(lang, {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: monaco.languages.CompletionItem[] = JS_TS_SNIPPETS.map((s) => ({
          label: s.label,
          kind: m.languages.CompletionItemKind.Snippet,
          detail: `⚡ ${s.detail}`,
          documentation: { value: `\`\`\`typescript\n${s.insertText}\n\`\`\`\n\n${s.documentation}` },
          insertText: s.insertText,
          insertTextRules: m.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          sortText: '00_' + s.label,
        }));

        return { suggestions };
      },
    });
  });

  // Python
  m.languages.registerCompletionItemProvider('python', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: monaco.languages.CompletionItem[] = PYTHON_SNIPPETS.map((s) => ({
        label: s.label,
        kind: m.languages.CompletionItemKind.Snippet,
        detail: `⚡ ${s.detail}`,
        documentation: { value: `\`\`\`python\n${s.insertText}\n\`\`\`\n\n${s.documentation}` },
        insertText: s.insertText,
        insertTextRules: m.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        sortText: '00_' + s.label,
      }));

      return { suggestions };
    },
  });

  // C / C++
  ['c', 'cpp'].forEach((lang) => {
    m.languages.registerCompletionItemProvider(lang, {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: monaco.languages.CompletionItem[] = CPP_SNIPPETS.map((s) => ({
          label: s.label,
          kind: m.languages.CompletionItemKind.Snippet,
          detail: `⚡ ${s.detail}`,
          documentation: { value: `\`\`\`cpp\n${s.insertText}\n\`\`\`\n\n${s.documentation}` },
          insertText: s.insertText,
          insertTextRules: m.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          sortText: '00_' + s.label,
        }));

        return { suggestions };
      },
    });
  });

  // Java
  m.languages.registerCompletionItemProvider('java', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: monaco.languages.CompletionItem[] = JAVA_SNIPPETS.map((s) => ({
        label: s.label,
        kind: m.languages.CompletionItemKind.Snippet,
        detail: `⚡ ${s.detail}`,
        documentation: { value: `\`\`\`java\n${s.insertText}\n\`\`\`\n\n${s.documentation}` },
        insertText: s.insertText,
        insertTextRules: m.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        sortText: '00_' + s.label,
      }));

      return { suggestions };
    },
  });
}

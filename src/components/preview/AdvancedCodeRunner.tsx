import React, { useState } from 'react';
import { Play, Trash2, Terminal, Cpu, Cloud } from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';

interface AdvancedCodeRunnerProps {
  code: string;
  extension: string;
  fileName: string;
}

type RunnerLog = { id: string; type: 'out' | 'err' | 'info'; text: string };

declare global {
  interface Window {
    loadPyodide?: any;
    pyodide?: any;
    electronAPI?: any;
  }
}

const isElectronRuntime = () => typeof window !== 'undefined' && Boolean(window.electronAPI);

export const AdvancedCodeRunner: React.FC<AdvancedCodeRunnerProps> = ({ code, extension, fileName }) => {
  const { settings } = useSettingsStore();
  const [logs, setLogs] = useState<RunnerLog[]>([]);
  const [running, setRunning] = useState(false);

  const addLog = (type: RunnerLog['type'], text: string) => {
    setLogs((prev) => [...prev, { id: `${Date.now()}_${Math.random()}`, type, text }]);
  };

  const formatArg = (arg: any): string => {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  };

  const stripTypeScript = (src: string): string => {
    return src
      .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '')
      .replace(/type\s+\w+\s*=[\s\S]*?;/g, '')
      .replace(/:\s*(string|number|boolean|any|void|unknown|never|Record<[\w\s,]+>|\w+\[\]|\w+)\b/g, '')
      .replace(/\bas\s+(string|number|boolean|any|unknown|\w+)\b/g, '');
  };

  const runJavaScript = async () => {
    const captured: string[] = [];
    const customConsole = {
      log: (...args: any[]) => captured.push(args.map(formatArg).join(' ')),
      error: (...args: any[]) => captured.push(`ERROR: ${args.map(formatArg).join(' ')}`),
      warn: (...args: any[]) => captured.push(`WARN: ${args.map(formatArg).join(' ')}`),
      info: (...args: any[]) => captured.push(`INFO: ${args.map(formatArg).join(' ')}`),
    };

    try {
      const start = performance.now();
      const executableCode = ['ts', 'tsx', 'mts', 'cts'].includes(extension.toLowerCase())
        ? stripTypeScript(code)
        : code;
      new Function('console', executableCode)(customConsole);
      const elapsed = (performance.now() - start).toFixed(2);
      captured.forEach((line) => addLog(line.startsWith('ERROR') ? 'err' : line.startsWith('WARN') ? 'info' : 'out', line));
      addLog('info', `Completed in ${elapsed} ms`);
    } catch (err: any) {
      addLog('err', `${err.name}: ${err.message}`);
    }
  };

  const runPythonWithPyodide = async () => {
    if (!settings.enablePyodideRunner) {
      addLog('err', 'Python runner is disabled. Enable Pyodide in Settings > Code Execution.');
      return;
    }

    try {
      addLog('info', 'Loading Pyodide runtime. First load can take a few seconds...');
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Pyodide CDN script.'));
          document.body.appendChild(script);
        });
      }

      if (!window.pyodide) {
        window.pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' });
      }

      const wrapped = `
import sys, io
_stdout = io.StringIO()
_stderr = io.StringIO()
sys.stdout = _stdout
sys.stderr = _stderr
try:
${code.split('\n').map((line) => `    ${line}`).join('\n')}
except Exception as e:
    print(type(e).__name__ + ': ' + str(e), file=sys.stderr)
result = (_stdout.getvalue(), _stderr.getvalue())
`;
      await window.pyodide.runPythonAsync(wrapped);
      const result = window.pyodide.globals.get('result').toJs();
      if (result[0]) addLog('out', result[0]);
      if (result[1]) addLog('err', result[1]);
      addLog('info', 'Python execution finished.');
    } catch (err: any) {
      addLog('err', err.message || String(err));
    }
  };

  const runCloudflareSandbox = async () => {
    if (!settings.enableCloudflareSandbox || !settings.cloudflareSandboxEndpoint) {
      addLog('err', 'Cloudflare Sandbox is disabled or endpoint is missing in Settings.');
      return;
    }

    try {
      const res = await fetch(settings.cloudflareSandboxEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: extension, fileName }),
      });
      const data = await res.json();
      if (data.stdout) addLog('out', data.stdout);
      if (data.stderr) addLog('err', data.stderr);
      addLog('info', `Cloudflare Sandbox status: ${res.status}`);
    } catch (err: any) {
      addLog('err', err.message || String(err));
    }
  };

  const runPython = async () => {
    // 1. If in Electron desktop, run native system Python directly
    if (isElectronRuntime() && window.electronAPI?.runNativeCode) {
      try {
        addLog('info', 'Executing with native System Python...');
        const result = await window.electronAPI.runNativeCode({ code, extension: 'py', fileName });
        if (result.stdout) addLog('out', result.stdout);
        if (result.stderr) addLog('err', result.stderr);
        if (result.error) addLog('err', result.error);
        addLog('info', `Process exited (code: ${result.code ?? 0})`);
        return;
      } catch (err: any) {
        addLog('info', `Native execution failed (${err.message}). Trying Pyodide...`);
      }
    }

    // 2. Web browser Pyodide WebAssembly fallback
    await runPythonWithPyodide();
  };

  const runNativeCompiler = async () => {
    if (!settings.enableNativeCompiler) {
      addLog('err', 'Native compiler is disabled in Settings.');
      return;
    }
    if (!isElectronRuntime() || !window.electronAPI?.runNativeCode) {
      addLog('err', 'Native GCC/G++ compile & run requires the Zenith Studio Desktop app. In web mode, use the Integrated Terminal or Cloudflare sandbox.');

      return;
    }

    try {
      const isCpp = ['cpp', 'cc', 'cxx'].includes(extension.toLowerCase());
      addLog('info', `Compiling & running with ${isCpp ? 'G++' : 'GCC'}...`);
      const result = await window.electronAPI.runNativeCode({ code, extension, fileName });
      if (result.stdout) addLog('out', result.stdout);
      if (result.stderr) addLog('err', result.stderr);
      if (result.error) addLog('err', result.error);
      addLog('info', `Program exited (code: ${result.code ?? 0})`);
    } catch (err: any) {
      addLog('err', err.message || String(err));
    }
  };

  const runCode = async () => {
    setRunning(true);
    addLog('info', `Running ${fileName}...`);
    const ext = extension.toLowerCase();
    try {
      if (['js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx', 'mts', 'cts'].includes(ext)) await runJavaScript();
      else if (['py', 'python'].includes(ext)) await runPython();
      else if (['c', 'cpp', 'cc', 'cxx', 'rs', 'go'].includes(ext)) await runNativeCompiler();
      else await runCloudflareSandbox();
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#11111b] border-l border-slate-800/80 overflow-hidden text-slate-200">
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">Advanced Code Runner</span>
        </div>
        <div className="flex items-center gap-2">
          {['c', 'cpp', 'cc', 'cxx'].includes(extension.toLowerCase()) && (
            <span className="text-[10px] text-orange-300 flex items-center gap-1"><Cpu className="w-3 h-3" /> GCC/G++</span>
          )}
          {['py'].includes(extension.toLowerCase()) && (
            <span className="text-[10px] text-yellow-300 flex items-center gap-1 font-mono">
              {isElectronRuntime() ? '🐍 Native Python' : '🐍 Pyodide'}
            </span>
          )}
          {settings.enableCloudflareSandbox && (
            <span className="text-[10px] text-cyan-300 flex items-center gap-1"><Cloud className="w-3 h-3" /> Cloudflare</span>
          )}
          <button onClick={runCode} disabled={running} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs font-semibold cursor-pointer">
            <Play className="w-3 h-3 fill-current" /> {running ? 'Running...' : 'Run'}
          </button>
          <button onClick={() => setLogs([])} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="p-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['js', 'jsx', 'ts', 'tsx'].includes(extension.toLowerCase()) ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              JavaScript / TypeScript In-Browser Engine Active
            </span>
          ) : ['py'].includes(extension.toLowerCase()) ? (
            <span className="text-yellow-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              {isElectronRuntime() ? 'System Python 3.x Engine Active' : 'Python Pyodide WebAssembly Engine Active'}
            </span>
          ) : ['c', 'cpp', 'cc', 'cxx'].includes(extension.toLowerCase()) ? (
            <span className="text-orange-400 font-medium flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              {isElectronRuntime() ? 'GCC / G++ Native Compiler Active' : 'C/C++ Compiler'}
            </span>
          ) : (
            <span className="text-slate-400">Multi-Language Sandbox</span>
          )}
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          File: {fileName}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 bg-[#0d0e15]">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600">Click Run to execute supported code.</div>
        ) : logs.map((log) => (
          <pre key={log.id} className={`whitespace-pre-wrap p-2 rounded border ${log.type === 'err' ? 'text-red-300 bg-red-950/30 border-red-800/60' : log.type === 'info' ? 'text-blue-300 bg-blue-950/20 border-blue-800/40' : 'text-slate-200 bg-slate-900 border-slate-800'}`}>
            {log.text}
          </pre>
        ))}
      </div>
    </div>
  );
};
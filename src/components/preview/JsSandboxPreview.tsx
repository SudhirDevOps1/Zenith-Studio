import React, { useState } from 'react';
import { Play, Trash2, Terminal, CheckCircle2, AlertOctagon } from 'lucide-react';

interface JsSandboxPreviewProps {
  code: string;
}

interface ConsoleLog {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  messages: string[];
  time: string;
}

export const JsSandboxPreview: React.FC<JsSandboxPreviewProps> = ({ code }) => {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  const runCode = () => {
    setLogs([]);
    setHasError(false);
    const newLogs: ConsoleLog[] = [];
    const startTime = performance.now();

    const customConsole = {
      log: (...args: any[]) => {
        newLogs.push({
          id: Math.random().toString(),
          type: 'log',
          messages: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)),
          time: new Date().toLocaleTimeString(),
        });
      },
      error: (...args: any[]) => {
        newLogs.push({
          id: Math.random().toString(),
          type: 'error',
          messages: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)),
          time: new Date().toLocaleTimeString(),
        });
      },
      warn: (...args: any[]) => {
        newLogs.push({
          id: Math.random().toString(),
          type: 'warn',
          messages: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)),
          time: new Date().toLocaleTimeString(),
        });
      },
      info: (...args: any[]) => {
        newLogs.push({
          id: Math.random().toString(),
          type: 'info',
          messages: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)),
          time: new Date().toLocaleTimeString(),
        });
      },
    };

    try {
      // Strip TS type annotations if basic
      let jsCode = code;
      // Evaluate function inside isolated function context passing custom console
      const runner = new Function('console', jsCode);
      runner(customConsole);
    } catch (err: any) {
      setHasError(true);
      newLogs.push({
        id: Math.random().toString(),
        type: 'error',
        messages: [err.name ? `${err.name}: ${err.message}` : String(err)],
        time: new Date().toLocaleTimeString(),
      });
    }

    const endTime = performance.now();
    setExecutionTime(Number((endTime - startTime).toFixed(2)));
    setLogs(newLogs);
  };

  const clearConsole = () => {
    setLogs([]);
    setExecutionTime(null);
    setHasError(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#11111b] border-l border-slate-800/80 overflow-hidden text-slate-200">
      {/* Control Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold text-slate-200">Interactive JS Console</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runCode}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-xs transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Script</span>
          </button>
          <button
            onClick={clearConsole}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Execution status banner */}
      {executionTime !== null && (
        <div className={`px-4 py-1.5 border-b text-[11px] font-mono flex items-center justify-between ${hasError ? 'bg-red-950/40 border-red-800 text-red-300' : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'}`}>
          <div className="flex items-center gap-1.5">
            {hasError ? <AlertOctagon className="w-3.5 h-3.5 text-red-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{hasError ? 'Execution finished with errors' : 'Execution completed successfully'}</span>
          </div>
          <span>Elapsed: {executionTime} ms</span>
        </div>
      )}

      {/* Output Console Log Window */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 bg-[#0d0e15]">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-1">
            <span>Click &quot;Run Script&quot; to execute active code</span>
            <span className="text-[11px] text-slate-700">Output logs &amp; exceptions will be printed here</span>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded border font-mono text-[12px] flex flex-col gap-1 ${
                log.type === 'error'
                  ? 'bg-red-950/40 border-red-800/80 text-red-300'
                  : log.type === 'warn'
                  ? 'bg-amber-950/40 border-amber-800/80 text-amber-300'
                  : 'bg-slate-900/80 border-slate-800/80 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800/40 pb-0.5">
                <span className="uppercase tracking-wider font-bold">{log.type}</span>
                <span>{log.time}</span>
              </div>
              <div className="whitespace-pre-wrap font-mono">
                {log.messages.join(' ')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

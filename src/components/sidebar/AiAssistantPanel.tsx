import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Trash2,
  Copy,
  Check,
  Code2,
  Bug,
  Zap,
  FileText,
  FileCode,
  Loader2,
  ArrowDownToLine,
  SlidersHorizontal,
} from 'lucide-react';

import { useFileStore } from '../../stores/useFileStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useToastStore } from '../../stores/useToastStore';
import { ACCENT_PALETTE } from '../../utils/accentThemes';
import { generateAiContent } from '../../utils/aiService';
import { AiSetupModal } from '../ui/AiSetupModal';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  codeSnippet?: string;
  timestamp: string;
}

export const AiAssistantPanel: React.FC = () => {
  const { files, activeFileId, updateFileContent } = useFileStore();
  const { settings } = useSettingsStore();
  const { addToast } = useToastStore();

  const currentAccent = ACCENT_PALETTE[settings.accentColor] || ACCENT_PALETTE.blue;
  const activeFile = files.find((f) => f.id === activeFileId);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      sender: 'ai',
      text: `👋 Hi! I'm **Zenith Studio AI Assistant**.\n\nConnected to **${(settings.aiProvider || 'gemini').toUpperCase()}** (${settings.aiModel || 'gemini-1.5-flash'}).\n\nI can explain your code, fix bugs, optimize architecture, generate unit tests, or build new features. Choose an action below or ask any question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Bug #4: Keep welcome message in sync with provider/model settings changes
  useEffect(() => {
    setMessages((prev) => [
      {
        ...prev[0],
        text: `👋 Hi! I'm **Zenith Studio AI Assistant**.\n\nConnected to **${(settings.aiProvider || 'gemini').toUpperCase()}** (${settings.aiModel || 'gemini-1.5-flash'}).\n\nI can explain your code, fix bugs, optimize architecture, generate unit tests, or build new features. Choose an action below or ask any question!`,
      },
      ...prev.slice(1),
    ]);
  }, [settings.aiProvider, settings.aiModel]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const callAi = async (prompt: string, codeContext?: string) => {
    const activeKey = settings.aiApiKey || settings.geminiApiKey || '';
    if (!activeKey && settings.aiProvider !== 'ollama') {
      setIsSetupModalOpen(true);
      addToast({
        type: 'warning',
        title: 'AI Setup Required',
        message: 'Please configure your API key or provider endpoint in AI Setup.',
      });
      return;
    }

    const userMsgId = `user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const systemInstruction = `You are Zenith Studio AI, an elite software architect and pair programmer. Provide clear, production-ready, clean, and concise responses. Always format code blocks using standard markdown triple backticks with language identifiers (e.g. \`\`\`tsx ... \`\`\`).`;


      let fullPrompt = prompt;
      if (codeContext && activeFile) {
        fullPrompt += `\n\n--- ACTIVE FILE: ${activeFile.name} (${activeFile.extension || 'code'}) ---\n\`\`\`${activeFile.extension || ''}\n${codeContext}\n\`\`\``;
      }

      const aiReplyText = await generateAiContent(fullPrompt, systemInstruction, settings);

      // Extract primary code block if available
      const codeMatch = aiReplyText.match(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);
      const extractedCode = codeMatch ? codeMatch[1].trim() : undefined;

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        codeSnippet: extractedCode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Error generating response:** ${err.message}\n\n*Click "AI Setup" in the top bar to verify your API Key or Provider endpoint.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (actionType: 'explain' | 'fix' | 'optimize' | 'tests' | 'docs') => {
    if (!activeFile) {
      addToast({
        type: 'warning',
        title: 'No Active File',
        message: 'Open a file in the editor first to run AI quick actions.',
      });
      return;
    }

    const code = activeFile.content || '';
    switch (actionType) {
      case 'explain':
        callAi(`Please explain how this code in ${activeFile.name} works step-by-step, including key logic and structure.`, code);
        break;
      case 'fix':
        callAi(`Analyze the code in ${activeFile.name} for bugs, syntax errors, and edge case issues. Provide the fixed, complete working code.`, code);
        break;
      case 'optimize':
        callAi(`Refactor and optimize the code in ${activeFile.name} for cleaner architecture, modern best practices, and better performance.`, code);
        break;
      case 'tests':
        callAi(`Generate thorough unit tests for the code in ${activeFile.name}.`, code);
        break;
      case 'docs':
        callAi(`Add clear, comprehensive docstrings and comments throughout the code in ${activeFile.name}.`, code);
        break;
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast({ type: 'success', title: 'Copied to Clipboard' });
  };

  const handleApplyToEditor = (codeSnippet: string, msgId: string) => {
    if (!activeFileId) {
      addToast({
        type: 'warning',
        title: 'No Active File',
        message: 'Open a file in the editor to apply AI generated code.',
      });
      return;
    }

    updateFileContent(activeFileId, codeSnippet);
    setAppliedId(msgId);
    setTimeout(() => setAppliedId(null), 2500);
    addToast({
      type: 'success',
      title: 'Code Applied to Editor',
      message: `Active file ${activeFile?.name || ''} was updated with AI output.`,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#181825] border-r border-slate-800/80 text-slate-300 font-sans select-none relative overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 bg-[#1e1e2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
              Zenith Studio AI
            </span>

          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 hover:text-white rounded-lg text-[10px] font-semibold transition cursor-pointer"
            title="Configure Provider, API Key & Auto-Detect Models"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>AI Setup</span>
          </button>
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Provider & File Context Bar */}
      <div className="px-3 py-1.5 bg-[#14141f]/90 border-b border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1 truncate max-w-[65%]">
          <FileCode className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="text-slate-500">Context:</span>
          <span className="font-mono text-slate-200 font-medium truncate">
            {activeFile ? activeFile.name : 'No file open'}
          </span>
        </span>
        <button
          onClick={() => setIsSetupModalOpen(true)}
          className="font-mono text-[9px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 truncate max-w-[35%] transition"
          title={`Provider: ${settings.aiProvider || 'gemini'} | Model: ${settings.aiModel || 'default'}`}
        >
          {settings.aiModel || 'gemini-1.5-flash'}
        </button>
      </div>

      {/* Quick Action Buttons */}
      <div className="p-2 border-b border-slate-800 bg-[#181825] flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => handleQuickAction('explain')}
          disabled={loading || !activeFile}
          className="flex items-center gap-1 px-2 py-1 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 text-slate-200 hover:text-white rounded-md text-[10px] whitespace-nowrap border border-slate-700/60 transition"
          title="Explain active file code"
        >
          <Code2 className="w-3 h-3 text-blue-400" /> Explain
        </button>
        <button
          onClick={() => handleQuickAction('fix')}
          disabled={loading || !activeFile}
          className="flex items-center gap-1 px-2 py-1 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 text-slate-200 hover:text-white rounded-md text-[10px] whitespace-nowrap border border-slate-700/60 transition"
          title="Analyze and fix bugs"
        >
          <Bug className="w-3 h-3 text-red-400" /> Fix Bugs
        </button>
        <button
          onClick={() => handleQuickAction('optimize')}
          disabled={loading || !activeFile}
          className="flex items-center gap-1 px-2 py-1 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 text-slate-200 hover:text-white rounded-md text-[10px] whitespace-nowrap border border-slate-700/60 transition"
          title="Refactor and optimize performance"
        >
          <Zap className="w-3 h-3 text-amber-400" /> Refactor
        </button>
        <button
          onClick={() => handleQuickAction('tests')}
          disabled={loading || !activeFile}
          className="flex items-center gap-1 px-2 py-1 bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 text-slate-200 hover:text-white rounded-md text-[10px] whitespace-nowrap border border-slate-700/60 transition"
          title="Generate Unit Tests"
        >
          <FileText className="w-3 h-3 text-emerald-400" /> Tests
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: 'thin' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-1 text-[10px] text-slate-500 px-1">
              <span>{msg.sender === 'user' ? 'You' : 'Zenith Studio AI'}</span>

              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`p-3 rounded-xl text-xs max-w-[95%] leading-relaxed break-words whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.text}

              {/* Code Snippet Card with Apply to Editor Button */}
              {msg.codeSnippet && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap bg-black/20 p-2 rounded-lg">
                  <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                    <Code2 className="w-3 h-3" /> Code Generated
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(msg.codeSnippet!, msg.id)}
                      className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] transition"
                    >
                      {copiedId === msg.id ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => handleApplyToEditor(msg.codeSnippet!, msg.id)}
                      className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold transition shadow-sm"
                      title="Replace current active editor content with this code"
                    >
                      {appliedId === msg.id ? <Check className="w-2.5 h-2.5" /> : <ArrowDownToLine className="w-2.5 h-2.5" />}
                      <span>{appliedId === msg.id ? 'Applied!' : 'Apply to Editor'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2 bg-slate-900/50 rounded-lg border border-slate-800 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Generating with {settings.aiProvider || 'AI'}...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !loading) {
            callAi(input.trim(), activeFile?.content);
          }
        }}
        className="p-2.5 border-t border-slate-800 bg-[#1e1e2e]"
      >
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask AI about ${activeFile ? activeFile.name : 'your code'}...`}
            disabled={loading}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{ backgroundColor: currentAccent.primary }}
            className="absolute right-1.5 p-1.5 disabled:opacity-40 text-white rounded-md transition hover:scale-105"
            title="Send prompt"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          </button>
        </div>
      </form>

      {/* AI Setup Configuration Modal */}
      <AiSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </div>
  );
};

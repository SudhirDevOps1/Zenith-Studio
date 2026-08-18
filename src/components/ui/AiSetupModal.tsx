import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Zap,
  Loader2,
  Eye,
  EyeOff,
  Cpu,
  RefreshCw,
  Link,
  ChevronDown,
} from 'lucide-react';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useToastStore } from '../../stores/useToastStore';
import { AiProvider } from '../../types/settings';
import {
  detectProviderModels,
  testAiConnection,
  ModelInfo,
  DEFAULT_PROVIDER_MODELS,
} from '../../utils/aiService';


interface AiSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROVIDER_OPTIONS: { id: AiProvider; label: string; tag: string }[] = [
  { id: 'gemini', label: 'Google Gemini', tag: 'Recommended / Free' },
  { id: 'openai', label: 'OpenAI (GPT-4o, o1, o3)', tag: 'Direct API' },
  { id: 'anthropic', label: 'Anthropic Claude', tag: 'Direct API' },
  { id: 'groq', label: 'Groq (Ultra-Fast)', tag: 'Llama 3.3 / DeepSeek' },
  { id: 'openrouter', label: 'OpenRouter', tag: 'All Models Hub' },
  { id: 'deepseek', label: 'DeepSeek', tag: 'V3 / R1 Reasoner' },
  { id: 'ollama', label: 'Ollama (Local LLM)', tag: 'Offline / Privacy' },
  { id: 'custom', label: 'Custom Provider', tag: 'OpenAI Compatible' },
];

export const AiSetupModal: React.FC<AiSetupModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettingsStore();
  const { addToast } = useToastStore();

  const [provider, setProvider] = useState<AiProvider>(settings.aiProvider || 'gemini');
  const [apiKey, setApiKey] = useState(settings.aiApiKey || settings.geminiApiKey || '');
  const [model, setModel] = useState(settings.aiModel || 'gemini-1.5-flash');
  const [showKey, setShowKey] = useState(false);

  // Custom provider state
  const [customProviderName, setCustomProviderName] = useState(settings.aiCustomProviderName || 'My Custom API');
  const [customEndpoint, setCustomEndpoint] = useState(settings.aiCustomEndpoint || 'https://api.example.com/v1/chat/completions');
  const [customModelName, setCustomModelName] = useState(settings.aiCustomModelName || 'gpt-4o');
  const [temperature, setTemperature] = useState(settings.aiTemperature ?? 0.3);

  // Auto-detection and test states
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);


  useEffect(() => {
    if (isOpen) {
      setProvider(settings.aiProvider || 'gemini');
      setApiKey(settings.aiApiKey || settings.geminiApiKey || '');
      setModel(settings.aiModel || 'gemini-1.5-flash');
      setCustomProviderName(settings.aiCustomProviderName || 'My Custom API');
      setCustomEndpoint(settings.aiCustomEndpoint || 'https://api.example.com/v1/chat/completions');
      setCustomModelName(settings.aiCustomModelName || 'gpt-4o');
      setTemperature(settings.aiTemperature ?? 0.3);
      setTestResult(null);
    }
  }, [isOpen, settings]);

  // Bug #1 + #2 + #5: On provider switch — clear old key, reset model to provider default,
  // clear test result, and only auto-detect if a key already exists.
  useEffect(() => {
    const defaultModel = (DEFAULT_PROVIDER_MODELS[provider] || [])[0] || '';
    setApiKey('');
    setModel(defaultModel);
    setTestResult(null);
    setAvailableModels([]);
    // Only attempt detection if a key is already saved for this provider
    const savedKey = (settings.aiProvider === provider)
      ? (settings.aiApiKey || settings.geminiApiKey || '')
      : '';
    if (savedKey.trim()) {
      handleDetectModels(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const handleDetectModels = async (showToastMessage = true) => {
    setIsDetecting(true);
    try {
      const detected = await detectProviderModels({
        aiProvider: provider,
        aiApiKey: apiKey.trim(),
        geminiApiKey: apiKey.trim(),
        aiCustomEndpoint: customEndpoint.trim(),
        aiCustomModelName: customModelName.trim(),
        aiModel: model.trim(),
      });
      setAvailableModels(detected);
      // Only auto-select first model if current model not in list
      if (detected.length > 0 && !detected.some((m) => m.id === model)) {
        const firstId = detected[0].id;
        setModel(firstId);
        if (provider === 'custom') setCustomModelName(firstId);
      }
      if (showToastMessage) {
        addToast({
          type: 'success',
          title: 'Models Auto-Detected',
          message: `Found ${detected.length} model${detected.length !== 1 ? 's' : ''} available for ${provider.toUpperCase()}.`,
        });
      }
    } catch (err: any) {
      if (showToastMessage) {
        addToast({
          type: 'warning',
          title: 'Detection Notice',
          message: 'Using standard default model list for this provider.',
        });
      }
    } finally {
      setIsDetecting(false);
    }
  };


  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testAiConnection({
        aiProvider: provider,
        aiApiKey: apiKey.trim(),
        geminiApiKey: apiKey.trim(),
        aiCustomEndpoint: customEndpoint.trim(),
        aiCustomModelName: (customModelName || model).trim(),
        aiModel: (model || customModelName).trim(),
        aiTemperature: temperature,
      });
      setTestResult(result);

      if (result.success) {
        handleDetectModels(false);
        addToast({
          type: 'success',
          title: 'Connection Succeeded',
          message: result.message,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Connection Failed',
          message: result.message,
        });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    updateSettings({
      aiProvider: provider,
      aiApiKey: apiKey.trim(),
      geminiApiKey: provider === 'gemini' ? apiKey.trim() : settings.geminiApiKey,
      aiModel: model,
      aiCustomProviderName: customProviderName.trim(),
      aiCustomEndpoint: customEndpoint.trim(),
      aiCustomModelName: customModelName.trim(),
      aiTemperature: temperature,
    });

    addToast({
      type: 'success',
      title: 'AI Settings Saved',
      message: `Configured ${provider.toUpperCase()} with model ${model}.`,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0e0f17] border border-cyan-500/40 shadow-2xl rounded-2xl flex flex-col overflow-hidden text-slate-200 font-sans animate-fade-in-up"
        style={{
          boxShadow: '0 0 40px rgba(6, 182, 212, 0.15), 0 20px 40px -15px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#12131f] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Link className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                AI Setup Configuration
              </h2>
              <p className="text-[11px] text-slate-400">
                Connect your LLM provider for intelligent code completion &amp; chat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[72vh] text-xs" style={{ scrollbarWidth: 'thin' }}>
          {/* 1. PROVIDER */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Provider
            </label>
            <div className="relative">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as AiProvider)}
                className="w-full bg-[#161726] border-2 border-cyan-500/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold outline-none appearance-none cursor-pointer focus:border-cyan-400 transition"
              >
                {PROVIDER_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-[#161726] text-white">
                    {opt.label} ({opt.tag})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* 2. API KEY */}
          {provider !== 'ollama' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  API Key
                </label>
                {provider === 'gemini' && (
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Get Free Gemini Key →
                  </a>
                )}
                {provider === 'groq' && (
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Get Free Groq Key →
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your API key here..."
                  className="w-full bg-[#141522] border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono transition"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                {typeof (window as any).electronAPI?.setSecret === 'function'
                  ? '🔐 Saved in OS Credential Vault (Windows DPAPI / macOS Keychain).'
                  : '💾 Saved in browser localStorage (web mode).'}
              </p>
            </div>
          )}

          {/* 3. MODEL NAME with Auto-Detect & Manual Mode */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Model Name
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualMode(!isManualMode)}
                  className="text-[10px] text-slate-400 hover:text-cyan-300 transition cursor-pointer font-medium"
                  title="Toggle manual text input vs discovered dropdown"
                >
                  {isManualMode ? '📋 Select from List' : '✍️ Type Manually'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDetectModels(true)}
                  disabled={isDetecting}
                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition font-medium cursor-pointer"
                  title="Fetch live active models from your API key"
                >
                  <RefreshCw className={`w-3 h-3 ${isDetecting ? 'animate-spin' : ''}`} />
                  <span>Auto-Detect</span>
                  {availableModels.length > 0 && (
                    <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-300 rounded-full text-[9px] border border-cyan-800/60">
                      {availableModels.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {!isManualMode && availableModels.length > 0 ? (
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    if (provider === 'custom') setCustomModelName(e.target.value);
                  }}
                  className="w-full bg-[#141522] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none appearance-none cursor-pointer focus:border-cyan-500 transition"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#141522] text-white">
                      {m.name} {m.description ? `(${m.description})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    if (provider === 'custom') setCustomModelName(e.target.value);
                  }}
                  placeholder="Enter model identifier (e.g. gpt-4o, claude-3-5-sonnet, gemini-2.0-flash)..."
                  className="w-full bg-[#141522] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 outline-none focus:border-cyan-500 transition"
                />
              </div>
            )}
          </div>


          {/* 4. CUSTOM PROVIDER SETTINGS BOX (Matches screenshot exactly) */}
          {provider === 'custom' && (
            <div className="p-4 rounded-xl border border-purple-500/40 bg-purple-950/15 space-y-3 animate-fade-in-up">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Custom Provider Settings</span>
              </div>

              {/* Provider Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={customProviderName}
                  onChange={(e) => setCustomProviderName(e.target.value)}
                  placeholder="e.g., My Custom API, Claude Instance..."
                  className="w-full bg-[#11121d] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-purple-400 font-mono transition"
                />
              </div>

              {/* API Endpoint URL */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  API Endpoint URL
                </label>
                <input
                  type="text"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  placeholder="https://api.example.com/v1/chat/completions"
                  className="w-full bg-[#11121d] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-purple-400 font-mono transition"
                />
              </div>

              {/* Custom Model Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Model Name
                </label>
                <input
                  type="text"
                  value={customModelName}
                  onChange={(e) => setCustomModelName(e.target.value)}
                  placeholder="e.g., gpt-4, claude-3-sonnet, llama2..."
                  className="w-full bg-[#11121d] border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-purple-400 font-mono transition"
                />
              </div>

              {/* Hint */}
              <div className="p-2.5 bg-black/30 rounded-lg border border-purple-900/40 text-[11px] text-purple-200/90 leading-relaxed flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">💡</span>
                <span>
                  Custom provider must support OpenAI-compatible API format. Ensure endpoint accepts POST requests with <code className="font-mono text-cyan-300">model</code>, <code className="font-mono text-cyan-300">messages</code>, and <code className="font-mono text-cyan-300">temperature</code> fields.
                </span>
              </div>
            </div>
          )}

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : 'bg-red-950/40 border-red-800/60 text-red-300'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <div className="flex-1">
                <span>{testResult.message}</span>
                {testResult.latencyMs && (
                  <span className="ml-2 font-mono text-[10px] text-emerald-400">
                    ({testResult.latencyMs} ms)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Matches screenshot exactly) */}
        <div className="px-5 py-3.5 bg-[#12131f] border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            {isTesting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            )}
            <span>{isTesting ? 'Testing...' : '⚡ Test Connection'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer hover:scale-[1.02]"
            >
              <Check className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

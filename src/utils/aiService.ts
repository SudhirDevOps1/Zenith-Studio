import { AiProvider, EditorSettings } from '../types/settings';

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  contextWindow?: number;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  modelsFound?: number;
}

// Fallback / default popular models per provider
export const DEFAULT_PROVIDER_MODELS: Record<AiProvider, string[]> = {
  gemini: [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash-8b',
    'gemini-1.0-pro',
  ],
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'o1',
    'o1-mini',
    'o3-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
  ],
  anthropic: [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
  ],
  groq: [
    'llama-3.3-70b-versatile',
    'deepseek-r1-distill-llama-70b',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
  ],
  openrouter: [
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-r1',
    'deepseek/deepseek-chat',
    'anthropic/claude-3.5-sonnet',
    'meta-llama/llama-3.3-70b-instruct',
    'openai/gpt-4o',
  ],
  ollama: [
    'llama3.3',
    'deepseek-r1',
    'qwen2.5-coder',
    'mistral',
    'codellama',
    'phi3',
  ],
  deepseek: [
    'deepseek-chat',
    'deepseek-reasoner',
  ],
  custom: [
    'llama-3.3-70b-versatile',
    'gpt-4o',
    'claude-3-5-sonnet-20241022',
    'deepseek-chat',
    'mistral-large',
  ],
};

/**
 * Smart Model Aliasing & Typo Correction
 */
export function normalizeModelName(rawModel: string, provider: AiProvider, endpoint = ''): string {
  const clean = (rawModel || '').trim();
  const isGroq = provider === 'groq' || endpoint.includes('api.groq.com');
  const isDeepSeek = provider === 'deepseek' || endpoint.includes('api.deepseek.com');
  const isAnthropic = provider === 'anthropic' || endpoint.includes('api.anthropic.com');
  const isOpenAI = provider === 'openai' || endpoint.includes('api.openai.com');

  if (isGroq) {
    if (clean === 'llama-3.3-70b' || clean === 'llama-3.3-70b-instruct' || clean === 'llama3-70b' || clean === 'llama-70b') {
      return 'llama-3.3-70b-versatile';
    }
    if (clean === 'llama-3.1-8b' || clean === 'llama-3.1-8b-instruct' || clean === 'llama3-8b' || clean === 'llama-8b') {
      return 'llama-3.1-8b-instant';
    }
    if (clean === 'deepseek-r1' || clean === 'deepseek-r1-70b' || clean === 'deepseek-70b') {
      return 'deepseek-r1-distill-llama-70b';
    }
    if (clean === 'mixtral' || clean === 'mixtral-8x7b') {
      return 'mixtral-8x7b-32768';
    }
  }

  if (isDeepSeek) {
    if (clean === 'deepseek-r1' || clean === 'r1') return 'deepseek-reasoner';
    if (clean === 'deepseek-v3' || clean === 'v3') return 'deepseek-chat';
  }

  if (isAnthropic) {
    if (clean === 'claude-3.5-sonnet' || clean === 'claude-3-5-sonnet') return 'claude-3-5-sonnet-20241022';
    if (clean === 'claude-3.5-haiku' || clean === 'claude-3-5-haiku') return 'claude-3-5-haiku-20241022';
  }

  if (isOpenAI) {
    if (clean === 'gpt-4' || clean === 'gpt4') return 'gpt-4o';
  }

  return clean;
}

/**
 * Resilient Multi-Layer AI Fetch
 * In Electron  → Uses native IPC (Electron net.request) — CORS never applies
 * In Web/Browser → Uses direct fetch → CORS proxy fallback
 */
async function safeAiFetch(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: any
): Promise<{ ok: boolean; status: number; data: any; error?: string }> {

  // ─── 1. Electron Native IPC (Zero CORS, Chromium network stack) ────────────
  const electronApi = (window as any).electronAPI;
  const isElectron = !!electronApi?.aiFetch;

  if (isElectron) {
    let ipcResult: any;
    try {
      ipcResult = await electronApi.aiFetch({ url, method, headers, body });
    } catch (e: any) {
      // IPC threw an exception — surface as clear error, don't silently fall through
      throw new Error(`IPC bridge error: ${e?.message || e}`);
    }

    if (!ipcResult) {
      throw new Error('No response from Electron IPC bridge. Restart the app and try again.');
    }

    // IPC responded — return directly regardless of HTTP status
    // (even 401/403 should be returned so the caller can show the proper error)
    if (ipcResult.status && ipcResult.status !== 0) {
      return ipcResult;
    }

    // status=0 means a low-level network failure (DNS, timeout, refused)
    if (ipcResult.status === 0 || ipcResult.ok === false) {
      const errMsg = ipcResult.error || ipcResult.statusText || 'Network error (status 0)';
      throw new Error(`Electron native request failed: ${errMsg}`);
    }

    return ipcResult;
  }

  // ─── 2. Web Mode: Direct Browser Fetch ────────────────────────────────────
  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const res = await fetch(url, fetchOptions);
    const contentType = res.headers.get('content-type') || '';
    let data: any;
    if (contentType.includes('application/json')) {
      data = await res.json().catch(() => ({}));
    } else {
      data = await res.text();
    }
    return { ok: res.ok, status: res.status, data };
  } catch (fetchErr: any) {
    console.warn(`Direct fetch to ${url} failed, attempting CORS proxy:`, fetchErr);

    // ─── 3. Web Mode: CORS Proxy Fallback ──────────────────────────────────
    try {
      const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
      const proxyOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };
      if (body && (method === 'POST' || method === 'PUT')) {
        proxyOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }
      const proxyRes = await fetch(proxyUrl, proxyOptions);
      const data = await proxyRes.json().catch(() => ({}));
      return { ok: proxyRes.ok, status: proxyRes.status, data };
    } catch (proxyErr: any) {
      let hostname = 'API endpoint';
      try { hostname = new URL(url).hostname; } catch {}
      return {
        ok: false,
        status: 0,
        data: null,
        error: `Could not connect to ${hostname} (${fetchErr?.message || 'Network / CORS error'}). Please check your API Key, Endpoint URL, and internet connection.`,
      };
    }
  }
}


/**
 * Auto-detect available models from the configured AI provider
 */
export async function detectProviderModels(settings: Partial<EditorSettings>): Promise<ModelInfo[]> {
  const provider = settings.aiProvider || 'gemini';
  const apiKey = settings.aiApiKey || settings.geminiApiKey || '';

  try {
    switch (provider) {
      case 'gemini': {
        if (!apiKey) return DEFAULT_PROVIDER_MODELS.gemini.map((id) => ({ id, name: id }));
        const res = await safeAiFetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
          'GET',
          {}
        );
        if (!res.ok) throw new Error(`Gemini API Error (${res.status}): ${res.data?.error?.message || res.error}`);
        const data = res.data;
        const models: ModelInfo[] = (data.models || [])
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => {
            const cleanId = m.name.replace(/^models\//, '');
            return {
              id: cleanId,
              name: m.displayName || cleanId,
              description: m.description,
            };
          });
        return models.length > 0 ? models : DEFAULT_PROVIDER_MODELS.gemini.map((id) => ({ id, name: id }));
      }

      case 'openai': {
        if (!apiKey) return DEFAULT_PROVIDER_MODELS.openai.map((id) => ({ id, name: id }));
        const res = await safeAiFetch('https://api.openai.com/v1/models', 'GET', {
          Authorization: `Bearer ${apiKey}`,
        });
        if (!res.ok) throw new Error(`OpenAI API Error (${res.status}): ${res.data?.error?.message || res.error}`);
        const data = res.data;
        const models: ModelInfo[] = (data.data || [])
          .filter((m: any) => m.id.includes('gpt') || m.id.includes('o1') || m.id.includes('o3'))
          .map((m: any) => ({ id: m.id, name: m.id }));
        return models.length > 0 ? models : DEFAULT_PROVIDER_MODELS.openai.map((id) => ({ id, name: id }));
      }

      case 'groq': {
        if (!apiKey) return DEFAULT_PROVIDER_MODELS.groq.map((id) => ({ id, name: id }));
        const res = await safeAiFetch('https://api.groq.com/openai/v1/models', 'GET', {
          Authorization: `Bearer ${apiKey}`,
        });
        if (!res.ok) throw new Error(`Groq API Error (${res.status}): ${res.data?.error?.message || res.error}`);
        const data = res.data;
        const models: ModelInfo[] = (data.data || []).map((m: any) => ({
          id: m.id,
          name: m.id,
          description: `Context: ${m.context_window || 'N/A'} tokens`,
        }));
        return models.length > 0 ? models : DEFAULT_PROVIDER_MODELS.groq.map((id) => ({ id, name: id }));
      }

      case 'openrouter': {
        const headers: Record<string, string> = {};
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
        const res = await safeAiFetch('https://openrouter.ai/api/v1/models', 'GET', headers);
        if (!res.ok) throw new Error(`OpenRouter API Error (${res.status}): ${res.data?.error?.message || res.error}`);
        const data = res.data;
        const models: ModelInfo[] = (data.data || []).slice(0, 50).map((m: any) => ({
          id: m.id,
          name: m.name || m.id,
          description: m.description,
        }));
        return models.length > 0 ? models : DEFAULT_PROVIDER_MODELS.openrouter.map((id) => ({ id, name: id }));
      }

      case 'ollama': {
        const endpoint = settings.aiCustomEndpoint || 'http://localhost:11434';
        const url = endpoint.replace(/\/v1.*$/, '') + '/api/tags';
        const res = await safeAiFetch(url, 'GET', {});
        if (!res.ok) throw new Error(`Ollama Error (${res.status}): ${res.error}`);
        const data = res.data;
        const models: ModelInfo[] = (data.models || []).map((m: any) => ({
          id: m.name,
          name: m.name,
          description: `Size: ${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB`,
        }));
        return models.length > 0 ? models : DEFAULT_PROVIDER_MODELS.ollama.map((id) => ({ id, name: id }));
      }

      case 'deepseek': {
        if (!apiKey) return DEFAULT_PROVIDER_MODELS.deepseek.map((id) => ({ id, name: id }));
        const res = await safeAiFetch('https://api.deepseek.com/v1/models', 'GET', {
          Authorization: `Bearer ${apiKey}`,
        });
        if (!res.ok) throw new Error(`DeepSeek API Error (${res.status}): ${res.data?.error?.message || res.error}`);
        const data = res.data;
        const models: ModelInfo[] = (data.data || []).map((m: any) => ({ id: m.id, name: m.id }));
        return models.length > 0 ? models : DEFAULT_PROVIDER_MODELS.deepseek.map((id) => ({ id, name: id }));
      }

      case 'custom': {
        const endpoint = settings.aiCustomEndpoint || 'https://api.example.com/v1/chat/completions';
        let baseUrl = endpoint.replace(/\/chat\/completions\/?$/, '').replace(/\/$/, '');
        if (!baseUrl.endsWith('/v1') && endpoint.includes('/v1')) {
          baseUrl = baseUrl.split('/v1')[0] + '/v1';
        }

        const modelsUrl = baseUrl.endsWith('/models') ? baseUrl : `${baseUrl}/models`;
        const discoveredModels: ModelInfo[] = [];

        try {
          const res = await safeAiFetch(
            modelsUrl,
            'GET',
            apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
          );
          if (res.ok && res.data) {
            const list = res.data.data || res.data.models || (Array.isArray(res.data) ? res.data : []);
            if (Array.isArray(list)) {
              list.forEach((m: any) => {
                const id = typeof m === 'string' ? m : m.id || m.name || m.model;
                if (id && typeof id === 'string') {
                  discoveredModels.push({
                    id,
                    name: m.name || id,
                    description: m.description || `Discovered from ${baseUrl}`,
                  });
                }
              });
            }
          }
        } catch (fetchErr) {
          console.warn(`Could not fetch models from ${modelsUrl}:`, fetchErr);
        }

        const manualModelIds = [
          settings.aiCustomModelName?.trim(),
          settings.aiModel?.trim(),
          ...DEFAULT_PROVIDER_MODELS.custom,
        ].filter(Boolean) as string[];

        const combinedList: ModelInfo[] = [];
        const seenIds = new Set<string>();

        manualModelIds.forEach((id) => {
          if (!seenIds.has(id)) {
            seenIds.add(id);
            combinedList.push({
              id,
              name: id,
              description: 'Configured manual model identifier',
            });
          }
        });

        discoveredModels.forEach((m) => {
          if (!seenIds.has(m.id)) {
            seenIds.add(m.id);
            combinedList.push(m);
          }
        });

        return combinedList.length > 0 ? combinedList : DEFAULT_PROVIDER_MODELS.custom.map((id) => ({ id, name: id }));
      }

      default: {
        return (DEFAULT_PROVIDER_MODELS[provider] || DEFAULT_PROVIDER_MODELS.gemini).map((id) => ({ id, name: id }));
      }
    }
  } catch (err: any) {
    console.warn(`Failed to auto-detect models for ${provider}:`, err);
    return (DEFAULT_PROVIDER_MODELS[provider] || DEFAULT_PROVIDER_MODELS.gemini).map((id) => ({ id, name: id }));
  }
}

/**
 * Universal Generate Content call supporting all providers
 */
export async function generateAiContent(
  prompt: string,
  systemInstruction: string,
  settings: EditorSettings
): Promise<string> {
  const provider = settings.aiProvider || 'gemini';
  const apiKey = settings.aiApiKey || settings.geminiApiKey || '';
  const rawModel = settings.aiModel || settings.aiCustomModelName || (DEFAULT_PROVIDER_MODELS[provider] || ['gpt-4o'])[0];
  const endpoint = settings.aiCustomEndpoint || '';
  const model = normalizeModelName(rawModel, provider, endpoint);
  const temperature = settings.aiTemperature ?? 0.3;

  // 1. Google Gemini
  if (provider === 'gemini') {
    if (!apiKey) throw new Error('Gemini API Key is missing. Click AI Setup to configure your key.');
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await safeAiFetch(geminiUrl, 'POST', {}, {
      contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }],
      generationConfig: { temperature, maxOutputTokens: 2048 },
    });

    if (!res.ok) {
      throw new Error(res.data?.error?.message || res.error || `Gemini API error (${res.status})`);
    }

    return res.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
  }

  // 2. Anthropic Claude (Direct API)
  if (provider === 'anthropic') {
    if (!apiKey) throw new Error('Anthropic API Key is missing. Click AI Setup to configure your key.');
    const anthropicUrl = 'https://api.anthropic.com/v1/messages';

    const res = await safeAiFetch(
      anthropicUrl,
      'POST',
      {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      {
        model,
        max_tokens: 2048,
        system: systemInstruction,
        messages: [{ role: 'user', content: prompt }],
        temperature,
      }
    );

    if (!res.ok) {
      throw new Error(res.data?.error?.message || res.error || `Anthropic API error (${res.status})`);
    }

    return res.data?.content?.[0]?.text || 'No response generated.';
  }

  // 3. OpenAI / Groq / OpenRouter / DeepSeek / Ollama / Custom (OpenAI Compatible)
  let endpointUrl = 'https://api.openai.com/v1/chat/completions';
  const headers: Record<string, string> = {};

  if (provider === 'openai') {
    endpointUrl = 'https://api.openai.com/v1/chat/completions';
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  } else if (provider === 'groq') {
    endpointUrl = 'https://api.groq.com/openai/v1/chat/completions';
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  } else if (provider === 'openrouter') {
    endpointUrl = 'https://openrouter.ai/api/v1/chat/completions';
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = 'https://zenith-studio-web.pages.dev';
    headers['X-Title'] = 'Zenith Studio';
  } else if (provider === 'deepseek') {
    endpointUrl = 'https://api.deepseek.com/v1/chat/completions';
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  } else if (provider === 'ollama') {
    endpointUrl = (settings.aiCustomEndpoint || 'http://localhost:11434').replace(/\/$/, '') + '/v1/chat/completions';
  } else if (provider === 'custom') {
    endpointUrl = settings.aiCustomEndpoint || 'https://api.example.com/v1/chat/completions';
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const res = await safeAiFetch(endpointUrl, 'POST', headers, {
    model: model || 'gpt-4o',
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt },
    ],
    temperature,
  });

  if (!res.ok) {
    const errorMsg = res.data?.error?.message || res.data?.message || res.error || `API error (${res.status}) from ${provider.toUpperCase()}`;
    throw new Error(errorMsg);
  }

  return res.data?.choices?.[0]?.message?.content || 'No response generated.';
}

/**
 * Test Connection with provider API.
 * Uses model listing (GET request) rather than a generation call to avoid CORS
 * issues in web mode and to provide a fast, reliable connection check.
 */
export async function testAiConnection(settings: Partial<EditorSettings>): Promise<TestConnectionResult> {
  const provider = settings.aiProvider || 'gemini';
  const startTime = performance.now();

  try {
    const models = await detectProviderModels(settings);
    const latencyMs = Math.round(performance.now() - startTime);

    if (models.length > 0) {
      return {
        success: true,
        message: `Successfully connected to ${provider.toUpperCase()}! Found ${models.length} available model${models.length !== 1 ? 's' : ''}. Latency: ${latencyMs}ms.`,
        latencyMs,
        modelsFound: models.length,
      };
    }

    return {
      success: true,
      message: `Connected to ${provider.toUpperCase()} (${latencyMs} ms). Ready for coding!`,
      latencyMs,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err.message || 'Check your API Key, Endpoint URL, or Model name.'}`,
    };
  }
}

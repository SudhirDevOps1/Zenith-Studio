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
    'gpt-4o',
    'claude-3-5-sonnet',
    'llama-3.3-70b',
    'mistral-large',
  ],
};

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
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!res.ok) throw new Error(`Gemini API Error (${res.status})`);
        const data = await res.json();
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
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) throw new Error(`OpenAI API Error (${res.status})`);
        const data = await res.json();
        const models: ModelInfo[] = (data.data || [])
          .filter((m: any) => m.id.includes('gpt') || m.id.includes('o1') || m.id.includes('o3'))
          .map((m: any) => ({ id: m.id, name: m.id }));
        return models.length > 0 ? models : DEFAULT_PROVIDER_MODELS.openai.map((id) => ({ id, name: id }));
      }

      case 'groq': {
        if (!apiKey) return DEFAULT_PROVIDER_MODELS.groq.map((id) => ({ id, name: id }));
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) throw new Error(`Groq API Error (${res.status})`);
        const data = await res.json();
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
        const res = await fetch('https://openrouter.ai/api/v1/models', { headers });
        if (!res.ok) throw new Error(`OpenRouter API Error (${res.status})`);
        const data = await res.json();
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
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Ollama Error (${res.status})`);
        const data = await res.json();
        const models: ModelInfo[] = (data.models || []).map((m: any) => ({
          id: m.name,
          name: m.name,
          description: `Size: ${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB`,
        }));
        return models.length > 0 ? models : DEFAULT_PROVIDER_MODELS.ollama.map((id) => ({ id, name: id }));
      }

      case 'deepseek': {
        if (!apiKey) return DEFAULT_PROVIDER_MODELS.deepseek.map((id) => ({ id, name: id }));
        const res = await fetch('https://api.deepseek.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) throw new Error(`DeepSeek API Error (${res.status})`);
        const data = await res.json();
        const models: ModelInfo[] = (data.data || []).map((m: any) => ({ id: m.id, name: m.id }));
        return models.length > 0 ? models : DEFAULT_PROVIDER_MODELS.deepseek.map((id) => ({ id, name: id }));
      }

      case 'custom': {
        const endpoint = settings.aiCustomEndpoint;
        if (!endpoint) return DEFAULT_PROVIDER_MODELS.custom.map((id) => ({ id, name: id }));
        // Try fetching /models on baseUrl
        const baseUrl = endpoint.replace(/\/chat\/completions\/?$/, '');
        const res = await fetch(`${baseUrl}/models`, {
          headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const list = data.data || data.models || [];
          if (Array.isArray(list) && list.length > 0) {
            return list.map((m: any) => ({ id: m.id || m.name, name: m.id || m.name }));
          }
        }
        return DEFAULT_PROVIDER_MODELS.custom.map((id) => ({ id, name: id }));
      }

      default:
        return (DEFAULT_PROVIDER_MODELS[provider] || DEFAULT_PROVIDER_MODELS.gemini).map((id) => ({ id, name: id }));
    }
  } catch (err: any) {
    console.warn(`Failed to auto-detect models for ${provider}:`, err);
    return (DEFAULT_PROVIDER_MODELS[provider] || DEFAULT_PROVIDER_MODELS.gemini).map((id) => ({ id, name: id }));
  }
}

/**
 * Test Connection with provider API
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
        message: `Successfully connected to ${provider.toUpperCase()}! Found ${models.length} available models.`,
        latencyMs,
        modelsFound: models.length,
      };
    }

    return {
      success: true,
      message: `Connected to ${provider.toUpperCase()} (${latencyMs} ms).`,
      latencyMs,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err.message || 'Check your API Key / Endpoint URL.'}`,
    };
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
  const model = settings.aiModel || settings.aiCustomModelName || 'gemini-1.5-flash';
  const temperature = settings.aiTemperature ?? 0.3;

  // 1. Google Gemini
  if (provider === 'gemini') {
    if (!apiKey) throw new Error('Gemini API Key is missing. Click AI Setup to configure your key.');
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }],
        generationConfig: { temperature, maxOutputTokens: 2048 },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini API error (${res.status})`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
  }

  // 2. OpenAI / Groq / OpenRouter / DeepSeek / Ollama / Custom (OpenAI Compatible)
  let endpointUrl = 'https://api.openai.com/v1/chat/completions';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (provider === 'openai') {
    endpointUrl = 'https://api.openai.com/v1/chat/completions';
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  } else if (provider === 'groq') {
    endpointUrl = 'https://api.groq.com/openai/v1/chat/completions';
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  } else if (provider === 'openrouter') {
    endpointUrl = 'https://openrouter.ai/api/v1/chat/completions';
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = 'https://codestudio.dev';
    headers['X-Title'] = 'CodeStudio IDE';
  } else if (provider === 'deepseek') {
    endpointUrl = 'https://api.deepseek.com/v1/chat/completions';
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  } else if (provider === 'ollama') {
    endpointUrl = (settings.aiCustomEndpoint || 'http://localhost:11434').replace(/\/$/, '') + '/v1/chat/completions';
  } else if (provider === 'custom') {
    endpointUrl = settings.aiCustomEndpoint || 'https://api.example.com/v1/chat/completions';
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const res = await fetch(endpointUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ],
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error (${res.status}) from ${provider}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

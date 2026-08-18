# 🔐 Skill: OS Encrypted Vault & Universal Multi-Provider AI Architecture

> **Category**: Security & AI Architecture  
> **Target**: Electron + React/Web Hybrid IDEs  
> **Status**: Production Verified (v1.0.3)

---

## 🎯 Purpose
Provide a standardized blueprint for:
1. Storing sensitive API keys securely in the OS Native Credential Store (Windows DPAPI `safeStorage` / macOS Keychain / Linux Secret Service) instead of plaintext `localStorage`.
2. Securely routing AI requests through the Electron Main Process via IPC with automatic network protocol fallback (`net.fetch` -> Node.js native `https.request` TLS/TCP) to bypass CORS and QUIC protocol errors (`net::ERR_QUIC_PROTOCOL_ERROR`).
3. Universal Multi-Provider AI round-trip test verification with 0 false positives.

---

## 🛠️ 1. Zero-Trust OS Vault Architecture

```
+-------------------------------------------------------------+
| Renderer (UI)                                               |
| - Memory-only active key state                              |
| - localStorage: Sanitized ({ aiApiKey: '', geminiApiKey: ''})|
+------------------------------+------------------------------+
                               | IPC (vault:setSecret)
+------------------------------v------------------------------+
| Electron Main Process                                       |
| - safeStorage.encryptString(key) (DPAPI)                    |
| - Writes ciphertext to %APPDATA%/zenith_secure_vault.json   |
+-------------------------------------------------------------+
```

### IPC Vault Implementation (`electron/main.js`):
```js
ipcMain.handle('vault:setSecret', async (_e, { key, value }) => {
  if (!safeStorage.isEncryptionAvailable()) return { success: false, error: 'Encryption unavailable' };
  const encrypted = safeStorage.encryptString(value);
  vault[key] = encrypted.toString('base64');
  fs.writeFileSync(vaultPath, JSON.stringify(vault, null, 2), 'utf-8');
  return { success: true };
});

ipcMain.handle('vault:getSecret', async (_e, { key }) => {
  if (!vault[key]) return { success: true, value: null };
  const buffer = Buffer.from(vault[key], 'base64');
  const decrypted = safeStorage.decryptString(buffer);
  return { success: true, value: decrypted };
});
```

---

## 🌐 2. Dual-Layer AI Network Transport (QUIC & CORS Immunity)

When Chromium encounters HTTP/3 / QUIC UDP socket failures, gracefully fall back to native Node.js TCP TLS:

```js
ipcMain.handle('ai:fetch', async (_e, { url, options }) => {
  // Layer 1: Electron net.fetch
  try {
    const res = await net.fetch(url, options);
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch (netErr) {
    // Layer 2: Node.js direct https.request (Bypasses Chromium QUIC network stack)
    return await nodeHttpsFetchDirect(url, options);
  }
});
```

---

## ✅ 3. Per-Provider Validation (Zero False-Positives)

Never validate keys using model list endpoints that have default fallback catch blocks. Use dedicated per-provider validation:

| Provider | Validation Endpoint |
|---|---|
| Gemini | `https://generativelanguage.googleapis.com/v1beta/models?key=${key}` |
| OpenAI | `https://api.openai.com/v1/models` (Bearer Token) |
| Groq | `https://api.groq.com/openai/v1/models` (Bearer Token) |
| Anthropic | `https://api.anthropic.com/v1/messages` (with max_tokens: 1) |
| DeepSeek | `https://api.deepseek.com/models` (Bearer Token) |
| OpenRouter | `https://openrouter.ai/api/v1/models` (Bearer Token) |
| Ollama | `${endpoint}/api/tags` |
| Custom (Universal) | `${endpoint}` (Direct 1-token POST test + `${baseUrl}/models` fallback) |

---

## 🚀 4. Universal Custom Provider Architecture (100% Extensible)

Zenith Studio supports **ANY OpenAI-compatible provider** without restriction:
- **Cloud LLM APIs**: Together AI, Cerebras, DeepInfra, Mistral AI, SambaNova, Groq, OpenRouter, Perplexity, Hyperbolic.
- **Local Self-Hosted LLMs**: LM Studio, Ollama, vLLM, LocalAI, FastChat, Text Generation WebUI, or custom Python/FastAPI endpoints.
- **Dual-Phase Ping & Verification**: Sends an ultra-fast 1-token test prompt directly to the user's custom endpoint (`/v1/chat/completions`) with automatic fallback to `${baseUrl}/models` for 100% connection reliability.
- **1-Click Quick Presets**: Built-in instant preset configuration chips in the AI Setup Configuration modal.

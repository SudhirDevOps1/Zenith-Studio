/**
 * Zenith Studio — Standalone System Network Bridge
 * Runs via system node.exe (trusted by Windows Firewall / Defender)
 * Guarantees 100% network connectivity even if electron.exe is blocked by OS firewall.
 */
const https = require('https');
const http = require('http');

let input = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', async () => {
  try {
    if (!input.trim()) {
      process.stdout.write(JSON.stringify({ ok: false, status: 0, error: 'Empty bridge input' }));
      process.exit(0);
    }

    const { url, method = 'POST', headers = {}, body = null } = JSON.parse(input);
    const bodyStr = body != null ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;

    // Use native global fetch in Node 18+
    if (typeof globalThis.fetch === 'function') {
      try {
        const fetchHeaders = {
          Accept: 'application/json, text/plain, */*',
          'User-Agent': 'Zenith-Studio-IDE/1.0.3',
        };
        for (const [k, v] of Object.entries(headers || {})) {
          if (!k) continue;
          fetchHeaders[String(k).trim()] = typeof v === 'string' ? v.replace(/[\r\n]+/g, ' ').trim() : String(v || '');
        }

        const init = {
          method: (method || 'POST').toUpperCase(),
          headers: fetchHeaders,
        };
        if (bodyStr && init.method !== 'GET' && init.method !== 'HEAD') {
          if (!fetchHeaders['Content-Type']) fetchHeaders['Content-Type'] = 'application/json';
          init.body = bodyStr;
        }

        const res = await globalThis.fetch(url, init);
        const contentType = res.headers.get('content-type') || '';
        let data;
        if (contentType.includes('application/json')) {
          data = await res.json().catch(() => ({}));
        } else {
          data = await res.text().catch(() => '');
        }

        process.stdout.write(JSON.stringify({
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          data,
        }));
        process.exit(0);
      } catch (nativeErr) {
        // Fallback to https.request below
      }
    }

    // Direct https/http socket fallback
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const transport = isHttps ? https : http;

    const reqHeaders = {
      Accept: 'application/json, text/plain, */*',
      'User-Agent': 'Zenith-Studio-IDE/1.0.3',
    };
    for (const [k, v] of Object.entries(headers || {})) {
      if (!k) continue;
      reqHeaders[String(k).trim()] = typeof v === 'string' ? v.replace(/[\r\n]+/g, ' ').trim() : String(v || '');
    }
    if (bodyStr && method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD') {
      if (!reqHeaders['Content-Type']) reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(bodyStr, 'utf8').toString();
    }

    const req = transport.request({
      hostname: urlObj.hostname,
      port: urlObj.port ? Number(urlObj.port) : (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: (method || 'POST').toUpperCase(),
      headers: reqHeaders,
      timeout: 45000,
      rejectUnauthorized: false,
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8');
        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          data = raw;
        }
        process.stdout.write(JSON.stringify({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage || '',
          data,
        }));
        process.exit(0);
      });
    });

    req.on('error', (err) => {
      process.stdout.write(JSON.stringify({ ok: false, status: 0, error: err.message }));
      process.exit(0);
    });

    if (bodyStr && method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD') {
      req.write(bodyStr);
    }
    req.end();
  } catch (err) {
    process.stdout.write(JSON.stringify({ ok: false, status: 0, error: err.message }));
    process.exit(0);
  }
});

const http = require('http');

const OLLAMA_HOST = '127.0.0.1';
const OLLAMA_PORT = 11434;
const PROXY_PORT = 11435;

function transformMessages(messages) {
  if (!Array.isArray(messages)) return messages;
  return messages.map(msg => {
    if (msg.role === 'developer') {
      return { ...msg, role: 'system' };
    }
    return msg;
  });
}

const server = http.createServer((req, res) => {
  let body = '';

  req.on('data', chunk => { body += chunk.toString(); });

  req.on('end', () => {
    try {
      if (body && req.method === 'POST' && req.url.includes('/chat/completions')) {
        const parsed = JSON.parse(body);
        if (parsed.messages) {
          parsed.messages = transformMessages(parsed.messages);
          body = JSON.stringify(parsed);
        }
      }
    } catch (_) {}

    const options = {
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `${OLLAMA_HOST}:${OLLAMA_PORT}`, 'content-length': Buffer.byteLength(body) },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });

    proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PROXY_PORT, '127.0.0.1', () => {
  console.log(`Ollama proxy running on port ${PROXY_PORT}`);
  console.log(`Forwarding to Ollama at ${OLLAMA_HOST}:${OLLAMA_PORT}`);
  console.log('Transforming "developer" → "system" roles');
});

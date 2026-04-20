const http = require('http');

const OLLAMA_HOST = '127.0.0.1';
const OLLAMA_PORT = 11434;
const PROXY_PORT = 11435;

// Transform "developer" role → "system"
function transformMessages(messages) {
  if (!Array.isArray(messages)) return messages;
  return messages.map(msg => {
    if (msg.role === 'developer') {
      return { ...msg, role: 'system' };
    }
    // Also handle array outputs in tool messages
    if (msg.role === 'tool' && Array.isArray(msg.output)) {
      return { ...msg, output: msg.output.join('\n') };
    }
    return msg;
  });
}

// Transform response output arrays to strings (for tool results)
function transformResponseOutput(output) {
  if (Array.isArray(output)) {
    return output.map(item => {
      if (item && typeof item === 'object' && item.type === 'function_call_output') {
        // Handle Responses API function call output
        if (Array.isArray(item.output)) {
          return { ...item, output: item.output.join('\n') };
        }
      }
      if (typeof item === 'string') return item;
      return item;
    });
  }
  return output;
}

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });

  req.on('end', async () => {
    const parsedBody = body ? JSON.parse(body) : {};
    
    // Transform messages based on endpoint
    if (body && req.method === 'POST') {
      if (req.url.includes('/chat/completions')) {
        // Chat Completions: transform messages array
        if (parsedBody.messages) {
          parsedBody.messages = transformMessages(parsedBody.messages);
        }
        body = JSON.stringify(parsedBody);
      } else if (req.url.includes('/responses')) {
        // Responses API: transform input messages
        if (parsedBody.input) {
          parsedBody.input = transformMessages(parsedBody.input);
        }
        // Also transform previous_response/output if present
        if (parsedBody.previous_response?.output) {
          parsedBody.previous_response.output = transformResponseOutput(parsedBody.previous_response.output);
        }
        body = JSON.stringify(parsedBody);
      }
    }

    const options = {
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: req.url,
      method: req.method,
      headers: { 
        ...req.headers, 
        host: `${OLLAMA_HOST}:${OLLAMA_PORT}`, 
        'content-length': Buffer.byteLength(body) 
      },
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
  console.log('Transforming: developer → system, array outputs → strings');
});

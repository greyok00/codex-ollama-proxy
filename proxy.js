#!/usr/bin/env node
/**
 * Codex ↔ Ollama Proxy
 * 
 * Transforms OpenAI Responses API format to Ollama chat format and back.
 * Handles:
 * - /v1/responses endpoint (Codex's new format)
 * - /v1/chat/completions endpoint (legacy)
 * - Tool/function call output array → string conversion
 * - Developer role → system role transformation
 */

const http = require('http');
const https = require('https');

const OLLAMA_HOST = '127.0.0.1';
const OLLAMA_PORT = 11434;
const PROXY_PORT = 11435;

// URL to parse
const { URL } = require('url');

function log(...args) {
  const ts = new Date().toISOString();
  console.log(`[${ts}]`, ...args);
}

/**
 * Transform "developer" role to "system" role
 */
function transformRoles(messages) {
  if (!Array.isArray(messages)) return messages;
  return messages.map(msg => {
    if (msg && msg.role === 'developer') {
      return { ...msg, role: 'system' };
    }
    return msg;
  });
}

/**
 * Ensure tool/function call outputs are strings, not arrays
 * The error "json: cannot unmarshal array into Go struct field ResponsesFunctionCallOutput.output of type string"
 * means the output field must be a string
 */
function normalizeToolOutputs(messages) {
  if (!Array.isArray(messages)) return messages;
  return messages.map(msg => {
    if (!msg) return msg;
    
    // Handle tool_role messages
    if (msg.role === 'tool' || msg.role === 'function') {
      if (typeof msg.content === 'object' && msg.content !== null) {
        msg.content = JSON.stringify(msg.content);
      }
      if (Array.isArray(msg.content)) {
        msg.content = msg.content.map(item => 
          typeof item === 'object' ? JSON.stringify(item) : String(item)
        ).join('\n');
      }
    }
    
    // Handle responses with output arrays
    if (msg.output && Array.isArray(msg.output)) {
      msg.output = msg.output.map(item => 
        typeof item === 'object' ? JSON.stringify(item) : String(item)
      ).join('\n');
    }
    
    // Handle tool_calls with array outputs
    if (msg.tool_calls && Array.isArray(msg.tool_calls)) {
      msg.tool_calls = msg.tool_calls.map(tc => {
        if (tc.function && tc.function.output && Array.isArray(tc.function.output)) {
          tc.function.output = tc.function.output.join('\n');
        }
        return tc;
      });
    }
    
    return msg;
  });
}

/**
 * Transform Codex Responses API format to Ollama chat format
 */
function responsesToOllama(body) {
  const messages = body.input || body.messages || [];
  
  // Transform roles and normalize outputs
  const transformed = normalizeToolOutputs(transformRoles(messages));
  
  return {
    model: body.model || 'qwen3.5:cloud',
    messages: transformed,
    stream: body.stream || false,
    options: {
      temperature: body.temperature || 0.7,
      num_predict: body.max_tokens || 4000,
    }
  };
}

/**
 * Transform Ollama response to OpenAI Responses API format
 */
function ollamaToResponses(ollamaResp) {
  const content = ollamaResp.message?.content || '';
  
  return {
    id: `resp_${Date.now()}`,
    object: 'response',
    created_at: Math.floor(Date.now() / 1000),
    model: ollamaResp.model || 'qwen3.5:cloud',
    output: [{
      type: 'message',
      role: 'assistant',
      content: [{
        type: 'output_text',
        text: content
      }]
    }],
    usage: {
      input_tokens: ollamaResp.prompt_eval_count || 0,
      output_tokens: ollamaResp.eval_count || 0,
      total_tokens: (ollamaResp.prompt_eval_count || 0) + (ollamaResp.eval_count || 0)
    }
  };
}

/**
 * Transform Ollama response to OpenAI Chat Completions format
 */
function ollamaToChat(ollamaResp) {
  return {
    id: `chatcmpl_${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: ollamaResp.model || 'qwen3.5:cloud',
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: ollamaResp.message?.content || ''
      },
      finish_reason: ollamaResp.done ? 'stop' : 'length'
    }],
    usage: {
      prompt_tokens: ollamaResp.prompt_eval_count || 0,
      completion_tokens: ollamaResp.eval_count || 0,
      total_tokens: (ollamaResp.prompt_eval_count || 0) + (ollamaResp.eval_count || 0)
    }
  };
}

/**
 * Make HTTP request to Ollama
 */
function requestOllama(payload, path = '/api/chat') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    
    const options = {
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Host': `${OLLAMA_HOST}:${OLLAMA_PORT}`
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Ollama response parse error: ${e.message}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Handle /v1/responses endpoint
 */
async function handleResponses(req, res) {
  try {
    const body = JSON.parse(req.body || '{}');
    log('POST /v1/responses', body.model || 'unknown model');
    
    // Transform to Ollama format
    const ollamaPayload = responsesToOllama(body);
    log('→ Ollama payload:', JSON.stringify(ollamaPayload).slice(0, 200));
    
    // Call Ollama
    const ollamaResp = await requestOllama(ollamaPayload);
    log('← Ollama response:', ollamaResp.message?.content?.slice(0, 100) || 'no content');
    
    // Transform back to Responses format
    const response = ollamaToResponses(ollamaResp);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (err) {
    log('Error handling /v1/responses:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

/**
 * Handle /v1/chat/completions endpoint
 */
async function handleChatCompletions(req, res) {
  try {
    const body = JSON.parse(req.body || '{}');
    log('POST /v1/chat/completions', body.model || 'unknown model');
    
    // Transform roles and normalize outputs
    const messages = normalizeToolOutputs(transformRoles(body.messages || []));
    
    const ollamaPayload = {
      model: body.model || 'qwen3.5:cloud',
      messages: messages,
      stream: false,
      options: {
        temperature: body.temperature || 0.7,
        num_predict: body.max_tokens || 4000,
      }
    };
    log('→ Ollama payload:', JSON.stringify(ollamaPayload).slice(0, 200));
    
    // Call Ollama
    const ollamaResp = await requestOllama(ollamaPayload);
    log('← Ollama response:', ollamaResp.message?.content?.slice(0, 100) || 'no content');
    
    // Transform back to Chat Completions format
    const response = ollamaToChat(ollamaResp);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (err) {
    log('Error handling /v1/chat/completions:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

/**
 * Handle /v1/models endpoint
 */
async function handleModels(req, res) {
  try {
    const modelsResp = await new Promise((resolve, reject) => {
      const options = {
        hostname: OLLAMA_HOST,
        port: OLLAMA_PORT,
        path: '/api/tags',
        method: 'GET',
        headers: { 'Host': `${OLLAMA_HOST}:${OLLAMA_PORT}` }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
    
    const models = (modelsResp.models || []).map(m => ({
      id: m.name,
      object: 'model',
      created: Date.now() / 1000,
      owned_by: 'ollama'
    }));
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ object: 'list', data: models }));
  } catch (err) {
    log('Error handling /v1/models:', err.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

// Main proxy server
const server = http.createServer(async (req, res) => {
  let body = '';
  
  req.on('data', chunk => { body += chunk.toString(); });
  
  req.on('end', async () => {
    req.body = body;
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    
    log(`${req.method} ${path}`);
    
    // Route requests
    if (req.method === 'POST') {
      if (path.includes('/v1/responses')) {
        await handleResponses(req, res);
        return;
      }
      if (path.includes('/v1/chat/completions')) {
        await handleChatCompletions(req, res);
        return;
      }
    }
    
    if (req.method === 'GET' && path.includes('/v1/models')) {
      await handleModels(req, res);
      return;
    }
    
    // Pass through other requests to Ollama
    try {
      const ollamaResp = await new Promise((resolve, reject) => {
        const options = {
          hostname: OLLAMA_HOST,
          port: OLLAMA_PORT,
          path: req.url,
          method: req.method,
          headers: { 
            ...req.headers, 
            host: `${OLLAMA_HOST}:${OLLAMA_PORT}`,
            'content-length': Buffer.byteLength(body)
          }
        };
        
        const proxyReq = http.request(options, (proxyRes) => {
          let data = '';
          proxyRes.on('data', chunk => data += chunk);
          proxyRes.on('end', () => resolve({ status: proxyRes.statusCode, headers: proxyRes.headers, data }));
        });
        
        proxyReq.on('error', reject);
        proxyReq.write(body);
        proxyReq.end();
      });
      
      res.writeHead(ollamaResp.status, ollamaResp.headers);
      res.end(ollamaResp.data);
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PROXY_PORT, '127.0.0.1', () => {
  log(`╔══════════════════════════════════════════════════════════╗`);
  log(`║     Codex ↔ Ollama Proxy                                ║`);
  log(`╠══════════════════════════════════════════════════════════╣`);
  log(`║  Listening on: http://127.0.0.1:${PROXY_PORT}              ║`);
  log(`║  Forwarding to:  http://${OLLAMA_HOST}:${OLLAMA_PORT}                ║`);
  log(`╠══════════════════════════════════════════════════════════╣`);
  log(`║  Transformations:                                        ║`);
  log(`║    • developer → system roles                            ║`);
  log(`║    • tool output arrays → strings                        ║`);
  log(`║    • /v1/responses ↔ Ollama format                       ║`);
  log(`║    • /v1/chat/completions ↔ Ollama format                ║`);
  log(`╚══════════════════════════════════════════════════════════╝`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down...');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('Received SIGINT, shutting down...');
  server.close(() => {
    log('Server closed');
    process.exit(0);
  });
});

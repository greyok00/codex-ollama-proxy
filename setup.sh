#!/bin/bash

echo "=== Codex Ollama Proxy Setup ==="
echo ""

# Check if Ollama is running
echo "Checking if Ollama is running..."
if curl -s http://127.0.0.1:11434/v1/models > /dev/null 2>&1; then
    echo "✓ Ollama is running on port 11434"
else
    echo "✗ Ollama is not running on port 11434"
    echo "Please start Ollama first with: ollama serve"
    exit 1
fi

echo ""
echo "Starting proxy on port 11435..."
node proxy.js &
PROXY_PID=$!
echo "Proxy started with PID: $PROXY_PID"

# Wait for proxy to start
sleep 2

# Test the proxy
echo ""
echo "Testing proxy..."
curl -s -X POST http://127.0.0.1:11435/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.5:cloud",
    "messages": [
      {"role": "developer", "content": "You are a helpful assistant"},
      {"role": "user", "content": "Say hello!"}
    ],
    "max_tokens": 10
  }' > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Proxy is working correctly"
else
    echo "✗ Proxy test failed"
    kill $PROXY_PID 2>/dev/null
    exit 1
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "To use the proxy with Codex:"
echo "1. Update your Codex config (~/.codex/config.toml)"
echo "2. Change base_url from http://127.0.0.1:11434/v1/ to http://127.0.0.1:11435/v1/"
echo "3. Restart Codex"
echo ""
echo "The proxy is running in the background."
echo "To stop it, run: kill $PROXY_PID"
echo ""
echo "Or run it manually with: node proxy.js"

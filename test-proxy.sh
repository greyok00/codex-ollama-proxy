#!/bin/bash
# Test the Codex ↔ Ollama Proxy

PROXY_URL="http://127.0.0.1:11435"

echo "Testing Codex ↔ Ollama Proxy at $PROXY_URL"
echo ""

# Test 1: Models endpoint
echo "1. Testing /v1/models..."
curl -s "$PROXY_URL/v1/models" | head -c 500
echo ""
echo ""

# Test 2: Chat completions with developer role
echo "2. Testing /v1/chat/completions (developer role transform)..."
curl -s -X POST "$PROXY_URL/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.5:cloud",
    "messages": [
      {"role": "developer", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Say hello in 3 words"}
    ]
  }' | head -c 500
echo ""
echo ""

# Test 3: Chat completions with tool output (array → string)
echo "3. Testing /v1/chat/completions (tool output normalization)..."
curl -s -X POST "$PROXY_URL/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.5:cloud",
    "messages": [
      {"role": "user", "content": "What is 2+2?"},
      {"role": "tool", "content": ["The answer is 4", "Calculated result: 4"]}
    ]
  }' | head -c 500
echo ""
echo ""

# Test 4: Responses API format
echo "4. Testing /v1/responses..."
curl -s -X POST "$PROXY_URL/v1/responses" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.5:cloud",
    "input": [
      {"role": "user", "content": "Say hi"}
    ]
  }' | head -c 500
echo ""
echo ""

echo "Tests complete!"

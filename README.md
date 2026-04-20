# Codex ↔ Ollama Proxy

A full OpenAI API-compatible proxy that transforms Codex's Responses API and Chat Completions API formats to Ollama's native format.

## Features

- **Full `/v1/` API support**: Handles both `/v1/responses` and `/v1/chat/completions` endpoints
- **Role transformation**: Converts `developer` role → `system` role
- **Tool output normalization**: Converts array outputs to strings
- **Bidirectional format conversion**: Transforms between OpenAI and Ollama response formats
- **System service**: Runs as a systemd service with automatic restart

## Quick Start

### Install as System Service

```bash
cd ~/codex-ollama-proxy
sudo ./install-service.sh
```

### Test the Proxy

```bash
./test-proxy.sh
```

### View Logs

```bash
sudo journalctl -u codex-ollama-proxy -f
```

## Configuration

Update your application settings to use the proxy:

```python
from openai import OpenAI

client = OpenAI(
    api_key="ollama",  # Any value works for local Ollama
    base_url="http://127.0.0.1:11435/v1/"
)
```

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /v1/responses` | Responses API → Ollama |
| `POST /v1/chat/completions` | Chat Completions API → Ollama |
| `GET /v1/models` | List available Ollama models |

## Transformations

### 1. Developer Role → System Role
```json
// Input
{"role": "developer", "content": "You are helpful"}

// Transformed
{"role": "system", "content": "You are helpful"}
```

### 2. Tool Output Arrays → Strings
```json
// Input
{"role": "tool", "output": ["result1", "result2"]}

// Transformed
{"role": "tool", "output": "result1\nresult2"}
```

## Troubleshooting

### Service won't start

```bash
# Check if Node.js is installed
node --version

# Check Ollama is running
ollama list

# View proxy logs
sudo journalctl -u codex-ollama-proxy -n 100
```

### Test connectivity

```bash
# Test direct Ollama access
curl http://127.0.0.1:11434/api/tags

# Test proxy
curl http://127.0.0.1:11435/v1/models
```

## Architecture

```
Application → Port 11435 (Proxy) → Port 11434 (Ollama)
    ↓            ↓                    ↓
OpenAI API   Transform           Ollama
Format       Roles/Output         Native
```

## License

MIT

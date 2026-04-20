# ⚠️ IMPORTANT: Run Proxy Outside Codex Sandbox

## The Problem

The proxy server cannot run inside the Codex sandbox because it needs network permissions to listen on a port.

## What You've Got

All files are in: `~/codex-ollama-proxy/`

- `proxy.js` - The proxy server
- `install-service.sh` - Installs as systemd service
- `README.md` - Full documentation

## Quick Setup

### 1. Install the service (outside Codex terminal)

```bash
cd ~/codex-ollama-proxy
sudo ./install-service.sh
```

### 2. Verify it's running

```bash
curl http://127.0.0.1:11435/v1/models
```

### 3. Update your Codex brain config

Set `OPENAI_BASE_URL` to `http://127.0.0.1:11435/v1/`

### 4. Restart Codex

## Troubleshooting

### Check service status
```bash
sudo systemctl status codex-ollama-proxy.service
```

### View logs
```bash
sudo journalctl -u codex-ollama-proxy -f
```

### Restart service
```bash
sudo systemctl restart codex-ollama-proxy.service
```

### If port is in use
```bash
sudo pkill -f "proxy.js"
sudo systemctl restart codex-ollama-proxy.service
```

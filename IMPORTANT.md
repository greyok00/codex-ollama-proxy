# ⚠️ IMPORTANT: Run Proxy Outside Sandbox

## The Problem

The proxy server needs network permissions to listen on a port and cannot run inside restricted sandboxes.

## Quick Setup

### 1. Install the service

```bash
cd ~/codex-ollama-proxy
sudo ./install-service.sh
```

### 2. Verify it's running

```bash
curl http://127.0.0.1:11435/v1/models
```

### 3. Configure your application

Set your application's API base URL to `http://127.0.0.1:11435/v1/`

### 4. Restart your application

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

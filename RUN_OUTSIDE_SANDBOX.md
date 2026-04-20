# Important: Run This Outside the Codex Sandbox

The proxy server needs to run outside the Codex sandbox environment because it requires network permissions to listen on a port.

## Why It Won't Work Here

The Codex sandbox environment restricts network operations for security, so the proxy cannot bind to a port while running inside the sandbox.

## How to Run It

You need to run the proxy in a regular terminal outside of Codex:

### Option 1: Quick Start (Recommended)

Open a new terminal (outside Codex) and run:

```bash
cd ~/codex-brain/codex-ollama-proxy
node proxy.js
```

Keep this terminal open - the proxy needs to stay running.

### Option 2: Run in Background

```bash
cd ~/codex-brain/codex-ollama-proxy
node proxy.js &
```

To stop it later:
```bash
pkill -f "node proxy.js"
```

## Complete Setup

1. Start Ollama (if not already running):
   ```bash
   ollama serve
   ```

2. Start the proxy (in a new terminal):
   ```bash
   cd ~/codex-brain/codex-ollama-proxy
   node proxy.js
   ```

3. Update Codex config:
   ```bash
   cd ~/codex-brain/codex-ollama-proxy
   ./update-config.sh
   ```

4. Restart Codex

5. Test it:
   ```bash
   cd ~/codex-brain/codex-ollama-proxy
   ./test-proxy.sh
   ```

## What You'll See

When the proxy is running, you'll see:
```
Ollama proxy running on port 11435
Forwarding requests to Ollama at 127.0.0.1:11434
Transforming "developer" roles to "system" roles
Press Ctrl+C to stop
```

## Summary

The proxy files are ready in ~/codex-brain/codex-ollama-proxy/, but you need to run the proxy outside the Codex sandbox in a regular terminal where it has the necessary network permissions.

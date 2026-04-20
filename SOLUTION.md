# Solution: Fix "developer role not supported" Error

## What's Wrong?

You're getting this error in Codex:
```
{"error":"developer is not one of ['system', 'assistant', 'user', 'tool', 'function']"}
```

**The Cause:**
- Codex CLI now uses OpenAI's newer API format with a "developer" role
- Ollama's OpenAI-compatible endpoint doesn't support the "developer" role yet
- When Codex sends messages with "developer" role, Ollama rejects them

**Why It Worked Before:**
- This is a recent change in Codex CLI
- Ollama hasn't updated to support the new role yet

## The Fix

Use a proxy that transforms "developer" roles to "system" roles.

## Step-by-Step Instructions

### Step 1: Start Ollama
```bash
ollama serve
```

### Step 2: Start the Proxy
```bash
cd ~/codex-brain/codex-ollama-proxy
node proxy.js
```

Keep this terminal open - the proxy needs to stay running.

### Step 3: Update Codex Config
Run the automated update script:
```bash
cd ~/codex-brain/codex-ollama-proxy
./update-config.sh
```

Or manually edit `~/.codex/config.toml`:
- Change `base_url = "http://127.0.0.1:11434/v1/"` to `base_url = "http://127.0.0.1:11435/v1/"`
- Change `openai_base_url = "http://127.0.0.1:11434/v1/"` to `openai_base_url = "http://127.0.0.1:11435/v1/"`

### Step 4: Restart Codex
Stop and restart Codex CLI.

### Step 5: Test It
```bash
cd ~/codex-brain/codex-ollama-proxy
./test-proxy.sh
```

## What the Proxy Does

The proxy runs on port 11435 and:
1. Intercepts requests from Codex
2. Transforms "developer" roles to "system" roles
3. Forwards requests to Ollama on port 11434
4. Returns responses unchanged

## Running the Proxy

**Foreground (to see logs):**
```bash
cd ~/codex-brain/codex-ollama-proxy
node proxy.js
```

**Background:**
```bash
cd ~/codex-brain/codex-ollama-proxy
node proxy.js &
```

**Stop it:**
```bash
pkill -f "node proxy.js"
```

## Quick Start Script

Run this to set everything up:
```bash
cd ~/codex-brain/codex-ollama-proxy
./setup.sh
```

## Files Created

- `proxy.js` - The proxy server
- `setup.sh` - Automated setup script
- `update-config.sh` - Updates Codex config
- `test-proxy.sh` - Tests the proxy
- `README.md` - Detailed documentation
- `SOLUTION.md` - This file

## Troubleshooting

**Proxy won't start?**
- Make sure port 11435 is free
- Check Node.js is installed

**Ollama connection errors?**
- Make sure Ollama is running: `ollama serve`
- Test Ollama directly: `curl http://127.0.0.1:11434/v1/models`

**Codex still shows error?**
- Restart Codex completely
- Check proxy is running: `ps aux | grep proxy.js`
- Verify config changes: `cat ~/.codex/config.toml | grep 11435`

## Why This Works

The "developer" role is OpenAI's newer format for providing better context. Ollama hasn't adopted it yet, so we transform it to the "system" role that Ollama does support. This maintains the functionality while working within Ollama's current limitations.

## Need Help?

Check the detailed README.md for more information, or review the proxy.js code to see exactly how the transformation works.

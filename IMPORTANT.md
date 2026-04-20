# ⚠️ IMPORTANT: Run Proxy Outside Codex Sandbox

## The Problem

I've created a complete solution for your Ollama + Codex issue, but the proxy server cannot run inside the Codex sandbox because it needs network permissions to listen on a port.

## What I've Created

All the files are ready in: `~/codex-brain/codex-ollama-proxy/`

- `proxy.js` - The proxy server
- `setup.sh` - Automated setup
- `update-config.sh` - Updates Codex config
- `test-proxy.sh` - Tests the proxy
- `README.md` - Full documentation
- `SOLUTION.md` - Quick reference
- `RUN_OUTSIDE_SANDBOX.md` - Detailed instructions

## What You Need to Do

### Step 1: Open a Regular Terminal

Open a new terminal window OUTSIDE of Codex (not in this Codex session).

### Step 2: Start Ollama

```bash
ollama serve
```

### Step 3: Start the Proxy

In the same terminal (or a new one):

```bash
cd ~/codex-brain/codex-ollama-proxy
node proxy.js
```

Keep this terminal open!

### Step 4: Update Codex Config

You can do this in Codex or another terminal:

```bash
cd ~/codex-brain/codex-ollama-proxy
./update-config.sh
```

### Step 5: Restart Codex

Stop and restart Codex CLI.

### Step 6: Test It

```bash
cd ~/codex-brain/codex-ollama-proxy
./test-proxy.sh
```

## That's It!

Once the proxy is running outside the sandbox and your Codex config is updated, Codex should work perfectly with Ollama.

The proxy will transform "developer" roles to "system" roles automatically, and you'll see the transformation in the proxy terminal when Codex makes requests.

## Need More Details?

Check out:
- `RUN_OUTSIDE_SANDBOX.md` - Detailed instructions
- `README.md` - Full documentation
- `SOLUTION.md` - Quick reference guide

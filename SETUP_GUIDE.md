# 🚀 Complete Setup Guide

## One-Command Setup (Recommended)

Run this single command to set up everything as services:

```bash
cd ~/codex-brain/codex-ollama-proxy && ./setup-complete.sh
```

This will:
- ✅ Install Ollama as a service
- ✅ Install the proxy as a service  
- ✅ Start both services
- ✅ Configure auto-start on login/boot
- ✅ Test everything works

## What You Get

After running the setup, you'll have:

1. **Ollama Service** - Runs in background, auto-restarts, starts on login
2. **Proxy Service** - Transforms developer roles, runs in background, auto-restarts
3. **Auto-Start** - Both services start automatically when you log in
4. **Zero Maintenance** - No terminals needed, everything runs as services

## Service Management

Once installed, manage services with:

```bash
# Check status
systemctl --user status ollama
systemctl --user status ollama-proxy

# Start/stop services
systemctl --user start ollama
systemctl --user stop ollama
systemctl --user start ollama-proxy
systemctl --user stop ollama-proxy

# View logs
journalctl --user -u ollama -f
journalctl --user -u ollama-proxy -f

# Restart services
systemctl --user restart ollama
systemctl --user restart ollama-proxy
```

## Verification

Test that everything works:

```bash
cd ~/codex-brain/codex-ollama-proxy
./test-proxy.sh
```

## Using Codex

Just use Codex normally! The proxy handles everything transparently.

## Manual Setup (Alternative)

If you prefer manual setup instead of services:

1. Start Ollama: `ollama serve`
2. Start proxy: `cd ~/codex-brain/codex-ollama-proxy && node proxy.js`
3. Update config: `cd ~/codex-brain/codex-ollama-proxy && ./update-config.sh`
4. Restart Codex

## Troubleshooting

### Services not running

```bash
# Check status
systemctl --user status ollama
systemctl --user status ollama-proxy

# View logs for errors
journalctl --user -u ollama -n 50
journalctl --user -u ollama-proxy -n 50
```

### Codex still shows error

1. Verify services are running
2. Check Codex config uses port 11435
3. Restart Codex completely
4. Run test script

### Need to reinstall

```bash
cd ~/codex-brain/codex-ollama-proxy
./uninstall-service.sh
./setup-complete.sh
```

## Files Created

All files in `~/codex-brain/codex-ollama-proxy/`:

**Core Files:**
- `proxy.js` - The proxy server
- `package.json` - Node.js package info

**Setup Scripts:**
- `setup-complete.sh` - Complete service setup ⭐
- `install-service.sh` - Install proxy service
- `uninstall-service.sh` - Remove service
- `update-config.sh` - Update Codex config
- `test-proxy.sh` - Test the proxy

**Service Files:**
- `ollama-proxy.service` - System service definition
- `ollama-proxy-user.service` - User service definition

**Documentation:**
- `README.md` - Full documentation
- `SERVICE.md` - Service management guide
- `SETUP_GUIDE.md` - This file
- `IMPORTANT.md` - Important notes
- `SOLUTION.md` - Quick reference
- `QUICKSTART` - Quick commands

## Next Steps

1. Run the setup: `./setup-complete.sh`
2. Verify it works: `./test-proxy.sh`
3. Use Codex normally!

Everything runs automatically in the background. No terminals needed!

## Support

- Full docs: `README.md`
- Service details: `SERVICE.md`
- Troubleshooting: Check logs with `journalctl --user -u ollama-proxy -f`

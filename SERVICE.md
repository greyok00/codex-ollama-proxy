# Ollama Proxy as a System Service

Run the Ollama proxy as a background service that starts automatically.

## Quick Install

### Option 1: User Service (Recommended)

Run as your user without sudo:

```bash
cd ~/codex-brain/codex-ollama-proxy
./install-service.sh
```

### Option 2: System-Wide Service

Run as a system service with sudo:

```bash
cd ~/codex-brain/codex-ollama-proxy
sudo ./install-service.sh
```

## What Gets Installed

The service will:
- Start automatically on login (user service) or boot (system service)
- Restart automatically if it crashes
- Run in the background with no terminal needed
- Log to systemd journal

## Service Management

### User Service Commands

```bash
# Start the service
systemctl --user start ollama-proxy

# Stop the service
systemctl --user stop ollama-proxy

# Restart the service
systemctl --user restart ollama-proxy

# Check status
systemctl --user status ollama-proxy

# View logs
journalctl --user -u ollama-proxy -f

# Enable/disable auto-start
systemctl --user enable ollama-proxy
systemctl --user disable ollama-proxy
```

### System-Wide Service Commands

```bash
# Start the service
sudo systemctl start ollama-proxy

# Stop the service
sudo systemctl stop ollama-proxy

# Restart the service
sudo systemctl restart ollama-proxy

# Check status
sudo systemctl status ollama-proxy

# View logs
sudo journalctl -u ollama-proxy -f

# Enable/disable auto-start
sudo systemctl enable ollama-proxy
sudo systemctl disable ollama-proxy
```

## Uninstall

```bash
cd ~/codex-brain/codex-ollama-proxy
./uninstall-service.sh
```

Or for system-wide:
```bash
cd ~/codex-brain/codex-ollama-proxy
sudo ./uninstall-service.sh
```

## How It Works

The service:
1. Runs `node proxy.js` from the codex-ollama-proxy directory
2. Listens on port 11435
3. Transforms "developer" roles to "system" roles
4. Restarts automatically if it crashes
5. Logs all activity to systemd journal

## Prerequisites

- Node.js installed (`/usr/bin/node`)
- Ollama running (`ollama serve`)
- Codex config updated to use port 11435

## Troubleshooting

### Service won't start

Check the logs:
```bash
# User service
journalctl --user -u ollama-proxy -n 50

# System service
sudo journalctl -u ollama-proxy -n 50
```

### Port already in use

Check what's using port 11435:
```bash
sudo lsof -i :11435
```

### Ollama connection errors

Make sure Ollama is running:
```bash
ollama serve
```

Or check if Ollama is running:
```bash
systemctl status ollama  # if Ollama is also a service
ps aux | grep ollama
```

### Service starts but Codex still shows error

1. Check service is running:
   ```bash
   systemctl --user status ollama-proxy
   ```

2. Check Codex config uses port 11435:
   ```bash
   cat ~/.codex/config.toml | grep 11435
   ```

3. Test the proxy:
   ```bash
   cd ~/codex-brain/codex-ollama-proxy
   ./test-proxy.sh
   ```

4. Restart Codex completely

## Logs and Monitoring

### View real-time logs
```bash
# User service
journalctl --user -u ollama-proxy -f

# System service
sudo journalctl -u ollama-proxy -f
```

### View recent logs
```bash
# User service
journalctl --user -u ollama-proxy -n 100

# System service
sudo journalctl -u ollama-proxy -n 100
```

### View logs since boot
```bash
# User service
journalctl --user -u ollama-proxy -b

# System service
sudo journalctl -u ollama-proxy -b
```

## Service File Details

The service includes:
- **Auto-restart**: Restarts if crashes (after 10 second delay)
- **Auto-start**: Starts on login (user) or boot (system)
- **Logging**: Logs to systemd journal
- **Security**: Runs with restricted permissions
- **Working directory**: Runs from the codex-ollama-proxy directory

## User vs System Service

### User Service (Recommended)
- Runs as your user
- No sudo required
- Starts when you log in
- Better for personal use
- Easier to manage

### System Service
- Runs as root (or specified user)
- Requires sudo
- Starts at boot
- Better for multi-user systems
- More complex setup

## Making Ollama a Service Too

For a complete setup, make Ollama a service as well:

### User Service for Ollama

Create `~/.config/systemd/user/ollama.service`:
```ini
[Unit]
Description=Ollama Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
```

Then:
```bash
systemctl --user daemon-reload
systemctl --user enable ollama
systemctl --user start ollama
```

### System Service for Ollama

Many systems already have this. Check:
```bash
systemctl status ollama
```

If not available, create `/etc/systemd/system/ollama.service`:
```ini
[Unit]
Description=Ollama Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl start ollama
```

## Complete Setup

For a complete hands-off setup:

1. Install Ollama as a service (if not already)
2. Install the proxy as a service
3. Update Codex config
4. Restart Codex

Everything will start automatically and run in the background!

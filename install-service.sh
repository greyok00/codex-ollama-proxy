#!/bin/bash
# Install Codex ↔ Ollama Proxy as a system service

set -e

PROXY_DIR="/home/grey/codex-ollama-proxy"
SERVICE_FILE="$PROXY_DIR/codex-ollama-proxy.service"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     Installing Codex ↔ Ollama Proxy System Service       ║"
echo "╚══════════════════════════════════════════════════════════╝"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run with sudo: sudo ./install-service.sh"
  exit 1
fi

# Check Node.js is available
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed"
  exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Create log directory
LOG_DIR="/var/log/codex-ollama-proxy"
if [ ! -d "$LOG_DIR" ]; then
  mkdir -p "$LOG_DIR"
  chown grey:grey "$LOG_DIR"
  echo "✓ Created log directory: $LOG_DIR"
fi

# Install service file
echo "Installing service file..."
cp "$SERVICE_FILE" /etc/systemd/system/codex-ollama-proxy.service
systemctl daemon-reload
echo "✓ Service file installed"

# Enable and start service
echo "Enabling and starting service..."
systemctl enable codex-ollama-proxy.service
systemctl start codex-ollama-proxy.service

# Check status
sleep 2
if systemctl is-active --quiet codex-ollama-proxy.service; then
  echo "✓ Service started successfully"
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║     Installation Complete!                               ║"
  echo "╠══════════════════════════════════════════════════════════╣"
  echo "║  Service: codex-ollama-proxy                             ║"
  echo "║  Endpoint: http://127.0.0.1:11435                        ║"
  echo "║  Logs: journalctl -u codex-ollama-proxy -f               ║"
  echo "╚══════════════════════════════════════════════════════════╝"
else
  echo "✗ Service failed to start"
  echo "Check logs with: journalctl -u codex-ollama-proxy -n 50"
  exit 1
fi

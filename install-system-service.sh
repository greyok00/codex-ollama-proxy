#!/bin/bash
set -e

# ── Install ollama-proxy as a system-level service ──────────────────────

PROXY_SRC="/home/grey/codex-brain/codex-ollama-proxy/proxy.js"
PROXY_DST="/usr/local/bin/ollama-proxy.js"
SERVICE_FILE="/etc/systemd/system/ollama-proxy.service"

echo "1/5  Copying proxy script to $PROXY_DST ..."
cp "$PROXY_SRC" "$PROXY_DST"
chmod 755 "$PROXY_DST"

echo "2/5  Writing system service file ..."
cat > "$SERVICE_FILE" << 'EOF'
[Unit]
Description=Ollama Proxy for Codex – developer→system role transform
After=network.target ollama.service
Wants=ollama.service

[Service]
Type=simple
ExecStart=/usr/bin/node /usr/local/bin/ollama-proxy.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ollama-proxy

# Hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=read-only

[Install]
WantedBy=multi-user.target
EOF

echo "3/5  Reloading systemd ..."
systemctl daemon-reload

echo "4/5  Enabling and starting service ..."
systemctl enable ollama-proxy
systemctl start ollama-proxy

echo "5/5  Checking status ..."
sleep 1
systemctl status ollama-proxy --no-pager || true

echo ""
echo "✅  ollama-proxy system service installed!"
echo "    Port: 11435  →  Ollama 11434"
echo ""
echo "Management:"
echo "  sudo systemctl status  ollama-proxy"
echo "  sudo systemctl restart ollama-proxy"
echo "  sudo systemctl stop    ollama-proxy"
echo "  sudo journalctl -u ollama-proxy -f"

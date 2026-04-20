#!/bin/bash

echo "=== Uninstalling Ollama Proxy Service ==="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "Removing system-wide service..."
    SERVICE_NAME="ollama-proxy"
    
    # Stop and disable
    systemctl stop ollama-proxy 2>/dev/null
    systemctl disable ollama-proxy 2>/dev/null
    
    # Remove service file
    rm -f /etc/systemd/system/ollama-proxy.service
    systemctl daemon-reload
else
    echo "Removing user service..."
    SERVICE_NAME="ollama-proxy"
    
    # Stop and disable
    systemctl --user stop ollama-proxy 2>/dev/null
    systemctl --user disable ollama-proxy 2>/dev/null
    
    # Remove service file
    rm -f "$HOME/.config/systemd/user/ollama-proxy.service"
    systemctl --user daemon-reload
fi

echo ""
echo "=== Uninstallation Complete ==="
echo ""
echo "The service has been removed. You can still run the proxy manually with:"
echo "  cd ~/codex-brain/codex-ollama-proxy"
echo "  node proxy.js"

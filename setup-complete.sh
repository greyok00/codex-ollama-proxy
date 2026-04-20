#!/bin/bash

echo "=== Complete Ollama + Proxy Service Setup ==="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "Running as root - will install system-wide services"
    SUDO=""
    SERVICE_PREFIX=""
else
    echo "Running as user - will install user services"
    SUDO="sudo"
    SERVICE_PREFIX="--user"
fi

# Step 1: Check if Ollama is installed
echo "Step 1: Checking Ollama installation..."
if command -v ollama &> /dev/null; then
    echo "✓ Ollama is installed at $(which ollama)"
else
    echo "✗ Ollama is not installed"
    echo "Please install Ollama first: https://ollama.com"
    exit 1
fi

# Step 2: Create Ollama service if it doesn't exist
echo ""
echo "Step 2: Setting up Ollama service..."
if [ "$EUID" -eq 0 ]; then
    if [ ! -f /etc/systemd/system/ollama.service ]; then
        echo "Creating system-wide Ollama service..."
        cat > /etc/systemd/system/ollama.service << 'OLLAMA_EOF'
[Unit]
Description=Ollama Service
After=network.target

[Service]
Type=simple
User=grey
Group=grey
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ollama

[Install]
WantedBy=multi-user.target
OLLAMA_EOF
        systemctl daemon-reload
        echo "✓ Ollama service created"
    else
        echo "✓ Ollama service already exists"
    fi
else
    mkdir -p ~/.config/systemd/user
    if [ ! -f ~/.config/systemd/user/ollama.service ]; then
        echo "Creating user Ollama service..."
        cat > ~/.config/systemd/user/ollama.service << 'OLLAMA_EOF'
[Unit]
Description=Ollama Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ollama

[Install]
WantedBy=default.target
OLLAMA_EOF
        systemctl --user daemon-reload
        echo "✓ Ollama service created"
    else
        echo "✓ Ollama service already exists"
    fi
fi

# Step 3: Install proxy service
echo ""
echo "Step 3: Installing proxy service..."
./install-service.sh

# Step 4: Start Ollama service
echo ""
echo "Step 4: Starting Ollama service..."
if [ "$EUID" -eq 0 ]; then
    systemctl enable ollama
    systemctl start ollama
    sleep 2
    systemctl status ollama --no-pager | head -10
else
    systemctl --user enable ollama
    systemctl --user start ollama
    sleep 2
    systemctl --user status ollama --no-pager | head -10
fi

# Step 5: Check proxy service
echo ""
echo "Step 5: Checking proxy service..."
sleep 2
if [ "$EUID" -eq 0 ]; then
    systemctl status ollama-proxy --no-pager | head -10
else
    systemctl --user status ollama-proxy --no-pager | head -10
fi

# Step 6: Test the setup
echo ""
echo "Step 6: Testing the setup..."
sleep 2
./test-proxy.sh

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Both Ollama and the proxy are now running as services!"
echo ""
echo "Service management:"
if [ "$EUID" -eq 0 ]; then
    echo "  Ollama:  sudo systemctl status ollama"
    echo "  Proxy:   sudo systemctl status ollama-proxy"
    echo "  Logs:    sudo journalctl -u ollama -f"
    echo "           sudo journalctl -u ollama-proxy -f"
else
    echo "  Ollama:  systemctl --user status ollama"
    echo "  Proxy:   systemctl --user status ollama-proxy"
    echo "  Logs:    journalctl --user -u ollama -f"
    echo "           journalctl --user -u ollama-proxy -f"
fi
echo ""
echo "Both services will start automatically on login/boot!"
echo "You can now use Codex with Ollama without any manual setup."

#!/bin/bash

CONFIG_FILE="$HOME/.codex/config.toml"
BACKUP_FILE="$HOME/.codex/config.toml.backup.$(date +%Y%m%d-%H%M%S)"

echo "=== Updating Codex Config for Ollama Proxy ==="
echo ""

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Config file not found at $CONFIG_FILE"
    exit 1
fi

# Create backup
echo "Creating backup: $BACKUP_FILE"
cp "$CONFIG_FILE" "$BACKUP_FILE"

# Update base_url in model_providers section
echo "Updating base_url in [model_providers.ollama-launch] section..."
sed -i 's|base_url = "http://127.0.0.1:11434/v1/"|base_url = "http://127.0.0.1:11435/v1/"|g' "$CONFIG_FILE"

# Update openai_base_url in profiles section
echo "Updating openai_base_url in [profiles.ollama-launch] section..."
sed -i 's|openai_base_url = "http://127.0.0.1:11434/v1/"|openai_base_url = "http://127.0.0.1:11435/v1/"|g' "$CONFIG_FILE"

echo ""
echo "✓ Config updated successfully"
echo ""
echo "Changes made:"
echo "  - Changed base_url from port 11434 to 11435 in [model_providers.ollama-launch]"
echo "  - Changed openai_base_url from port 11434 to 11435 in [profiles.ollama-launch]"
echo ""
echo "Backup saved to: $BACKUP_FILE"
echo ""
echo "Next steps:"
echo "1. Make sure the proxy is running: cd ~/codex-brain/codex-ollama-proxy && node proxy.js"
echo "2. Restart Codex"
echo ""
echo "To revert changes:"
echo "  cp $BACKUP_FILE $CONFIG_FILE"

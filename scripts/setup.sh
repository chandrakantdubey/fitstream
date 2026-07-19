#!/bin/bash
set -e

echo "🏋️  Setting up FitStream..."

# Create directories
mkdir -p backend/data

# Download exercise dataset
echo "📥 Downloading exercise dataset..."
curl -L -o backend/data/exercises.json \
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json" || {
    echo "⚠️  Failed to download exercises.json. Download manually from:"
    echo "    https://github.com/hasaneyldrm/exercises-dataset/tree/main/data"
    exit 1
}

echo ""
echo "✅ Structure ready!"
echo ""
echo "Next steps:"
echo "  1. cd backend/"
echo "  2. python -m venv venv && source venv/bin/activate"
echo "  3. pip install -r requirements.txt"
echo "  4. pip install yt-dlp  (optional, for YouTube feeds)"
echo "  5. python main.py"
echo ""
echo "  Then in another terminal:"
echo "  cd frontend/ && npm install && npm run dev"
echo ""
echo "Agent-Reach optional tools:"
echo "  pip install agent-reach    # Full toolkit installer"
echo "  pipx install twitter-cli   # Twitter/X search"
echo "  pipx install bili-cli      # Bilibili search"
echo "  pipx install opencli       # Multi-platform browser-login tool"
echo "  pipx install rdt-cli       # Reddit CLI"
echo "  pip install exa-py         # Exa semantic search"

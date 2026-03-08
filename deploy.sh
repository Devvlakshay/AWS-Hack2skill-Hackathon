#!/bin/bash
# ===========================================
# FitView AI — Production Deploy Script
# Server: fitviewai.store
# ===========================================
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "=== FitView AI Deploy ==="
echo "Project: $PROJECT_DIR"

# ---- Check .env files exist ----
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    echo "ERROR: backend/.env not found. Copy from backend/.env.example and fill in values."
    exit 1
fi
if [ ! -f "$PROJECT_DIR/frontend/.env" ]; then
    echo "ERROR: frontend/.env not found. Copy from frontend/.env.example and fill in values."
    exit 1
fi

# ---- Backend Setup ----
echo ""
echo "--- Backend Setup ---"
cd "$PROJECT_DIR/backend"

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt --quiet

# Create data & uploads dirs
mkdir -p data uploads

echo "Starting backend (port 8000)..."
# Kill existing backend if running
pkill -f "uvicorn app.main:app" 2>/dev/null || true
sleep 1
nohup uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2 > "$PROJECT_DIR/backend.log" 2>&1 &
echo "Backend PID: $!"

# ---- Frontend Setup ----
echo ""
echo "--- Frontend Setup ---"
cd "$PROJECT_DIR/frontend"

echo "Installing Node dependencies..."
bun install --frozen-lockfile 2>/dev/null || bun install

echo "Building frontend..."
bun --bun next build

echo "Starting frontend (port 3000)..."
# Kill existing frontend if running
pkill -f "next start" 2>/dev/null || true
sleep 1
nohup bun --bun next start --port 3000 > "$PROJECT_DIR/frontend.log" 2>&1 &
echo "Frontend PID: $!"

# ---- Done ----
echo ""
echo "=== Deploy Complete ==="
echo "Backend:  http://127.0.0.1:8000  (log: backend.log)"
echo "Frontend: http://127.0.0.1:3000  (log: frontend.log)"
echo "Site:     https://fitviewai.store"
echo ""
echo "Verify: curl -s https://fitviewai.store/status"

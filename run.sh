#!/usr/bin/env bash
# run.sh — Start FitView AI servers
# Usage: ./run.sh              (dev: both servers)
#        ./run.sh backend      (dev: backend only)
#        ./run.sh frontend     (dev: frontend only)
#        ./run.sh prod         (production: both servers)
#        ./run.sh prod backend (production: backend only)
#        ./run.sh prod frontend(production: frontend only)

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Detect mode
MODE="dev"
if [ "$1" = "prod" ] || [ "$1" = "production" ]; then
    MODE="prod"
    shift
fi

cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill 0 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

kill_existing() {
    local pids
    pids=$(lsof -ti :8000 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}[Cleanup]${NC} Killing existing process(es) on port 8000: $pids"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    pids=$(lsof -ti :3000 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}[Cleanup]${NC} Killing existing process(es) on port 3000: $pids"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

check_env() {
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        echo -e "${RED}[Error]${NC} backend/.env not found! Copy .env.example and fill in your values:"
        echo -e "  cp backend/.env.example backend/.env"
        exit 1
    fi
}

start_backend_dev() {
    echo -e "${CYAN}[Backend]${NC} Starting FastAPI (dev) on http://localhost:8000 ..."
    cd "$BACKEND_DIR"
    python3 -m uvicorn app.main:app --reload --port 8000 --host 0.0.0.0 &
    BACKEND_PID=$!
    echo -e "${GREEN}[Backend]${NC} PID: $BACKEND_PID"
}

start_backend_prod() {
    echo -e "${CYAN}[Backend]${NC} Starting FastAPI (production) on http://0.0.0.0:8000 ..."
    cd "$BACKEND_DIR"
    python3 -m uvicorn app.main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --workers 4 \
        --no-access-log \
        --timeout-keep-alive 30 &
    BACKEND_PID=$!
    echo -e "${GREEN}[Backend]${NC} PID: $BACKEND_PID (4 workers)"
}

start_frontend_dev() {
    echo -e "${CYAN}[Frontend]${NC} Starting Next.js (dev) on http://localhost:3000 ..."
    cd "$FRONTEND_DIR"
    bun --bun next dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}[Frontend]${NC} PID: $FRONTEND_PID"
}

start_frontend_prod() {
    echo -e "${CYAN}[Frontend]${NC} Building Next.js for production ..."
    cd "$FRONTEND_DIR"
    bun --bun next build
    echo -e "${CYAN}[Frontend]${NC} Starting Next.js (production) on http://0.0.0.0:3000 ..."
    bun --bun next start --port 3000 &
    FRONTEND_PID=$!
    echo -e "${GREEN}[Frontend]${NC} PID: $FRONTEND_PID"
}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   FitView AI — ${MODE^^} Server${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

check_env
kill_existing

case "${1:-all}" in
    backend)
        if [ "$MODE" = "prod" ]; then
            start_backend_prod
        else
            start_backend_dev
        fi
        wait
        ;;
    frontend)
        if [ "$MODE" = "prod" ]; then
            start_frontend_prod
        else
            start_frontend_dev
        fi
        wait
        ;;
    all|*)
        if [ "$MODE" = "prod" ]; then
            start_backend_prod
            start_frontend_prod
        else
            start_backend_dev
            start_frontend_dev
        fi
        echo ""
        echo -e "${GREEN}Both servers running (${MODE}). Press Ctrl+C to stop.${NC}"
        echo -e "  Backend:  ${CYAN}http://localhost:8000${NC}"
        echo -e "  Frontend: ${CYAN}http://localhost:3000${NC}"
        echo ""
        wait
        ;;
esac

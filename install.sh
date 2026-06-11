#!/bin/bash
# ContactHub — Quick Start Script

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  ╔═══════════════════════════════╗"
echo "  ║   ContactHub — Quick Start    ║"
echo "  ╚═══════════════════════════════╝"
echo -e "${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js >= 18"
  exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo "❌ Node.js >= 18 required (found v$NODE_VER)"
  exit 1
fi

# Check MongoDB
if ! command -v mongod &> /dev/null; then
  echo -e "${YELLOW}⚠️  MongoDB not found locally. Make sure it's running or use Docker.${NC}"
fi

echo -e "${GREEN}1. Installing backend dependencies...${NC}"
cd backend
npm install

# Create .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${YELLOW}   ⚠️  Created backend/.env from example. Edit MONGODB_URI & JWT_SECRET if needed.${NC}"
fi

echo -e "${GREEN}2. Installing frontend dependencies...${NC}"
cd ../frontend
npm install

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo "To start the application:"
echo ""
echo -e "  ${BLUE}Terminal 1 — Backend:${NC}"
echo "    cd backend && npm run dev"
echo ""
echo -e "  ${BLUE}Terminal 2 — Frontend:${NC}"
echo "    cd frontend && ng serve"
echo ""
echo -e "  ${BLUE}Load demo data (optional):${NC}"
echo "    cd backend && npm run seed"
echo ""
echo -e "  ${BLUE}Open browser:${NC} http://localhost:4200"
echo -e "  ${BLUE}Demo login:${NC}  demo@contacts.com / demo1234"
echo ""
echo "Or use Docker Compose:"
echo "  docker-compose up --build"
echo ""

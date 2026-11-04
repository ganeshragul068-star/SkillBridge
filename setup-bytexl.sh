#!/bin/bash
# ==============================================================================
# SkillBridge – BYTEXL Workspace Automated Setup & Launch Script
# ==============================================================================

echo "========================================================"
echo " 🚀 Setting up SkillBridge in BYTEXL MERN Workspace"
echo "========================================================"

# Step 0: Free up ports 5000 and 5173 if previously occupied
echo "🧹 Releasing ports 5000 and 5173..."
fuser -k 5000/tcp 2>/dev/null || true
fuser -k 5173/tcp 2>/dev/null || true
pkill -f "server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

# Step 1: Install root, server, and client dependencies
echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing server dependencies..."
npm --prefix server install

echo "📦 Installing client dependencies..."
npm --prefix client install

# Step 2: Configure server/.env
if [ ! -f server/.env ]; then
  echo "⚙️ Creating server/.env from template..."
  cp server/.env.example server/.env

  # If MONGODB_URI environment variable is provided by BYTEXL, configure it
  if [ -n "$MONGODB_URI" ]; then
    echo "🔌 Detected BYTEXL MONGODB_URI environment variable."
    sed -i "s|DATA_MODE=demo|DATA_MODE=mongodb|g" server/.env
    sed -i "s|MONGO_URI=.*|MONGODB_URI=$MONGODB_URI|g" server/.env
  fi

  if [ -n "$GEMINI_API_KEY" ]; then
    sed -i "s|GEMINI_API_KEY=.*|GEMINI_API_KEY=$GEMINI_API_KEY|g" server/.env
  fi
fi

# Step 3: Configure client/.env if not present
if [ ! -f client/.env ]; then
  echo "⚙️ Creating client/.env..."
  cp client/.env.example client/.env
fi

# Step 4: Seed the database with 5 student profiles & applications
echo "🌱 Seeding evaluation accounts and job applications..."
npm run seed

# Step 5: Build client bundle (enables single-server low-memory hosting on Port 5000)
echo "🏗️ Building client production bundle..."
npm --prefix client run build

echo "========================================================"
echo "✅ Setup Complete!"
echo "🚀 Starting SkillBridge on Port 5000 (Express + React Frontend)..."
echo "   In BYTEXL, open Port 5000 in Web Preview!"
echo "========================================================"

# Step 6: Launch unified server
npm start

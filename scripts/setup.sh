#!/usr/bin/env bash
set -euo pipefail

echo "Setting up Electronic Store development environment..."

# Check prerequisites
if ! command -v node &>/dev/null; then
  echo "Error: Node.js is required (>=22)"
  exit 1
fi

if ! command -v pnpm &>/dev/null; then
  echo "Installing pnpm..."
  npm install -g pnpm
fi

if ! command -v docker &>/dev/null; then
  echo "Warning: Docker not found. Database services must be running manually."
fi

echo "Installing dependencies..."
pnpm install

echo "Setting up environment variables..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — fill in required values."
fi

echo "Setting up git hooks..."
pnpm prepare

echo "Starting Docker services..."
docker compose up -d postgres redis mailhog

echo "Waiting for PostgreSQL to be ready..."
until docker compose exec postgres pg_isready -U postgres &>/dev/null; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "Running database migrations..."
pnpm db:migrate:dev

echo "Seeding database..."
pnpm db:seed

echo
echo "Setup complete! Run 'make dev' to start the development servers."

# Electronic Store — Developer Command Center
# Run `make help` to list all available commands.
# Requires: make, bash, pnpm, docker, docker-compose

.PHONY: help setup install dev dev-web dev-api dev-admin build test lint type-check format clean \
        db-start db-stop db-migrate db-migrate-dev db-seed db-reset db-studio \
        docker-up docker-down docker-build docker-logs \
        test-unit test-integration test-e2e test-coverage \
        deploy-staging deploy-production prisma-generate

# Default target
.DEFAULT_GOAL := help

# Terminal colors
RED    := \033[0;31m
GREEN  := \033[0;32m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
PURPLE := \033[0;35m
CYAN   := \033[0;36m
RESET  := \033[0m

## ─── HELP ────────────────────────────────────────────────────────────────────

help: ## Show this help message
	@echo ""
	@echo "$(CYAN)Electronic Store — Developer Commands$(RESET)"
	@echo "$(CYAN)════════════════════════════════════════$(RESET)"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(GREEN)%-22s$(RESET) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(RESET)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

## ─── SETUP ───────────────────────────────────────────────────────────────────

setup: ## One-command project bootstrap (install + env + db)
	@echo "$(BLUE)Setting up Electronic Store...$(RESET)"
	@bash scripts/setup.sh

install: ## Install all workspace dependencies
	@echo "$(BLUE)Installing dependencies...$(RESET)"
	pnpm install

prisma-generate: ## Generate Prisma client
	@echo "$(BLUE)Generating Prisma client...$(RESET)"
	pnpm --filter @electronic-store/api exec prisma generate

## ─── DEVELOPMENT ─────────────────────────────────────────────────────────────

dev: ## Start all applications in development mode
	@echo "$(GREEN)Starting development servers...$(RESET)"
	pnpm dev

dev-web: ## Start only the web frontend
	pnpm dev:web

dev-api: ## Start only the API server
	pnpm dev:api

dev-admin: ## Start only the admin dashboard
	pnpm dev:admin

## ─── BUILD ───────────────────────────────────────────────────────────────────

build: ## Build all applications for production
	@echo "$(BLUE)Building all applications...$(RESET)"
	pnpm build

build-web: ## Build only the web frontend
	pnpm --filter @electronic-store/web build

build-api: ## Build only the API server
	pnpm --filter @electronic-store/api build

## ─── CODE QUALITY ─────────────────────────────────────────────────────────────

lint: ## Run ESLint on all workspaces
	@echo "$(BLUE)Running ESLint...$(RESET)"
	pnpm lint

lint-fix: ## Run ESLint with auto-fix
	pnpm lint:fix

type-check: ## Run TypeScript type checking
	@echo "$(BLUE)Running type checks...$(RESET)"
	pnpm type-check

format: ## Format all files with Prettier
	@echo "$(BLUE)Formatting files...$(RESET)"
	pnpm format

format-check: ## Check formatting without writing
	pnpm format:check

## ─── TESTING ─────────────────────────────────────────────────────────────────

test: ## Run all tests
	@echo "$(BLUE)Running all tests...$(RESET)"
	pnpm test

test-unit: ## Run unit tests only
	pnpm test:unit

test-integration: ## Run integration tests only
	pnpm test:integration

test-e2e: ## Run Playwright end-to-end tests
	@echo "$(BLUE)Running E2E tests...$(RESET)"
	pnpm test:e2e

test-coverage: ## Run tests with coverage report
	pnpm test:coverage

## ─── DATABASE ────────────────────────────────────────────────────────────────

db-migrate: ## Run Prisma migrations (production)
	@echo "$(BLUE)Running database migrations...$(RESET)"
	pnpm db:migrate

db-migrate-dev: ## Run Prisma migrations (development)
	@echo "$(BLUE)Running dev database migrations...$(RESET)"
	pnpm db:migrate:dev

db-seed: ## Seed the database with sample data
	@echo "$(BLUE)Seeding database...$(RESET)"
	pnpm db:seed

db-reset: ## Reset database and re-seed
	@echo "$(RED)Resetting database — all data will be lost!$(RESET)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	pnpm db:reset

db-studio: ## Open Prisma Studio (DB GUI)
	pnpm db:studio

## ─── DOCKER ──────────────────────────────────────────────────────────────────

docker-up: ## Start infrastructure (postgres, redis, mailhog)
	@echo "$(GREEN)Starting Docker services...$(RESET)"
	docker-compose up -d postgres redis mailhog redis-commander

docker-down: ## Stop all Docker services
	@echo "$(YELLOW)Stopping Docker services...$(RESET)"
	docker-compose down

docker-down-volumes: ## Stop Docker services and remove volumes
	@echo "$(RED)Stopping Docker and removing ALL volumes...$(RESET)"
	@read -p "All data will be lost. Continue? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	docker-compose down -v

docker-logs: ## Follow Docker service logs
	docker-compose logs -f

docker-build: ## Build production Docker images
	@echo "$(BLUE)Building Docker images...$(RESET)"
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

## ─── CLEAN ───────────────────────────────────────────────────────────────────

clean: ## Remove all build artifacts and caches
	@echo "$(YELLOW)Cleaning build artifacts...$(RESET)"
	pnpm clean

clean-all: clean ## Remove build artifacts and all node_modules
	@echo "$(RED)Removing all node_modules...$(RESET)"
	find . -name 'node_modules' -type d -not -path './.git/*' | xargs rm -rf

## ─── DEPLOYMENT ──────────────────────────────────────────────────────────────

deploy-staging: ## Deploy to staging environment
	@echo "$(BLUE)Deploying to staging...$(RESET)"
	bash scripts/deploy.sh staging

deploy-production: ## Deploy to production (requires approval)
	@echo "$(RED)Deploying to PRODUCTION...$(RESET)"
	@read -p "This will deploy to production. Continue? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	bash scripts/deploy.sh production

## ─── UTILITIES ───────────────────────────────────────────────────────────────

check-env: ## Validate environment variables
	@echo "$(BLUE)Validating environment...$(RESET)"
	pnpm check-env

generate-types: ## Generate types from Prisma schema
	tsx scripts/generate-types.ts

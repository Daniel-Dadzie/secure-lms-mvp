.PHONY: install dev dev-client dev-server migrate seed studio lint format test build docker-up docker-down

## Install all workspace dependencies
install:
	npm install

## Run client + server together (requires concurrently, or run in two terminals)
dev:
	npm run dev --workspace=client & npm run dev --workspace=server

## Run only the Next.js frontend
dev-client:
	npm run dev --workspace=client

## Run only the Express backend
dev-server:
	npm run dev --workspace=server

## Apply Prisma migrations
migrate:
	npm run prisma:migrate --workspace=server

## Seed the local database with demo data
seed:
	npm run prisma:seed --workspace=server

## Open Prisma Studio to inspect the database
studio:
	npm run prisma:studio --workspace=server

## Lint all workspaces
lint:
	npm run lint --workspaces --if-present

## Format all files with Prettier
format:
	npx prettier --write .

## Run all tests
test:
	npm run test --workspaces --if-present

## Build client + server for production
build:
	npm run build --workspaces --if-present

## Start local Postgres via Docker
docker-up:
	docker compose up -d

## Stop local Docker containers
docker-down:
	docker compose down

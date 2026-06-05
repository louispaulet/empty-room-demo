DEMO_MAKE_DIR := .make
VITE_PID := $(DEMO_MAKE_DIR)/vite.pid
WORKER_PID := $(DEMO_MAKE_DIR)/worker.pid
LOCAL_FRONTEND_URL ?= http://127.0.0.1:5173
LOCAL_WORKER_URL ?= http://127.0.0.1:8787
GH_PAGES_BASE ?= /empty-room-demo/
WORKER_URL ?=

.PHONY: help up up-frontend up-backend kill kill-frontend kill-backend \
	test test-frontend test-backend check check-frontend check-backend \
	build build-frontend build-backend worker_secret worker-secret \
	deploy deploy-frontend deploy-backend require-worker-url

help:
	@echo "Targets:"
	@echo "  up, up-frontend, up-backend, kill, kill-frontend, kill-backend"
	@echo "  test, test-frontend, test-backend"
	@echo "  check, check-frontend, check-backend"
	@echo "  build, build-frontend, build-backend"
	@echo "  worker_secret, worker-secret"
	@echo "  deploy, deploy-frontend, deploy-backend"

up: kill up-backend up-frontend
	@echo "Empty Room demo is starting:"
	@echo "  UI:     $(LOCAL_FRONTEND_URL)/#/"
	@echo "  Worker: $(LOCAL_WORKER_URL)"
	@echo "  Logs:   $(DEMO_MAKE_DIR)/vite.log and $(DEMO_MAKE_DIR)/worker.log"

up-frontend: kill-frontend
	@mkdir -p $(DEMO_MAKE_DIR)
	@(VITE_BASE_PATH="/" VITE_WORKER_URL="$(LOCAL_WORKER_URL)" nohup npm run dev -- --strictPort > $(DEMO_MAKE_DIR)/vite.log 2>&1 & echo $$! > $(VITE_PID))
	@echo "Frontend is starting at $(LOCAL_FRONTEND_URL)/#/"
	@echo "Frontend log: $(DEMO_MAKE_DIR)/vite.log"

up-backend: kill-backend
	@mkdir -p $(DEMO_MAKE_DIR)
	@node scripts/sync-dev-vars.mjs .env.local
	@(nohup npm run worker:dev > $(DEMO_MAKE_DIR)/worker.log 2>&1 & echo $$! > $(WORKER_PID))
	@echo "Worker is starting at $(LOCAL_WORKER_URL)"
	@echo "Worker log: $(DEMO_MAKE_DIR)/worker.log"

kill: kill-frontend kill-backend

kill-frontend:
	@if [ -f $(VITE_PID) ]; then kill $$(cat $(VITE_PID)) 2>/dev/null || true; rm -f $(VITE_PID); fi

kill-backend:
	@if [ -f $(WORKER_PID) ]; then kill $$(cat $(WORKER_PID)) 2>/dev/null || true; rm -f $(WORKER_PID); fi

test: test-frontend test-backend

test-frontend:
	npm run test:frontend

test-backend:
	npm run test:backend

check: check-frontend check-backend

check-frontend:
	npm run test:frontend
	VITE_BASE_PATH="$(GH_PAGES_BASE)" VITE_WORKER_URL="$(WORKER_URL)" npm run build:frontend

check-backend:
	npm run test:backend
	npm run build:backend

build: build-frontend build-backend

build-frontend:
	VITE_BASE_PATH="$(GH_PAGES_BASE)" VITE_WORKER_URL="$(WORKER_URL)" npm run build:frontend

build-backend:
	npm run build:backend

worker_secret:
	@test -f .env.local || { echo ".env.local is missing; create OPENAI_API_KEY first."; exit 1; }
	@npx wrangler whoami >/dev/null 2>&1 || { echo "Wrangler is not logged in. Run: npx wrangler login"; exit 1; }
	node scripts/put-worker-secret.mjs .env.local

worker-secret: worker_secret

deploy: require-worker-url deploy-backend deploy-frontend

require-worker-url:
	@test -n "$(WORKER_URL)" || { echo "Usage: make deploy WORKER_URL=https://your-worker.workers.dev"; exit 1; }

deploy-backend:
	@npx wrangler whoami >/dev/null 2>&1 || { echo "Wrangler is not logged in. Run: npx wrangler login"; exit 1; }
	npm run worker:deploy

deploy-frontend: require-worker-url
	VITE_BASE_PATH="$(GH_PAGES_BASE)" VITE_WORKER_URL="$(WORKER_URL)" npm run build:frontend
	npx gh-pages -d dist

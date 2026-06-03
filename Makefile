DEMO_MAKE_DIR := .make
VITE_PID := $(DEMO_MAKE_DIR)/vite.pid
WORKER_PID := $(DEMO_MAKE_DIR)/worker.pid
LOCAL_WORKER_URL ?= http://127.0.0.1:8787
GH_PAGES_BASE ?= /empty-room-demo/
WORKER_URL ?=

help:
	@echo "Targets: up, kill, build, test, worker_secret, deploy"

up: kill
	@mkdir -p $(DEMO_MAKE_DIR)
	@node scripts/sync-dev-vars.mjs .env.local
	@(nohup npx wrangler dev --config wrangler.jsonc --ip 127.0.0.1 --port 8787 > .make/worker.log 2>&1 & echo $$! > .make/worker.pid)
	@(VITE_BASE_PATH="/" VITE_WORKER_URL="$(LOCAL_WORKER_URL)" nohup npm run dev -- --strictPort > .make/vite.log 2>&1 & echo $$! > .make/vite.pid)
	@echo "Empty Room demo is starting:"
	@echo "  UI:     http://127.0.0.1:5173/#/"
	@echo "  Worker: $(LOCAL_WORKER_URL)"
	@echo "  Logs:   .make/vite.log and .make/worker.log"

kill:
	@if [ -f $(VITE_PID) ]; then kill $$(cat $(VITE_PID)) 2>/dev/null || true; rm -f $(VITE_PID); fi
	@if [ -f $(WORKER_PID) ]; then kill $$(cat $(WORKER_PID)) 2>/dev/null || true; rm -f $(WORKER_PID); fi

build:
	VITE_BASE_PATH="$(GH_PAGES_BASE)" VITE_WORKER_URL="$(WORKER_URL)" npm run build

test:
	npm run test
	npm run build
	npm run worker:check

worker_secret:
	@test -f .env.local || { echo ".env.local is missing; create OPENAI_API_KEY first."; exit 1; }
	@npx wrangler whoami >/dev/null 2>&1 || { echo "Wrangler is not logged in. Run: npx wrangler login"; exit 1; }
	node scripts/put-worker-secret.mjs .env.local

deploy:
	@test -n "$(WORKER_URL)" || { echo "Usage: make deploy WORKER_URL=https://your-worker.workers.dev"; exit 1; }
	@npx wrangler whoami >/dev/null 2>&1 || { echo "Wrangler is not logged in. Run: npx wrangler login"; exit 1; }
	npm run worker:deploy
	VITE_BASE_PATH="$(GH_PAGES_BASE)" VITE_WORKER_URL="$(WORKER_URL)" npm run build
	npx gh-pages -d dist


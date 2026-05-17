include .env
export

export PROJECT_ROOT=$(shell pwd)

# ──────────────────────────────────────────
# Dev окружение
# ──────────────────────────────────────────

dev-env-up:
	@docker compose up -d sport-postgres sport-redis sport-port-forwarder

dev-env-down:
	@docker compose down sport-postgres sport-redis sport-port-forwarder

dev-env-restart: dev-env-down dev-env-up

dev-env-cleanup:
	@read -p "Аккуратно, точно очистить ВСЁ окружение? [y/N]: " ans; \
	if [ "$$ans" = "y" ]; then \
		docker compose down sport-postgres sport-redis sport-port-forwarder && \
		rm -rf out/pgdata && \
		echo "Окружение полностью очищено"; \
	else \
		echo "Очищение отменено"; \
	fi

# ──────────────────────────────────────────
# Dev utilities (твоя сильная часть)
# ──────────────────────────────────────────

dev-port-forward:
	@docker compose up -d port-forwarder

dev-port-close:
	@docker compose down port-forwarder

# ──────────────────────────────────────────
# Миграции
# ──────────────────────────────────────────

migrate-create:
	@if [ -z "$(seq)" ]; then \
		echo "Ошибка: укажи имя миграции. Пример: make migrate-create seq=add_users_table"; \
		exit 1; \
	fi; \
	docker compose run --rm sport-migrate \
		create \
		-ext sql \
		-dir /migrations \
		-seq "$(seq)"

migrate-up:
	@make migrate-action action=up

migrate-down:
	@make migrate-action action=down

migrate-action:
	@if [ -z "$(action)" ]; then \
		echo "Ошибка: action не задан (up|down)"; \
		exit 1; \
	fi; \
	docker compose run --rm sport-migrate \
		-path /migrations \
		-database "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@sport-postgres:5432/${POSTGRES_DB}?sslmode=disable" \
		"$(action)"

# ──────────────────────────────────────────
# Приложение
# ──────────────────────────────────────────

run:
	@go run ./cmd/api/

build:
	@echo "Сборка бинарника..."
	@go build -o out/api ./cmd/api/
	@echo "Готово: out/api"

build-linux:
	@echo "Сборка для Linux..."
	@GOOS=linux GOARCH=amd64 go build -o out/api-linux ./cmd/api/
	@echo "Готово: out/api-linux"

# ──────────────────────────────────────────
# Качество кода (из первого — очень важно)
# ──────────────────────────────────────────

lint:
	@which golangci-lint > /dev/null || (echo "Установка golangci-lint..." && go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest)
	@golangci-lint run ./...

fmt:
	@gofmt -w .
	@echo "Форматирование завершено"

tidy:
	@go mod tidy
	@echo "go.mod обновлён"

# ──────────────────────────────────────────
# Полный dev setup (очень удобно)
# ──────────────────────────────────────────

dev-setup: dev-env-up
	@echo "Dev окружение запущено 🚀"

dev-reset: dev-env-cleanup dev-env-up
	@echo "Dev окружение пересоздано 🔄"

# ──────────────────────────────────────────
# Help (из первого варианта — must have)
# ──────────────────────────────────────────

help:
	@echo ""
	@echo "🚀 Доступные команды:"
	@echo ""
	@echo "Dev окружение:"
	@echo "  make dev-env-up        — поднять Postgres + Redis + port-forward"
	@echo "  make dev-env-down      — остановить всё"
	@echo "  make dev-env-cleanup   — полностью очистить данные"
	@echo "  make dev-reset         — пересоздать окружение"
	@echo ""
	@echo "Dev утилиты:"
	@echo "  make dev-port-forward  — включить порт-форвардинг"
	@echo "  make dev-port-close    — выключить порт-форвардинг"
	@echo ""
	@echo "Миграции:"
	@echo "  make migrate-create seq=name  — создать миграцию"
	@echo "  make migrate-up               — применить миграции"
	@echo "  make migrate-down             — откатить миграции"
	@echo ""
	@echo "Приложение:"
	@echo "  make run              — запуск локально"
	@echo "  make build            — собрать бинарник"
	@echo "  make build-linux      — сборка под Linux"
	@echo ""
	@echo "Качество:"
	@echo "  make lint             — линтер"
	@echo "  make fmt              — форматирование"
	@echo "  make tidy             — обновить зависимости"
	@echo ""

.PHONY: \
	dev-env-up dev-env-down dev-env-cleanup dev-env-restart \
	dev-port-forward dev-port-close \
	migrate-create migrate-up migrate-down migrate-action \
	run build build-linux \
	lint fmt tidy \
	dev-setup dev-reset help
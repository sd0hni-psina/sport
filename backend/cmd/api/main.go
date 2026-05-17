package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/sd0hni-psina/sport/internal/config"
	"github.com/sd0hni-psina/sport/internal/platform/logger"
	"github.com/sd0hni-psina/sport/internal/platform/postgres"
	"github.com/sd0hni-psina/sport/internal/platform/redis"
	"github.com/sd0hni-psina/sport/internal/server"
)

func main() {
	cfg := config.Load()
	logger.Setup(cfg.App.Env)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pg, err := postgres.New(ctx, cfg.Postgres)
	if err != nil {
		slog.Error("failed to connect postgres", "err", err)
		os.Exit(1)
	}
	defer pg.Close()

	rdb, err := redis.New(ctx, cfg.Redis)
	if err != nil {
		slog.Error("failed to connect redis", "err", err)
		os.Exit(1)
	}
	defer rdb.Close()

	srv := server.New(cfg, pg, rdb)

	go func() {
		if err := srv.Run(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("server error", "err", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("shutting down gracefully...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("shutdown error", "err", err)
	}

	slog.Info("server stopped")
}

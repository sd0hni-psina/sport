package server

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/sd0hni-psina/sport/internal/config"
)

type Server struct {
	httpServer *http.Server
	cfg        *config.Config
	pg         *pgxpool.Pool
	rdb        *redis.Client
}

func New(cfg *config.Config, pg *pgxpool.Pool, rdb *redis.Client) *Server {
	return &Server{
		cfg: cfg,
		pg:  pg,
		rdb: rdb,
	}
}

func (s *Server) Run() error {
	if s.cfg.App.Env == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(requestLogger())

	s.registerRoutes(router)

	s.httpServer = &http.Server{
		Addr:         fmt.Sprintf(":%s", s.cfg.App.Port),
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	slog.Info("server listening", "port", s.cfg.App.Port)
	return s.httpServer.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}

func requestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		slog.Info("request",
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
			"status", c.Writer.Status(),
			"duration", time.Since(start),
			"ip", c.ClientIP(),
		)
	}
}

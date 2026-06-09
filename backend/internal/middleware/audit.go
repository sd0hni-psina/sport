package middleware

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

func AdminAuditLog() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()

		// логируем только мутирующие запросы
		method := c.Request.Method
		if method == "GET" {
			return
		}

		userID, _ := c.Get(ContextUserID)
		slog.Info("admin action",
			"user_id", userID,
			"method", method,
			"path", c.Request.URL.Path,
			"status", c.Writer.Status(),
			"duration", time.Since(start),
			"ip", c.ClientIP(),
		)
	}
}

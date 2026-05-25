package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type RateLimitConfig struct {
	Key     func(c *gin.Context) string
	Limit   int
	Window  time.Duration
	Message string
}

func RateLimit(rdb *redis.Client, cfg RateLimitConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := c.Request.Context()
		key := fmt.Sprintf("rate:%s", cfg.Key(c))

		count, err := rdb.Incr(ctx, key).Result()
		if err != nil {
			c.Next()
			return
		}

		if count == 1 {
			rdb.Expire(ctx, key, cfg.Window)
		}

		if count > int64(cfg.Limit) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": cfg.Message,
			})
			return
		}

		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", cfg.Limit))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", cfg.Limit-int(count)))
		c.Next()
	}
}

// готовые конфиги для SMS эндпоинтов

func SMSByIP(rdb *redis.Client) gin.HandlerFunc {
	return RateLimit(rdb, RateLimitConfig{
		Key:     func(c *gin.Context) string { return fmt.Sprintf("sms:ip:%s", c.ClientIP()) },
		Limit:   10,
		Window:  time.Hour,
		Message: "Слишком много запросов. Попробуйте через час.",
	})
}

func SMSByPhone(rdb *redis.Client) gin.HandlerFunc {
	return RateLimit(rdb, RateLimitConfig{
		Key: func(c *gin.Context) string {
			// читаем body не уничтожая его
			bodyBytes, err := io.ReadAll(c.Request.Body)
			if err != nil {
				return fmt.Sprintf("sms:ip:%s:fallback", c.ClientIP())
			}
			// восстанавливаем body для следующего хендлера
			c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

			var body struct {
				PhoneNumber string `json:"phone_number"`
			}
			if err := json.Unmarshal(bodyBytes, &body); err == nil && body.PhoneNumber != "" {
				return fmt.Sprintf("sms:phone:%s", body.PhoneNumber)
			}
			return fmt.Sprintf("sms:ip:%s:fallback", c.ClientIP())
		},
		Limit:   3,
		Window:  15 * time.Minute,
		Message: "SMS уже отправлен. Подождите 15 минут.",
	})
}

func GlobalRateLimit(rdb *redis.Client) gin.HandlerFunc {
	return RateLimit(rdb, RateLimitConfig{
		Key:     func(c *gin.Context) string { return fmt.Sprintf("global:ip:%s", c.ClientIP()) },
		Limit:   200,
		Window:  time.Minute,
		Message: "Слишком много запросов. Попробуйте позже.",
	})
}

func EmailByIP(rdb *redis.Client) gin.HandlerFunc {
	return RateLimit(rdb, RateLimitConfig{
		Key:     func(c *gin.Context) string { return fmt.Sprintf("email:ip:%s", c.ClientIP()) },
		Limit:   30,
		Window:  time.Hour,
		Message: "Слишком много запросов. Попробуйте через час.",
	})
}

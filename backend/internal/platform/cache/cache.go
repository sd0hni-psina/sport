package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type Cache struct {
	rdb *redis.Client
}

func New(rdb *redis.Client) *Cache {
	return &Cache{rdb: rdb}
}

func (c *Cache) Get(ctx context.Context, key string, dest any) error {
	val, err := c.rdb.Get(ctx, key).Result()
	if err != nil {
		return err
	}
	return json.Unmarshal([]byte(val), dest)
}

func (c *Cache) Set(ctx context.Context, key string, val any, ttl time.Duration) error {
	data, err := json.Marshal(val)
	if err != nil {
		return fmt.Errorf("cache: marshal: %w", err)
	}
	return c.rdb.Set(ctx, key, data, ttl).Err()
}

func (c *Cache) Del(ctx context.Context, keys ...string) error {
	return c.rdb.Del(ctx, keys...).Err()
}

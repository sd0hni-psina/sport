package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	App      AppConfig
	Postgres PostgresConfig
	Redis    RedisConfig
	JWT      JWTConfig
}

type AppConfig struct {
	Env  string
	Port string
}

type PostgresConfig struct {
	User     string
	Password string
	Host     string
	Port     string
	DB       string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type JWTConfig struct {
	AccessSecret  string
	RefreshSecret string
	AccessTTL     int
	RefreshTTL    int
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func mustGetEnv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Fatalf("required env variable %q is not set", key)
	}
	return val
}

func mustGetEnvSecure(key string, minLen int) string {
	val := mustGetEnv(key)
	if len(val) < minLen {
		log.Fatalf("env variable %q is too short: minimum %d characters required", key, minLen)
	}
	return val
}

func getEnvInt(key string, fallback int) int {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	n, err := strconv.Atoi(val)
	if err != nil {
		log.Fatalf("env variable %q must be an integer, got %q", key, val)
	}
	return n
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("Не может прочитать енв")
	}

	return &Config{
		App: AppConfig{
			Env:  getEnv("APP_ENV", "dev"),
			Port: getEnv("APP_PORT", "8080"),
		},
		Postgres: PostgresConfig{
			User:     mustGetEnv("POSTGRES_USER"),
			Password: mustGetEnv("POSTGRES_PASSWORD"),
			Host:     getEnv("POSTGRES_HOST", "localhost"),
			Port:     getEnv("POSTGRES_PORT", "5432"),
			DB:       mustGetEnv("POSTGRES_DB"),
			SSLMode:  getEnv("POSTGRES_SSL_MODE", "disable"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvInt("REDIS_DB", 0),
		},
		JWT: JWTConfig{
			AccessSecret:  mustGetEnvSecure("JWT_ACCESS_SECRET", 32),
			RefreshSecret: mustGetEnvSecure("JWT_REFRESH_SECRET", 32),
			AccessTTL:     getEnvInt("JWT_ACCESS_TTL_MINUTES", 15),
			RefreshTTL:    getEnvInt("JWT_REFRESH_TTL_DAYS", 30),
		},
	}
}

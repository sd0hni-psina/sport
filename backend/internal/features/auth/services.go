package auth

import (
	"context"
	"crypto/rand"
	"fmt"
	"log/slog"
	"math/big"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
	"github.com/sd0hni-psina/sport/internal/config"
	"github.com/sd0hni-psina/sport/internal/domain"
)

const (
	smsCodeTTL    = 5 * time.Minute
	smsCodePrefix = "sms:code:"
)

type Service struct {
	repo *Repository
	rdb  *redis.Client
	cfg  config.JWTConfig
}

func NewService(repo *Repository, rdb *redis.Client, cfg config.JWTConfig) *Service {
	return &Service{repo: repo, rdb: rdb, cfg: cfg}
}

// Register — сохраняет пользователя и отправляет SMS-код
func (s *Service) Register(ctx context.Context, req RegisterRequest) error {
	exists, err := s.repo.UserExistsByPhone(ctx, req.PhoneNumber)
	if err != nil {
		return err
	}
	if exists {
		return domain.ErrAlreadyExists
	}

	birthDate, err := time.Parse("2006-01-02", req.BirthDate)
	if err != nil {
		return fmt.Errorf("%w: birth_date must be YYYY-MM-DD", domain.ErrInvalidInput)
	}

	var middleName *string
	if req.MiddleName != "" {
		middleName = &req.MiddleName
	}

	u := &domain.User{
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		MiddleName:  middleName,
		PhoneNumber: req.PhoneNumber,
		City:        req.City,
		BirthDate:   birthDate,
		Role:        domain.UserRoleUser,
		Reputation:  100,
	}

	if _, err := s.repo.CreateUser(ctx, u); err != nil {
		return err
	}

	return s.sendSMSCode(ctx, req.PhoneNumber)
}

// Login — отправляет SMS-код существующему пользователю
func (s *Service) Login(ctx context.Context, req LoginRequest) error {
	user, err := s.repo.GetUserByPhone(ctx, req.PhoneNumber)
	if err != nil {
		return err
	}
	if user.IsBlocked {
		return domain.ErrUserBlocked
	}
	return s.sendSMSCode(ctx, req.PhoneNumber)
}

// Verify — проверяет SMS-код и возвращает токены
func (s *Service) Verify(ctx context.Context, req VerifyRequest) (*TokenResponse, error) {
	key := smsCodePrefix + req.PhoneNumber
	storedCode, err := s.rdb.Get(ctx, key).Result()
	if err != nil {
		return nil, fmt.Errorf("%w: code expired or not found", domain.ErrUnauthorized)
	}
	if storedCode != req.Code {
		return nil, fmt.Errorf("%w: invalid code", domain.ErrUnauthorized)
	}

	s.rdb.Del(ctx, key)

	user, err := s.repo.GetUserByPhone(ctx, req.PhoneNumber)
	if err != nil {
		return nil, err
	}

	if user.IsBlocked {
		return nil, domain.ErrUserBlocked
	}

	return s.generateTokens(user)
}

// Refresh — обновляет access токен по refresh токену
func (s *Service) Refresh(ctx context.Context, req RefreshRequest) (*TokenResponse, error) {
	claims, err := s.parseToken(req.RefreshToken, s.cfg.RefreshSecret)
	if err != nil {
		return nil, fmt.Errorf("%w: invalid refresh token", domain.ErrUnauthorized)
	}

	var userID int64
	fmt.Sscanf(claims.Subject, "%d", &userID)

	// верифицируем что пользователь существует и не заблокирован
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("%w: user not found", domain.ErrUnauthorized)
	}
	if user.IsBlocked {
		return nil, domain.ErrUserBlocked
	}

	// генерируем оба токена
	return s.generateTokens(user)
}

func generateSMSCode() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		return "", fmt.Errorf("generate sms code: %w", err)
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

func (s *Service) sendSMSCode(ctx context.Context, phone string) error {
	code, err := generateSMSCode()
	if err != nil {
		return fmt.Errorf("auth.service: %w", err)
	}

	key := smsCodePrefix + phone
	if err := s.rdb.Set(ctx, key, code, smsCodeTTL).Err(); err != nil {
		return fmt.Errorf("auth.service: save sms code: %w", err)
	}

	slog.Info("sms code", "phone", phone, "code", code)
	return nil
}

type jwtClaims struct {
	Role string `json:"role"`
	jwt.RegisteredClaims
}

func (s *Service) generateTokens(u *domain.User) (*TokenResponse, error) {
	now := time.Now()
	subject := strconv.FormatInt(u.ID, 10)

	accessClaims := jwtClaims{
		Role: string(u.Role),
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   subject,
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Duration(s.cfg.AccessTTL) * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}
	accessToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims).
		SignedString([]byte(s.cfg.AccessSecret))
	if err != nil {
		return nil, fmt.Errorf("auth.service: sign access token: %w", err)
	}

	refreshClaims := jwtClaims{
		Role: string(u.Role),
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   subject,
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Duration(s.cfg.RefreshTTL) * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}
	refreshToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims).
		SignedString([]byte(s.cfg.RefreshSecret))
	if err != nil {
		return nil, fmt.Errorf("auth.service: sign refresh token: %w", err)
	}

	return &TokenResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *Service) parseToken(tokenStr, secret string) (*jwtClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &jwtClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	return token.Claims.(*jwtClaims), nil
}

package auth

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sd0hni-psina/sport/internal/domain"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetUserByID(ctx context.Context, id int64) (*domain.User, error) {
	query := `
		SELECT id, first_name, last_name, middle_name, phone_number,
		       city, address, birth_date, role, reputation, is_blocked, created_at, updated_at
		FROM users WHERE id = $1`

	u := &domain.User{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.FirstName, &u.LastName, &u.MiddleName, &u.PhoneNumber,
		&u.City, &u.Address, &u.BirthDate, &u.Role, &u.Reputation,
		&u.IsBlocked, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("auth.repo: get user by id: %w", err)
	}
	return u, nil
}

func (r *Repository) CreateUser(ctx context.Context, u *domain.User) (int64, error) {
	query := `
		INSERT INTO users (first_name, last_name, middle_name, phone_number, city, address, birth_date, role, reputation)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id`

	var id int64
	err := r.db.QueryRow(ctx, query,
		u.FirstName, u.LastName, u.MiddleName, u.PhoneNumber,
		u.City, u.Address, u.BirthDate, u.Role, u.Reputation,
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("auth.repo: create user: %w", err)
	}
	return id, nil
}

func (r *Repository) GetUserByPhone(ctx context.Context, phone string) (*domain.User, error) {
	query := `
		SELECT id, first_name, last_name, middle_name, phone_number,
		       city, address, birth_date, role, reputation, is_blocked, created_at, updated_at
		FROM users
		WHERE phone_number = $1`

	u := &domain.User{}
	err := r.db.QueryRow(ctx, query, phone).Scan(
		&u.ID, &u.FirstName, &u.LastName, &u.MiddleName, &u.PhoneNumber,
		&u.City, &u.Address, &u.BirthDate, &u.Role, &u.Reputation,
		&u.IsBlocked, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("auth.repo: get user by phone: %w", err)
	}
	return u, nil
}

func (r *Repository) UserExistsByPhone(ctx context.Context, phone string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM users WHERE phone_number = $1)`, phone,
	).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("auth.repo: check exists: %w", err)
	}
	return exists, nil
}

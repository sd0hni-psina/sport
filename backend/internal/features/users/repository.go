package users

import (
	"context"
	"errors"
	"fmt"
	"time"

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

func (r *Repository) GetByID(ctx context.Context, id int64) (*domain.User, error) {
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
		return nil, fmt.Errorf("users.repo: get by id: %w", err)
	}
	return u, nil
}

func (r *Repository) Update(ctx context.Context, u *domain.User) error {
	_, err := r.db.Exec(ctx, `
		UPDATE users SET
			first_name = $1, last_name = $2, middle_name = $3,
			city = $4, address = $5, updated_at = $6
		WHERE id = $7`,
		u.FirstName, u.LastName, u.MiddleName,
		u.City, u.Address, time.Now(), u.ID,
	)
	if err != nil {
		return fmt.Errorf("users.repo: update: %w", err)
	}
	return nil
}

// дети

func (r *Repository) GetChildren(ctx context.Context, parentID int64) ([]*domain.Child, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, parent_id, first_name, last_name, middle_name, birth_date, created_at
		FROM children WHERE parent_id = $1
		ORDER BY created_at ASC`,
		parentID,
	)
	if err != nil {
		return nil, fmt.Errorf("users.repo: get children: %w", err)
	}
	defer rows.Close()

	var result []*domain.Child
	for rows.Next() {
		c := &domain.Child{}
		if err := rows.Scan(
			&c.ID, &c.ParentID, &c.FirstName, &c.LastName,
			&c.MiddleName, &c.BirthDate, &c.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("users.repo: scan child: %w", err)
		}
		result = append(result, c)
	}
	return result, nil
}

func (r *Repository) GetChildByID(ctx context.Context, id int64, parentID int64) (*domain.Child, error) {
	c := &domain.Child{}
	err := r.db.QueryRow(ctx, `
		SELECT id, parent_id, first_name, last_name, middle_name, birth_date, created_at
		FROM children WHERE id = $1 AND parent_id = $2`,
		id, parentID,
	).Scan(
		&c.ID, &c.ParentID, &c.FirstName, &c.LastName,
		&c.MiddleName, &c.BirthDate, &c.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("users.repo: get child by id: %w", err)
	}
	return c, nil
}

func (r *Repository) CreateChild(ctx context.Context, c *domain.Child) (int64, error) {
	var id int64
	err := r.db.QueryRow(ctx, `
		INSERT INTO children (parent_id, first_name, last_name, middle_name, birth_date)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id`,
		c.ParentID, c.FirstName, c.LastName, c.MiddleName, c.BirthDate,
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("users.repo: create child: %w", err)
	}
	return id, nil
}

func (r *Repository) UpdateChild(ctx context.Context, c *domain.Child) error {
	_, err := r.db.Exec(ctx, `
		UPDATE children SET
			first_name = $1, last_name = $2, middle_name = $3, birth_date = $4
		WHERE id = $5 AND parent_id = $6`,
		c.FirstName, c.LastName, c.MiddleName, c.BirthDate, c.ID, c.ParentID,
	)
	if err != nil {
		return fmt.Errorf("users.repo: update child: %w", err)
	}
	return nil
}

func (r *Repository) DeleteChild(ctx context.Context, id int64, parentID int64) error {
	_, err := r.db.Exec(ctx,
		`DELETE FROM children WHERE id = $1 AND parent_id = $2`,
		id, parentID,
	)
	if err != nil {
		return fmt.Errorf("users.repo: delete child: %w", err)
	}
	return nil
}

// админские

func (r *Repository) ListAll(ctx context.Context) ([]*domain.User, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, first_name, last_name, middle_name, phone_number,
		       city, address, birth_date, role, reputation, is_blocked, created_at, updated_at
		FROM users ORDER BY created_at DESC`)
	if err != nil {
		return nil, fmt.Errorf("users.repo: list all: %w", err)
	}
	defer rows.Close()

	var result []*domain.User
	for rows.Next() {
		u := &domain.User{}
		if err := rows.Scan(
			&u.ID, &u.FirstName, &u.LastName, &u.MiddleName, &u.PhoneNumber,
			&u.City, &u.Address, &u.BirthDate, &u.Role, &u.Reputation,
			&u.IsBlocked, &u.CreatedAt, &u.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("users.repo: scan: %w", err)
		}
		result = append(result, u)
	}
	return result, nil
}

func (r *Repository) SetBlocked(ctx context.Context, id int64, blocked bool) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET is_blocked = $1, updated_at = $2 WHERE id = $3`,
		blocked, time.Now(), id,
	)
	if err != nil {
		return fmt.Errorf("users.repo: set blocked: %w", err)
	}
	return nil
}

package sections

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

func (r *Repository) Create(ctx context.Context, s *domain.Section) (int64, error) {
	var id int64
	err := r.db.QueryRow(ctx, `
		INSERT INTO sections (name, description, trainer_name, address, schedule, contact, is_partner)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id`,
		s.Name, s.Description, s.TrainerName, s.Address, s.Schedule, s.Contact, s.IsPartner,
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("sections.repo: create: %w", err)
	}
	return id, nil
}

func (r *Repository) GetByID(ctx context.Context, id int64) (*domain.Section, error) {
	s := &domain.Section{}
	err := r.db.QueryRow(ctx, `
		SELECT id, name, description, trainer_name, address, schedule, contact, is_partner, created_at, updated_at
		FROM sections WHERE id = $1`, id,
	).Scan(
		&s.ID, &s.Name, &s.Description, &s.TrainerName,
		&s.Address, &s.Schedule, &s.Contact, &s.IsPartner,
		&s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("sections.repo: get by id: %w", err)
	}
	return s, nil
}

func (r *Repository) List(ctx context.Context) ([]*domain.Section, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, name, description, trainer_name, address, schedule, contact, is_partner, created_at, updated_at
		FROM sections ORDER BY name ASC`)
	if err != nil {
		return nil, fmt.Errorf("sections.repo: list: %w", err)
	}
	defer rows.Close()

	var result []*domain.Section
	for rows.Next() {
		s := &domain.Section{}
		if err := rows.Scan(
			&s.ID, &s.Name, &s.Description, &s.TrainerName,
			&s.Address, &s.Schedule, &s.Contact, &s.IsPartner,
			&s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("sections.repo: scan: %w", err)
		}
		result = append(result, s)
	}
	return result, nil
}

func (r *Repository) Update(ctx context.Context, s *domain.Section) error {
	_, err := r.db.Exec(ctx, `
		UPDATE sections SET
			name = $1, description = $2, trainer_name = $3,
			address = $4, schedule = $5, contact = $6,
			is_partner = $7, updated_at = $8
		WHERE id = $9`,
		s.Name, s.Description, s.TrainerName,
		s.Address, s.Schedule, s.Contact,
		s.IsPartner, time.Now(), s.ID,
	)
	if err != nil {
		return fmt.Errorf("sections.repo: update: %w", err)
	}
	return nil
}

func (r *Repository) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM sections WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("sections.repo: delete: %w", err)
	}
	return nil
}

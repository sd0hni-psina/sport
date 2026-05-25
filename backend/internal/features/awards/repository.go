package awards

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sd0hni-psina/sport/internal/domain"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, a *domain.Award) (int64, error) {
	var id int64
	err := r.db.QueryRow(ctx, `
		INSERT INTO awards (application_id, type, description, issued_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id`,
		a.ApplicationID, a.Type, a.Description, time.Now(),
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("awards.repo: create: %w", err)
	}
	return id, nil
}

func (r *Repository) ListByUser(ctx context.Context, userID int64) ([]*domain.Award, error) {
	rows, err := r.db.Query(ctx, `
		SELECT aw.id, aw.application_id, aw.type, aw.description, aw.issued_at
		FROM awards aw
		JOIN applications ap ON ap.id = aw.application_id
		WHERE ap.user_id = $1
		ORDER BY aw.issued_at DESC`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("awards.repo: list by user: %w", err)
	}
	defer rows.Close()

	var result []*domain.Award
	for rows.Next() {
		a := &domain.Award{}
		if err := rows.Scan(
			&a.ID, &a.ApplicationID, &a.Type, &a.Description, &a.IssuedAt,
		); err != nil {
			return nil, fmt.Errorf("awards.repo: scan: %w", err)
		}
		result = append(result, a)
	}
	return result, nil
}

func (r *Repository) ListByApplication(ctx context.Context, applicationID int64) ([]*domain.Award, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, application_id, type, description, issued_at
		FROM awards
		WHERE application_id = $1
		ORDER BY issued_at DESC`,
		applicationID,
	)
	if err != nil {
		return nil, fmt.Errorf("awards.repo: list by application: %w", err)
	}
	defer rows.Close()

	var result []*domain.Award
	for rows.Next() {
		a := &domain.Award{}
		if err := rows.Scan(
			&a.ID, &a.ApplicationID, &a.Type, &a.Description, &a.IssuedAt,
		); err != nil {
			return nil, fmt.Errorf("awards.repo: scan: %w", err)
		}
		result = append(result, a)
	}
	return result, nil
}

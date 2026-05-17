package gallery

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

func (r *Repository) Create(ctx context.Context, g *domain.Gallery) (int64, error) {
	var id int64
	err := r.db.QueryRow(ctx, `
		INSERT INTO gallery (event_id, url, type, caption)
		VALUES ($1, $2, $3, $4)
		RETURNING id`,
		g.EventID, g.URL, g.Type, g.Caption,
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("gallery.repo: create: %w", err)
	}
	return id, nil
}

func (r *Repository) GetByID(ctx context.Context, id int64) (*domain.Gallery, error) {
	g := &domain.Gallery{}
	err := r.db.QueryRow(ctx, `
		SELECT id, event_id, url, type, caption, created_at
		FROM gallery WHERE id = $1`, id,
	).Scan(&g.ID, &g.EventID, &g.URL, &g.Type, &g.Caption, &g.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("gallery.repo: get by id: %w", err)
	}
	return g, nil
}

func (r *Repository) List(ctx context.Context, f ListFilter) ([]*domain.Gallery, error) {
	query := `
		SELECT id, event_id, url, type, caption, created_at
		FROM gallery WHERE 1=1`

	args := []any{}
	argN := 1

	if f.EventID != nil {
		query += fmt.Sprintf(" AND event_id = $%d", argN)
		args = append(args, *f.EventID)
		argN++
	}

	if f.Year != nil {
		query += fmt.Sprintf(" AND EXTRACT(YEAR FROM created_at) = $%d", argN)
		args = append(args, *f.Year)
		argN++
	}

	query += " ORDER BY created_at DESC"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("gallery.repo: list: %w", err)
	}
	defer rows.Close()

	var result []*domain.Gallery
	for rows.Next() {
		g := &domain.Gallery{}
		if err := rows.Scan(
			&g.ID, &g.EventID, &g.URL, &g.Type, &g.Caption, &g.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("gallery.repo: scan: %w", err)
		}
		result = append(result, g)
	}
	return result, nil
}

func (r *Repository) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM gallery WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("gallery.repo: delete: %w", err)
	}
	return nil
}

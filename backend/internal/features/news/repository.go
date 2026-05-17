package news

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

func (r *Repository) Create(ctx context.Context, p *domain.Post) (int64, error) {
	var id int64
	err := r.db.QueryRow(ctx, `
		INSERT INTO posts (title, body, cover_image, event_id, published_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id`,
		p.Title, p.Body, p.CoverImage, p.EventID, p.PublishedAt,
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("news.repo: create: %w", err)
	}
	return id, nil
}

func (r *Repository) GetByID(ctx context.Context, id int64) (*domain.Post, error) {
	p := &domain.Post{}
	err := r.db.QueryRow(ctx, `
		SELECT id, title, body, cover_image, event_id, published_at, created_at, updated_at
		FROM posts WHERE id = $1`, id,
	).Scan(
		&p.ID, &p.Title, &p.Body, &p.CoverImage,
		&p.EventID, &p.PublishedAt, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("news.repo: get by id: %w", err)
	}
	return p, nil
}

func (r *Repository) List(ctx context.Context) ([]*domain.Post, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, title, body, cover_image, event_id, published_at, created_at, updated_at
		FROM posts
		WHERE published_at IS NOT NULL AND published_at <= NOW()
		ORDER BY published_at DESC`)
	if err != nil {
		return nil, fmt.Errorf("news.repo: list: %w", err)
	}
	defer rows.Close()

	var result []*domain.Post
	for rows.Next() {
		p := &domain.Post{}
		if err := rows.Scan(
			&p.ID, &p.Title, &p.Body, &p.CoverImage,
			&p.EventID, &p.PublishedAt, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("news.repo: scan: %w", err)
		}
		result = append(result, p)
	}
	return result, nil
}

func (r *Repository) Update(ctx context.Context, p *domain.Post) error {
	_, err := r.db.Exec(ctx, `
		UPDATE posts SET
			title = $1, body = $2, cover_image = $3,
			event_id = $4, published_at = $5, updated_at = $6
		WHERE id = $7`,
		p.Title, p.Body, p.CoverImage,
		p.EventID, p.PublishedAt, time.Now(), p.ID,
	)
	if err != nil {
		return fmt.Errorf("news.repo: update: %w", err)
	}
	return nil
}

func (r *Repository) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM posts WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("news.repo: delete: %w", err)
	}
	return nil
}

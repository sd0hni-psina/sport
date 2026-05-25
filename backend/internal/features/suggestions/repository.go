package suggestions

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Suggestion struct {
	ID        int64  `json:"id"`
	UserID    int64  `json:"user_id"`
	Text      string `json:"text"`
	Contact   string `json:"contact"`
	CreatedAt string `json:"created_at"`
}

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, userID int64, text, contact string) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO suggestions (user_id, text, contact) VALUES ($1, $2, $3)`,
		userID, text, contact,
	)
	if err != nil {
		return fmt.Errorf("suggestions.repo: create: %w", err)
	}
	return nil
}

func (r *Repository) List(ctx context.Context) ([]*Suggestion, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, user_id, text, contact, created_at FROM suggestions ORDER BY created_at DESC`,
	)
	if err != nil {
		return nil, fmt.Errorf("suggestions.repo: list: %w", err)
	}
	defer rows.Close()

	var result []*Suggestion
	for rows.Next() {
		s := &Suggestion{}
		if err := rows.Scan(&s.ID, &s.UserID, &s.Text, &s.Contact, &s.CreatedAt); err != nil {
			return nil, fmt.Errorf("suggestions.repo: scan: %w", err)
		}
		result = append(result, s)
	}
	return result, nil
}
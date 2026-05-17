package applications

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

func (r *Repository) Create(ctx context.Context, a *domain.Application) (int64, error) {
	query := `
		INSERT INTO applications (user_id, event_id, child_id, status, is_volunteer, notes)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id`

	var id int64
	err := r.db.QueryRow(ctx, query,
		a.UserID, a.EventID, a.ChildID,
		a.Status, a.IsVolunteer, a.Notes,
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("applications.repo: create: %w", err)
	}
	return id, nil
}

func (r *Repository) GetByID(ctx context.Context, id int64) (*domain.Application, error) {
	query := `
		SELECT id, user_id, event_id, child_id, status, is_volunteer, notes, admin_notes, created_at, updated_at
		FROM applications
		WHERE id = $1`

	a := &domain.Application{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&a.ID, &a.UserID, &a.EventID, &a.ChildID,
		&a.Status, &a.IsVolunteer, &a.Notes, &a.AdminNotes,
		&a.CreatedAt, &a.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("applications.repo: get by id: %w", err)
	}
	return a, nil
}

func (r *Repository) GetByUserAndEvent(ctx context.Context, userID, eventID int64, childID *int64) (*domain.Application, error) {
	query := `
		SELECT id, user_id, event_id, child_id, status, is_volunteer, notes, admin_notes, created_at, updated_at
		FROM applications
		WHERE user_id = $1 AND event_id = $2 AND child_id IS NOT DISTINCT FROM $3`

	a := &domain.Application{}
	err := r.db.QueryRow(ctx, query, userID, eventID, childID).Scan(
		&a.ID, &a.UserID, &a.EventID, &a.ChildID,
		&a.Status, &a.IsVolunteer, &a.Notes, &a.AdminNotes,
		&a.CreatedAt, &a.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("applications.repo: get by user and event: %w", err)
	}
	return a, nil
}

func (r *Repository) ListByUser(ctx context.Context, userID int64) ([]*domain.Application, error) {
	query := `
		SELECT id, user_id, event_id, child_id, status, is_volunteer, notes, admin_notes, created_at, updated_at
		FROM applications
		WHERE user_id = $1
		ORDER BY created_at DESC`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("applications.repo: list by user: %w", err)
	}
	defer rows.Close()

	var result []*domain.Application
	for rows.Next() {
		a := &domain.Application{}
		if err := rows.Scan(
			&a.ID, &a.UserID, &a.EventID, &a.ChildID,
			&a.Status, &a.IsVolunteer, &a.Notes, &a.AdminNotes,
			&a.CreatedAt, &a.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("applications.repo: scan: %w", err)
		}
		result = append(result, a)
	}
	return result, nil
}

func (r *Repository) ListByEvent(ctx context.Context, eventID int64, status string) ([]*domain.Application, error) {
	query := `
		SELECT id, user_id, event_id, child_id, status, is_volunteer, notes, admin_notes, created_at, updated_at
		FROM applications
		WHERE event_id = $1`

	args := []any{eventID}
	if status != "" {
		query += " AND status = $2"
		args = append(args, status)
	}
	query += " ORDER BY created_at ASC"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("applications.repo: list by event: %w", err)
	}
	defer rows.Close()

	var result []*domain.Application
	for rows.Next() {
		a := &domain.Application{}
		if err := rows.Scan(
			&a.ID, &a.UserID, &a.EventID, &a.ChildID,
			&a.Status, &a.IsVolunteer, &a.Notes, &a.AdminNotes,
			&a.CreatedAt, &a.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("applications.repo: scan: %w", err)
		}
		result = append(result, a)
	}
	return result, nil
}

func (r *Repository) CountConfirmed(ctx context.Context, eventID int64) (int, error) {
	var count int
	err := r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM applications WHERE event_id = $1 AND status IN ('pending', 'confirmed')`,
		eventID,
	).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("applications.repo: count confirmed: %w", err)
	}
	return count, nil
}

func (r *Repository) UpdateStatus(ctx context.Context, id int64, status domain.ApplicationStatus, adminNotes *string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE applications SET status = $1, admin_notes = $2, updated_at = $3 WHERE id = $4`,
		status, adminNotes, time.Now(), id,
	)
	if err != nil {
		return fmt.Errorf("applications.repo: update status: %w", err)
	}
	return nil
}

func (r *Repository) UpdateUserReputation(ctx context.Context, userID int64, delta int) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET reputation = GREATEST(0, reputation + $1), updated_at = $2 WHERE id = $3`,
		delta, time.Now(), userID,
	)
	if err != nil {
		return fmt.Errorf("applications.repo: update reputation: %w", err)
	}
	return nil
}

func (r *Repository) BlockUserIfNeeded(ctx context.Context, userID int64, threshold int) error {
	_, err := r.db.Exec(ctx,
		`UPDATE users SET is_blocked = TRUE, updated_at = $1 WHERE id = $2 AND reputation < $3`,
		time.Now(), userID, threshold,
	)
	if err != nil {
		return fmt.Errorf("applications.repo: block user: %w", err)
	}
	return nil
}

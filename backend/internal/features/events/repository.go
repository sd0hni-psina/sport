package events

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

func (r *Repository) Create(ctx context.Context, e *domain.Event) (int64, error) {
	query := `
		INSERT INTO events (
			name, sport_type, description, location, location_lat, location_lng,
			time_start, time_end, instructor_name, instructor_bio,
			min_age, max_age, max_participants, prizes, cancel_deadline_hrs, status
		) VALUES (
			$1, $2, $3, $4, $5, $6,
			$7, $8, $9, $10,
			$11, $12, $13, $14, $15, $16
		) RETURNING id`

	var id int64
	err := r.db.QueryRow(ctx, query,
		e.Name, e.SportType, e.Description, e.Location, e.LocationLat, e.LocationLng,
		e.TimeStart, e.TimeEnd, e.InstructorName, e.InstructorBio,
		e.MinAge, e.MaxAge, e.MaxParticipants, e.Prizes, e.CancelDeadlineHrs, e.Status,
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("events.repo: create: %w", err)
	}
	return id, nil
}

func (r *Repository) GetByID(ctx context.Context, id int64) (*domain.Event, error) {
	query := `
		SELECT id, name, sport_type, description, location, location_lat, location_lng,
		       time_start, time_end, instructor_name, instructor_bio,
		       min_age, max_age, max_participants, prizes, cancel_deadline_hrs,
		       status, created_at, updated_at
		FROM events
		WHERE id = $1`

	e := &domain.Event{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&e.ID, &e.Name, &e.SportType, &e.Description, &e.Location, &e.LocationLat, &e.LocationLng,
		&e.TimeStart, &e.TimeEnd, &e.InstructorName, &e.InstructorBio,
		&e.MinAge, &e.MaxAge, &e.MaxParticipants, &e.Prizes, &e.CancelDeadlineHrs,
		&e.Status, &e.CreatedAt, &e.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("events.repo: get by id: %w", err)
	}
	return e, nil
}

func (r *Repository) List(ctx context.Context, f ListEventsFilter) ([]*domain.Event, error) {
	if f.Page < 1 {
		f.Page = 1
	}
	if f.PageSize < 1 || f.PageSize > 100 {
		f.PageSize = 20
	}
	offset := (f.Page - 1) * f.PageSize

	query := `
		SELECT id, name, sport_type, description, location, location_lat, location_lng,
		       time_start, time_end, instructor_name, instructor_bio,
		       min_age, max_age, max_participants, prizes, cancel_deadline_hrs,
		       status, created_at, updated_at
		FROM events
		WHERE status = 'published'`

	args := []any{}
	argN := 1

	if f.SportType != "" {
		query += fmt.Sprintf(" AND sport_type = $%d", argN)
		args = append(args, f.SportType)
		argN++
	}

	if f.Date != "" {
		query += fmt.Sprintf(" AND DATE(time_start) = $%d", argN)
		args = append(args, f.Date)
		argN++
	}

	if f.Age != nil {
		query += fmt.Sprintf(" AND (min_age IS NULL OR min_age <= $%d) AND (max_age IS NULL OR max_age >= $%d)", argN, argN)
		args = append(args, *f.Age)
		argN++
	}

	query += fmt.Sprintf(" ORDER BY time_start ASC LIMIT $%d OFFSET $%d", argN, argN+1)
	args = append(args, f.PageSize, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("events.repo: list: %w", err)
	}
	defer rows.Close()

	var result []*domain.Event
	for rows.Next() {
		e := &domain.Event{}
		if err := rows.Scan(
			&e.ID, &e.Name, &e.SportType, &e.Description, &e.Location, &e.LocationLat, &e.LocationLng,
			&e.TimeStart, &e.TimeEnd, &e.InstructorName, &e.InstructorBio,
			&e.MinAge, &e.MaxAge, &e.MaxParticipants, &e.Prizes, &e.CancelDeadlineHrs,
			&e.Status, &e.CreatedAt, &e.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("events.repo: scan: %w", err)
		}
		result = append(result, e)
	}
	return result, nil
}

func (r *Repository) Update(ctx context.Context, e *domain.Event) error {
	query := `
		UPDATE events SET
			name = $1, sport_type = $2, description = $3, location = $4,
			location_lat = $5, location_lng = $6, time_start = $7, time_end = $8,
			instructor_name = $9, instructor_bio = $10, min_age = $11, max_age = $12,
			max_participants = $13, prizes = $14, cancel_deadline_hrs = $15,
			updated_at = $16
		WHERE id = $17`

	_, err := r.db.Exec(ctx, query,
		e.Name, e.SportType, e.Description, e.Location,
		e.LocationLat, e.LocationLng, e.TimeStart, e.TimeEnd,
		e.InstructorName, e.InstructorBio, e.MinAge, e.MaxAge,
		e.MaxParticipants, e.Prizes, e.CancelDeadlineHrs,
		time.Now(), e.ID,
	)
	if err != nil {
		return fmt.Errorf("events.repo: update: %w", err)
	}
	return nil
}

func (r *Repository) UpdateStatus(ctx context.Context, id int64, status domain.EventStatus) error {
	_, err := r.db.Exec(ctx,
		`UPDATE events SET status = $1, updated_at = $2 WHERE id = $3`,
		status, time.Now(), id,
	)
	if err != nil {
		return fmt.Errorf("events.repo: update status: %w", err)
	}
	return nil
}

func (r *Repository) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM events WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("events.repo: delete: %w", err)
	}
	return nil
}

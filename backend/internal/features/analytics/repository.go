package analytics

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetStats(ctx context.Context, from, to time.Time) (*StatsResponse, error) {
	stats := &StatsResponse{}

	// всего мероприятий за период
	err := r.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM events
		WHERE status IN ('published', 'completed')
		AND time_start BETWEEN $1 AND $2`,
		from, to,
	).Scan(&stats.TotalEvents)
	if err != nil {
		return nil, fmt.Errorf("analytics.repo: total events: %w", err)
	}

	// всего уникальных участников за период
	err = r.db.QueryRow(ctx, `
		SELECT COUNT(DISTINCT a.user_id)
		FROM applications a
		JOIN events e ON e.id = a.event_id
		WHERE a.status = 'attended'
		AND e.time_start BETWEEN $1 AND $2`,
		from, to,
	).Scan(&stats.TotalParticipants)
	if err != nil {
		return nil, fmt.Errorf("analytics.repo: total participants: %w", err)
	}

	// по видам спорта
	rows, err := r.db.Query(ctx, `
		SELECT e.sport_type, COUNT(a.id)
		FROM applications a
		JOIN events e ON e.id = a.event_id
		WHERE a.status IN ('confirmed', 'attended')
		AND e.time_start BETWEEN $1 AND $2
		GROUP BY e.sport_type
		ORDER BY COUNT(a.id) DESC`,
		from, to,
	)
	if err != nil {
		return nil, fmt.Errorf("analytics.repo: by sport: %w", err)
	}
	defer rows.Close()
	for rows.Next() {
		var s SportStat
		if err := rows.Scan(&s.SportType, &s.Count); err != nil {
			return nil, fmt.Errorf("analytics.repo: scan sport: %w", err)
		}
		stats.BySport = append(stats.BySport, s)
	}

	// топ мероприятий по популярности
	topRows, err := r.db.Query(ctx, `
		SELECT e.id, e.name, COUNT(a.id)
		FROM applications a
		JOIN events e ON e.id = a.event_id
		WHERE a.status IN ('confirmed', 'attended')
		AND e.time_start BETWEEN $1 AND $2
		GROUP BY e.id, e.name
		ORDER BY COUNT(a.id) DESC
		LIMIT 10`,
		from, to,
	)
	if err != nil {
		return nil, fmt.Errorf("analytics.repo: top events: %w", err)
	}
	defer topRows.Close()
	for topRows.Next() {
		var e EventStat
		if err := topRows.Scan(&e.EventID, &e.EventName, &e.Count); err != nil {
			return nil, fmt.Errorf("analytics.repo: scan event: %w", err)
		}
		stats.TopEvents = append(stats.TopEvents, e)
	}

	// возрастные группы
	ageRows, err := r.db.Query(ctx, `
		SELECT
			CASE
				WHEN EXTRACT(YEAR FROM AGE(u.birth_date)) < 18 THEN 'до 18'
				WHEN EXTRACT(YEAR FROM AGE(u.birth_date)) BETWEEN 18 AND 30 THEN '18-30'
				WHEN EXTRACT(YEAR FROM AGE(u.birth_date)) BETWEEN 31 AND 45 THEN '31-45'
				ELSE '46+'
			END AS age_group,
			COUNT(DISTINCT u.id)
		FROM applications a
		JOIN users u ON u.id = a.user_id
		JOIN events e ON e.id = a.event_id
		WHERE a.status IN ('confirmed', 'attended')
		AND e.time_start BETWEEN $1 AND $2
		GROUP BY age_group
		ORDER BY age_group`,
		from, to,
	)
	if err != nil {
		return nil, fmt.Errorf("analytics.repo: by age: %w", err)
	}
	defer ageRows.Close()
	for ageRows.Next() {
		var a AgeStat
		if err := ageRows.Scan(&a.AgeGroup, &a.Count); err != nil {
			return nil, fmt.Errorf("analytics.repo: scan age: %w", err)
		}
		stats.ByAge = append(stats.ByAge, a)
	}

	return stats, nil
}

func (r *Repository) GetPublicCounters(ctx context.Context) (totalEvents int, totalParticipants int, err error) {
	err = r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM events WHERE status IN ('published', 'completed')`,
	).Scan(&totalEvents)
	if err != nil {
		return 0, 0, fmt.Errorf("analytics.repo: total events: %w", err)
	}

	err = r.db.QueryRow(ctx,
		`SELECT COUNT(DISTINCT user_id) FROM applications WHERE status = 'attended'`,
	).Scan(&totalParticipants)
	if err != nil {
		return 0, 0, fmt.Errorf("analytics.repo: total participants: %w", err)
	}

	return totalEvents, totalParticipants, nil
}

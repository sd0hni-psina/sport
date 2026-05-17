package analytics

import (
	"context"
	"fmt"
	"time"

	"github.com/sd0hni-psina/sport/internal/domain"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetStats(ctx context.Context, f Filter) (*StatsResponse, error) {
	from, to, err := parsePeriod(f)
	if err != nil {
		return nil, err
	}
	return s.repo.GetStats(ctx, from, to)
}

func (s *Service) GetPublicCounters(ctx context.Context) (int, int, error) {
	return s.repo.GetPublicCounters(ctx)
}

func parsePeriod(f Filter) (time.Time, time.Time, error) {
	now := time.Now()

	// если указаны явные даты — используем их
	if f.From != "" && f.To != "" {
		from, err := time.Parse(time.RFC3339, f.From)
		if err != nil {
			return time.Time{}, time.Time{}, fmt.Errorf("%w: from must be RFC3339", domain.ErrInvalidInput)
		}
		to, err := time.Parse(time.RFC3339, f.To)
		if err != nil {
			return time.Time{}, time.Time{}, fmt.Errorf("%w: to must be RFC3339", domain.ErrInvalidInput)
		}
		return from, to, nil
	}

	// иначе по period
	switch f.Period {
	case "week":
		return now.AddDate(0, 0, -7), now, nil
	case "month":
		return now.AddDate(0, -1, 0), now, nil
	case "year":
		return now.AddDate(-1, 0, 0), now, nil
	default:
		return now.AddDate(0, -1, 0), now, nil // по умолчанию месяц
	}
}

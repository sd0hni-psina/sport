package gallery

import (
	"context"

	"github.com/sd0hni-psina/sport/internal/domain"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) List(ctx context.Context, f ListFilter) ([]*domain.Gallery, error) {
	return s.repo.List(ctx, f)
}

func (s *Service) Add(ctx context.Context, req AddItemRequest) (*domain.Gallery, error) {
	g := &domain.Gallery{
		EventID: req.EventID,
		URL:     req.URL,
		Type:    req.Type,
		Caption: req.Caption,
	}

	id, err := s.repo.Create(ctx, g)
	if err != nil {
		return nil, err
	}
	g.ID = id
	return g, nil
}

func (s *Service) Delete(ctx context.Context, id int64) error {
	if _, err := s.repo.GetByID(ctx, id); err != nil {
		return err
	}
	return s.repo.Delete(ctx, id)
}

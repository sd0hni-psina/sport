package news

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

func (s *Service) List(ctx context.Context) ([]*domain.Post, error) {
	return s.repo.List(ctx)
}

func (s *Service) GetByID(ctx context.Context, id int64) (*domain.Post, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) Create(ctx context.Context, req CreatePostRequest) (*domain.Post, error) {
	var publishedAt *time.Time
	if req.PublishedAt != nil {
		t, err := time.Parse(time.RFC3339, *req.PublishedAt)
		if err != nil {
			return nil, fmt.Errorf("%w: published_at must be RFC3339", domain.ErrInvalidInput)
		}
		publishedAt = &t
	}

	p := &domain.Post{
		Title:       req.Title,
		Body:        req.Body,
		CoverImage:  req.CoverImage,
		EventID:     req.EventID,
		PublishedAt: publishedAt,
	}

	id, err := s.repo.Create(ctx, p)
	if err != nil {
		return nil, err
	}
	p.ID = id
	return p, nil
}

func (s *Service) Update(ctx context.Context, id int64, req UpdatePostRequest) (*domain.Post, error) {
	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Title != nil {
		p.Title = *req.Title
	}
	if req.Body != nil {
		p.Body = *req.Body
	}
	if req.CoverImage != nil {
		p.CoverImage = req.CoverImage
	}
	if req.EventID != nil {
		p.EventID = req.EventID
	}
	if req.PublishedAt != nil {
		t, err := time.Parse(time.RFC3339, *req.PublishedAt)
		if err != nil {
			return nil, fmt.Errorf("%w: published_at must be RFC3339", domain.ErrInvalidInput)
		}
		p.PublishedAt = &t
	}

	if err := s.repo.Update(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *Service) Delete(ctx context.Context, id int64) error {
	if _, err := s.repo.GetByID(ctx, id); err != nil {
		return err
	}
	return s.repo.Delete(ctx, id)
}

func (s *Service) ListAll(ctx context.Context) ([]*domain.Post, error) {
	return s.repo.ListAll(ctx)
}

package sections

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

func (s *Service) List(ctx context.Context) ([]*domain.Section, error) {
	return s.repo.List(ctx)
}

func (s *Service) GetByID(ctx context.Context, id int64) (*domain.Section, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) Create(ctx context.Context, req CreateSectionRequest) (*domain.Section, error) {
	sec := &domain.Section{
		Name:        req.Name,
		Description: req.Description,
		TrainerName: req.TrainerName,
		Address:     req.Address,
		Schedule:    req.Schedule,
		Contact:     req.Contact,
		IsPartner:   req.IsPartner,
	}

	id, err := s.repo.Create(ctx, sec)
	if err != nil {
		return nil, err
	}
	sec.ID = id
	return sec, nil
}

func (s *Service) Update(ctx context.Context, id int64, req UpdateSectionRequest) (*domain.Section, error) {
	sec, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		sec.Name = *req.Name
	}
	if req.Description != nil {
		sec.Description = *req.Description
	}
	if req.TrainerName != nil {
		sec.TrainerName = req.TrainerName
	}
	if req.Address != nil {
		sec.Address = req.Address
	}
	if req.Schedule != nil {
		sec.Schedule = req.Schedule
	}
	if req.Contact != nil {
		sec.Contact = req.Contact
	}
	if req.IsPartner != nil {
		sec.IsPartner = *req.IsPartner
	}

	if err := s.repo.Update(ctx, sec); err != nil {
		return nil, err
	}
	return sec, nil
}

func (s *Service) Delete(ctx context.Context, id int64) error {
	if _, err := s.repo.GetByID(ctx, id); err != nil {
		return err
	}
	return s.repo.Delete(ctx, id)
}

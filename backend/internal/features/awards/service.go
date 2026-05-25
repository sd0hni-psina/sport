package awards

import (
	"context"
	"fmt"

	"github.com/sd0hni-psina/sport/internal/domain"
)

type Service struct {
	repo    *Repository
	appRepo ApplicationRepository
}

type ApplicationRepository interface {
	GetByID(ctx context.Context, id int64) (*domain.Application, error)
}

func NewService(repo *Repository, appRepo ApplicationRepository) *Service {
	return &Service{repo: repo, appRepo: appRepo}
}

func (s *Service) Create(ctx context.Context, applicationID int64, req CreateAwardRequest) (*domain.Award, error) {
	app, err := s.appRepo.GetByID(ctx, applicationID)
	if err != nil {
		return nil, err
	}

	if app.Status != domain.ApplicationStatusAttended {
		return nil, fmt.Errorf("%w: награду можно выдать только участнику со статусом attended", domain.ErrForbidden)
	}

	a := &domain.Award{
		ApplicationID: applicationID,
		Type:          req.Type,
		Description:   req.Description,
	}

	id, err := s.repo.Create(ctx, a)
	if err != nil {
		return nil, err
	}
	a.ID = id
	return a, nil
}

func (s *Service) ListByUser(ctx context.Context, userID int64) ([]*domain.Award, error) {
	return s.repo.ListByUser(ctx, userID)
}

func (s *Service) ListByApplication(ctx context.Context, applicationID int64) ([]*domain.Award, error) {
	return s.repo.ListByApplication(ctx, applicationID)
}

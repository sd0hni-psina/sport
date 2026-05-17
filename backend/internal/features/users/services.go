package users

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

func (s *Service) GetProfile(ctx context.Context, userID int64) (*domain.User, error) {
	return s.repo.GetByID(ctx, userID)
}

func (s *Service) UpdateProfile(ctx context.Context, userID int64, req UpdateProfileRequest) (*domain.User, error) {
	u, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if req.FirstName != "" {
		u.FirstName = req.FirstName
	}
	if req.LastName != "" {
		u.LastName = req.LastName
	}
	if req.MiddleName != nil {
		u.MiddleName = req.MiddleName
	}
	if req.City != "" {
		u.City = req.City
	}
	if req.Address != nil {
		u.Address = req.Address
	}

	if err := s.repo.Update(ctx, u); err != nil {
		return nil, err
	}
	return u, nil
}

func (s *Service) GetChildren(ctx context.Context, parentID int64) ([]*domain.Child, error) {
	return s.repo.GetChildren(ctx, parentID)
}

func (s *Service) AddChild(ctx context.Context, parentID int64, req AddChildRequest) (*domain.Child, error) {
	birthDate, err := time.Parse("2006-01-02", req.BirthDate)
	if err != nil {
		return nil, fmt.Errorf("%w: birth_date must be YYYY-MM-DD", domain.ErrInvalidInput)
	}

	c := &domain.Child{
		ParentID:   parentID,
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		MiddleName: req.MiddleName,
		BirthDate:  birthDate,
	}

	id, err := s.repo.CreateChild(ctx, c)
	if err != nil {
		return nil, err
	}
	c.ID = id
	return c, nil
}

func (s *Service) UpdateChild(ctx context.Context, parentID int64, childID int64, req UpdateChildRequest) (*domain.Child, error) {
	c, err := s.repo.GetChildByID(ctx, childID, parentID)
	if err != nil {
		return nil, err
	}

	if req.FirstName != nil {
		c.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		c.LastName = *req.LastName
	}
	if req.MiddleName != nil {
		c.MiddleName = req.MiddleName
	}
	if req.BirthDate != nil {
		t, err := time.Parse("2006-01-02", *req.BirthDate)
		if err != nil {
			return nil, fmt.Errorf("%w: birth_date must be YYYY-MM-DD", domain.ErrInvalidInput)
		}
		c.BirthDate = t
	}

	if err := s.repo.UpdateChild(ctx, c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *Service) DeleteChild(ctx context.Context, parentID int64, childID int64) error {
	if _, err := s.repo.GetChildByID(ctx, childID, parentID); err != nil {
		return err
	}
	return s.repo.DeleteChild(ctx, childID, parentID)
}

// админские

func (s *Service) AdminListUsers(ctx context.Context) ([]*domain.User, error) {
	return s.repo.ListAll(ctx)
}

func (s *Service) AdminSetBlocked(ctx context.Context, id int64, blocked bool) error {
	if _, err := s.repo.GetByID(ctx, id); err != nil {
		return err
	}
	return s.repo.SetBlocked(ctx, id, blocked)
}

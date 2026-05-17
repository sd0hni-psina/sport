package applications

import (
	"context"
	"fmt"
	"time"

	"github.com/sd0hni-psina/sport/internal/domain"
	eventsrepo "github.com/sd0hni-psina/sport/internal/features/events"
)

const (
	reputationPenalty   = 10
	reputationThreshold = 50
)

type Service struct {
	repo       *Repository
	eventsRepo *eventsrepo.Repository
}

func NewService(repo *Repository, eventsRepo *eventsrepo.Repository) *Service {
	return &Service{repo: repo, eventsRepo: eventsRepo}
}

func (s *Service) Apply(ctx context.Context, userID int64, eventID int64, req ApplyRequest, user *domain.User) (*domain.Application, error) {
	if user.IsBlocked {
		return nil, domain.ErrUserBlocked
	}

	event, err := s.eventsRepo.GetByID(ctx, eventID)
	if err != nil {
		return nil, err
	}

	if event.Status != domain.EventStatusPublished {
		return nil, fmt.Errorf("%w: event is not available for registration", domain.ErrForbidden)
	}

	// проверка возраста
	if event.MinAge != nil || event.MaxAge != nil {
		age := calculateAge(user.BirthDate)
		if event.MinAge != nil && age < *event.MinAge {
			return nil, fmt.Errorf("%w: minimum age is %d", domain.ErrForbidden, *event.MinAge)
		}
		if event.MaxAge != nil && age > *event.MaxAge {
			return nil, fmt.Errorf("%w: maximum age is %d", domain.ErrForbidden, *event.MaxAge)
		}
	}

	// проверка лимита мест
	if event.MaxParticipants != nil {
		count, err := s.repo.CountConfirmed(ctx, eventID)
		if err != nil {
			return nil, err
		}
		if count >= *event.MaxParticipants {
			return nil, domain.ErrEventFull
		}
	}

	// проверка дубликата
	existing, err := s.repo.GetByUserAndEvent(ctx, userID, eventID, req.ChildID)
	if err == nil && existing != nil {
		return nil, domain.ErrAlreadyExists
	}

	var notes *string
	if req.Notes != "" {
		notes = &req.Notes
	}

	a := &domain.Application{
		UserID:      userID,
		EventID:     eventID,
		ChildID:     req.ChildID,
		Status:      domain.ApplicationStatusPending,
		IsVolunteer: req.IsVolunteer,
		Notes:       notes,
	}

	id, err := s.repo.Create(ctx, a)
	if err != nil {
		return nil, err
	}
	a.ID = id
	return a, nil
}

func (s *Service) Cancel(ctx context.Context, applicationID int64, userID int64) error {
	a, err := s.repo.GetByID(ctx, applicationID)
	if err != nil {
		return err
	}

	if a.UserID != userID {
		return domain.ErrForbidden
	}

	if a.Status == domain.ApplicationStatusCancelledByUser ||
		a.Status == domain.ApplicationStatusCancelledByAdmin {
		return fmt.Errorf("%w: application already cancelled", domain.ErrInvalidInput)
	}

	event, err := s.eventsRepo.GetByID(ctx, a.EventID)
	if err != nil {
		return err
	}

	deadline := event.TimeStart.Add(-time.Duration(event.CancelDeadlineHrs) * time.Hour)
	if time.Now().After(deadline) {
		return domain.ErrDeadlinePassed
	}

	return s.repo.UpdateStatus(ctx, applicationID, domain.ApplicationStatusCancelledByUser, nil)
}

func (s *Service) ListByUser(ctx context.Context, userID int64) ([]*domain.Application, error) {
	return s.repo.ListByUser(ctx, userID)
}

// админские методы

func (s *Service) AdminUpdateStatus(ctx context.Context, applicationID int64, req UpdateStatusRequest) error {
	a, err := s.repo.GetByID(ctx, applicationID)
	if err != nil {
		return err
	}

	var adminNotes *string
	if req.AdminNotes != "" {
		adminNotes = &req.AdminNotes
	}

	if err := s.repo.UpdateStatus(ctx, applicationID, req.Status, adminNotes); err != nil {
		return err
	}

	// если no_show — снижаем репутацию и блокируем если нужно
	if req.Status == domain.ApplicationStatusNoShow {
		if err := s.repo.UpdateUserReputation(ctx, a.UserID, -reputationPenalty); err != nil {
			return err
		}
		if err := s.repo.BlockUserIfNeeded(ctx, a.UserID, reputationThreshold); err != nil {
			return err
		}
	}

	return nil
}

func (s *Service) AdminListByEvent(ctx context.Context, eventID int64, status string) ([]*domain.Application, error) {
	return s.repo.ListByEvent(ctx, eventID, status)
}

func calculateAge(birthDate time.Time) int {
	now := time.Now()
	years := now.Year() - birthDate.Year()
	if now.YearDay() < birthDate.YearDay() {
		years--
	}
	return years
}

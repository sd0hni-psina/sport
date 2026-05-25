package events

import (
	"context"
	"fmt"
	"time"

	"github.com/sd0hni-psina/sport/internal/domain"
)

type Service struct {
	repo *Repository
}

type ListResult struct {
	Events     []*domain.Event
	Total      int
	Page       int
	PageSize   int
	TotalPages int
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) List(ctx context.Context, f ListEventsFilter) ([]*domain.Event, error) {
	return s.repo.List(ctx, f)
}

func (s *Service) GetByID(ctx context.Context, id int64) (*domain.Event, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) Create(ctx context.Context, req CreateEventRequest) (*domain.Event, error) {
	timeStart, err := time.Parse(time.RFC3339, req.TimeStart)
	if err != nil {
		return nil, fmt.Errorf("%w: time_start must be RFC3339", domain.ErrInvalidInput)
	}
	timeEnd, err := time.Parse(time.RFC3339, req.TimeEnd)
	if err != nil {
		return nil, fmt.Errorf("%w: time_end must be RFC3339", domain.ErrInvalidInput)
	}
	if timeEnd.Before(timeStart) {
		return nil, fmt.Errorf("%w: time_end must be after time_start", domain.ErrInvalidInput)
	}

	deadlineHrs := req.CancelDeadlineHrs
	if deadlineHrs == 0 {
		deadlineHrs = 24
	}

	e := &domain.Event{
		Name:              req.Name,
		SportType:         req.SportType,
		Description:       req.Description,
		Location:          req.Location,
		LocationLat:       req.LocationLat,
		LocationLng:       req.LocationLng,
		TimeStart:         timeStart,
		TimeEnd:           timeEnd,
		InstructorName:    req.InstructorName,
		InstructorBio:     req.InstructorBio,
		MinAge:            req.MinAge,
		MaxAge:            req.MaxAge,
		MaxParticipants:   req.MaxParticipants,
		Prizes:            req.Prizes,
		CancelDeadlineHrs: deadlineHrs,
		Status:            domain.EventStatusDraft,
	}

	id, err := s.repo.Create(ctx, e)
	if err != nil {
		return nil, err
	}
	e.ID = id
	return e, nil
}

func (s *Service) Update(ctx context.Context, id int64, req UpdateEventRequest) (*domain.Event, error) {
	e, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		e.Name = *req.Name
	}
	if req.SportType != nil {
		e.SportType = *req.SportType
	}
	if req.Description != nil {
		e.Description = *req.Description
	}
	if req.Location != nil {
		e.Location = *req.Location
	}
	if req.LocationLat != nil {
		e.LocationLat = req.LocationLat
	}
	if req.LocationLng != nil {
		e.LocationLng = req.LocationLng
	}
	if req.TimeStart != nil {
		t, err := time.Parse(time.RFC3339, *req.TimeStart)
		if err != nil {
			return nil, fmt.Errorf("%w: time_start must be RFC3339", domain.ErrInvalidInput)
		}
		e.TimeStart = t
	}
	if req.TimeEnd != nil {
		t, err := time.Parse(time.RFC3339, *req.TimeEnd)
		if err != nil {
			return nil, fmt.Errorf("%w: time_end must be RFC3339", domain.ErrInvalidInput)
		}
		e.TimeEnd = t
	}
	if req.InstructorName != nil {
		e.InstructorName = req.InstructorName
	}
	if req.InstructorBio != nil {
		e.InstructorBio = req.InstructorBio
	}
	if req.MinAge != nil {
		e.MinAge = req.MinAge
	}
	if req.MaxAge != nil {
		e.MaxAge = req.MaxAge
	}
	if req.MaxParticipants != nil {
		e.MaxParticipants = req.MaxParticipants
	}
	if req.Prizes != nil {
		e.Prizes = req.Prizes
	}
	if req.CancelDeadlineHrs != nil {
		e.CancelDeadlineHrs = *req.CancelDeadlineHrs
	}

	if err := s.repo.Update(ctx, e); err != nil {
		return nil, err
	}
	return e, nil
}

func (s *Service) UpdateStatus(ctx context.Context, id int64, req UpdateStatusRequest) error {
	validStatuses := map[domain.EventStatus]bool{
		domain.EventStatusDraft:     true,
		domain.EventStatusPublished: true,
		domain.EventStatusCancelled: true,
		domain.EventStatusCompleted: true,
	}
	if !validStatuses[req.Status] {
		return fmt.Errorf("%w: invalid status", domain.ErrInvalidInput)
	}

	if _, err := s.repo.GetByID(ctx, id); err != nil {
		return err
	}
	return s.repo.UpdateStatus(ctx, id, req.Status)
}

func (s *Service) Delete(ctx context.Context, id int64) error {
	if _, err := s.repo.GetByID(ctx, id); err != nil {
		return err
	}

	count, err := s.repo.CountActiveApplications(ctx, id)
	if err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("%w: event has %d active applications, cancel them first", domain.ErrForbidden, count)
	}

	return s.repo.Delete(ctx, id)
}

func (s *Service) ListAll(ctx context.Context) ([]*domain.Event, error) {
	return s.repo.ListAll(ctx)
}

func (s *Service) ListWithPagination(ctx context.Context, f ListEventsFilter) (*ListResult, error) {
	if f.Page < 1 {
		f.Page = 1
	}
	if f.PageSize < 1 || f.PageSize > 100 {
		f.PageSize = 12
	}

	events, err := s.repo.List(ctx, f)
	if err != nil {
		return nil, err
	}

	total, err := s.repo.Count(ctx, f)
	if err != nil {
		return nil, err
	}

	totalPages := total / f.PageSize
	if total%f.PageSize != 0 {
		totalPages++
	}

	return &ListResult{
		Events:     events,
		Total:      total,
		Page:       f.Page,
		PageSize:   f.PageSize,
		TotalPages: totalPages,
	}, nil
}

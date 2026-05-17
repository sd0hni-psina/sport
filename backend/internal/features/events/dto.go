package events

import "github.com/sd0hni-psina/sport/internal/domain"

type CreateEventRequest struct {
	Name              string   `json:"name" binding:"required,min=2,max=255"`
	SportType         string   `json:"sport_type" binding:"required"`
	Description       string   `json:"description" binding:"required"`
	Location          string   `json:"location" binding:"required"`
	LocationLat       *float64 `json:"location_lat"`
	LocationLng       *float64 `json:"location_lng"`
	TimeStart         string   `json:"time_start" binding:"required"` // RFC3339
	TimeEnd           string   `json:"time_end" binding:"required"`
	InstructorName    *string  `json:"instructor_name"`
	InstructorBio     *string  `json:"instructor_bio"`
	MinAge            *int     `json:"min_age"`
	MaxAge            *int     `json:"max_age"`
	MaxParticipants   *int     `json:"max_participants"`
	Prizes            *string  `json:"prizes"`
	CancelDeadlineHrs int      `json:"cancel_deadline_hrs"`
}

type UpdateEventRequest struct {
	Name              *string  `json:"name"`
	SportType         *string  `json:"sport_type"`
	Description       *string  `json:"description"`
	Location          *string  `json:"location"`
	LocationLat       *float64 `json:"location_lat"`
	LocationLng       *float64 `json:"location_lng"`
	TimeStart         *string  `json:"time_start"`
	TimeEnd           *string  `json:"time_end"`
	InstructorName    *string  `json:"instructor_name"`
	InstructorBio     *string  `json:"instructor_bio"`
	MinAge            *int     `json:"min_age"`
	MaxAge            *int     `json:"max_age"`
	MaxParticipants   *int     `json:"max_participants"`
	Prizes            *string  `json:"prizes"`
	CancelDeadlineHrs *int     `json:"cancel_deadline_hrs"`
}

type UpdateStatusRequest struct {
	Status domain.EventStatus `json:"status" binding:"required"`
}

type ListEventsFilter struct {
	SportType string `form:"sport"`
	Date      string `form:"date"` // YYYY-MM-DD
	Age       *int   `form:"age"`
	Page      int    `form:"page"`
	PageSize  int    `form:"page_size"`
}

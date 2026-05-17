package domain

import "time"

type EventStatus string

const (
	EventStatusDraft     EventStatus = "draft"
	EventStatusPublished EventStatus = "published"
	EventStatusCancelled EventStatus = "cancelled"
	EventStatusCompleted EventStatus = "completed"
)

type Event struct {
	ID                int64       `json:"id"`
	Name              string      `json:"name"`
	SportType         string      `json:"sport_type"`
	Description       string      `json:"description"`
	Location          string      `json:"location"`
	LocationLat       *float64    `json:"location_lat"`
	LocationLng       *float64    `json:"location_lng"`
	TimeStart         time.Time   `json:"time_start"`
	TimeEnd           time.Time   `json:"time_end"`
	InstructorName    *string     `json:"instructor_name"`
	InstructorBio     *string     `json:"instructor_bio"`
	MinAge            *int        `json:"min_age"`
	MaxAge            *int        `json:"max_age"`
	MaxParticipants   *int        `json:"max_participants"`
	Prizes            *string     `json:"prizes"`
	CancelDeadlineHrs int         `json:"cancel_deadline_hrs"`
	Status            EventStatus `json:"status"`
	CreatedAt         time.Time   `json:"created_at"`
	UpdatedAt         time.Time   `json:"updated_at"`
}

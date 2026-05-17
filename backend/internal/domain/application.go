package domain

import "time"

type ApplicationStatus string

const (
	ApplicationStatusPending          ApplicationStatus = "pending"
	ApplicationStatusConfirmed        ApplicationStatus = "confirmed"
	ApplicationStatusCancelledByUser  ApplicationStatus = "cancelled_by_user"
	ApplicationStatusCancelledByAdmin ApplicationStatus = "cancelled_by_admin"
	ApplicationStatusNoShow           ApplicationStatus = "no_show"
	ApplicationStatusAttended         ApplicationStatus = "attended"
)

type Application struct {
	ID          int64             `json:"id"`
	UserID      int64             `json:"user_id"`
	EventID     int64             `json:"event_id"`
	ChildID     *int64            `json:"child_id"`
	Status      ApplicationStatus `json:"status"`
	IsVolunteer bool              `json:"is_volunteer"`
	Notes       *string           `json:"notes"`
	AdminNotes  *string           `json:"admin_notes"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
}

type Award struct {
	ID            int64     `json:"id"`
	ApplicationID int64     `json:"application_id"`
	Type          AwardType `json:"type"`
	Description   string    `json:"description"`
	IssuedAt      time.Time `json:"issued_at"`
}

type AwardType string

const (
	AwardTypeMedal       AwardType = "medal"
	AwardTypeDiploma     AwardType = "diploma"
	AwardTypeCertificate AwardType = "certificate"
)

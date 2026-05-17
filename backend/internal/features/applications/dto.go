package applications

import "github.com/sd0hni-psina/sport/internal/domain"

type ApplyRequest struct {
	ChildID     *int64 `json:"child_id"`
	IsVolunteer bool   `json:"is_volunteer"`
	Notes       string `json:"notes"`
}

type UpdateStatusRequest struct {
	Status     domain.ApplicationStatus `json:"status" binding:"required"`
	AdminNotes string                   `json:"admin_notes"`
}

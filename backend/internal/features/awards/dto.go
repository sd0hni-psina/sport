package awards

import "github.com/sd0hni-psina/sport/internal/domain"

type CreateAwardRequest struct {
	Type        domain.AwardType `json:"type" binding:"required"`
	Description string           `json:"description" binding:"required"`
}

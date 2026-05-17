package gallery

import "github.com/sd0hni-psina/sport/internal/domain"

type AddItemRequest struct {
	EventID *int64             `json:"event_id"`
	URL     string             `json:"url" binding:"required"`
	Type    domain.GalleryType `json:"type" binding:"required"`
	Caption *string            `json:"caption"`
}

type ListFilter struct {
	EventID *int64 `form:"event_id"`
	Year    *int   `form:"year"`
}

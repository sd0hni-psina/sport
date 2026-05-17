package domain

import "time"

type Section struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	TrainerName *string   `json:"trainer_name"`
	Address     *string   `json:"address"`
	Schedule    *string   `json:"schedule"`
	Contact     *string   `json:"contact"`
	IsPartner   bool      `json:"is_partner"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Gallery struct {
	ID        int64       `json:"id"`
	EventID   *int64      `json:"event_id"`
	URL       string      `json:"url"`
	Type      GalleryType `json:"type"`
	Caption   *string     `json:"caption"`
	CreatedAt time.Time   `json:"created_at"`
}
type GalleryType string

const (
	GalleryTypePhoto GalleryType = "photo"
	GalleryTypeVideo GalleryType = "video"
)

package news

type CreatePostRequest struct {
	Title       string  `json:"title" binding:"required,min=2,max=255"`
	Body        string  `json:"body" binding:"required"`
	CoverImage  *string `json:"cover_image"`
	EventID     *int64  `json:"event_id"`
	PublishedAt *string `json:"published_at"` // RFC3339, nil = черновик
}

type UpdatePostRequest struct {
	Title       *string `json:"title" binding:"omitempty,min=2,max=255"`
	Body        *string `json:"body"`
	CoverImage  *string `json:"cover_image"`
	EventID     *int64  `json:"event_id"`
	PublishedAt *string `json:"published_at"`
}

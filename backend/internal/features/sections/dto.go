package sections

type CreateSectionRequest struct {
	Name        string  `json:"name" binding:"required,min=2,max=255"`
	Description string  `json:"description" binding:"required"`
	TrainerName *string `json:"trainer_name"`
	Address     *string `json:"address"`
	Schedule    *string `json:"schedule"`
	Contact     *string `json:"contact"`
	IsPartner   bool    `json:"is_partner"`
}

type UpdateSectionRequest struct {
	Name        *string `json:"name" binding:"omitempty,min=2,max=255"`
	Description *string `json:"description"`
	TrainerName *string `json:"trainer_name"`
	Address     *string `json:"address"`
	Schedule    *string `json:"schedule"`
	Contact     *string `json:"contact"`
	IsPartner   *bool   `json:"is_partner"`
}

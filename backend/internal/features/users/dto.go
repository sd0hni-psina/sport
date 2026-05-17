package users

type UpdateProfileRequest struct {
	FirstName  string  `json:"first_name" binding:"omitempty,min=2,max=100"`
	LastName   string  `json:"last_name" binding:"omitempty,min=2,max=100"`
	MiddleName *string `json:"middle_name"`
	City       string  `json:"city" binding:"omitempty"`
	Address    *string `json:"address"`
}

type AddChildRequest struct {
	FirstName  string  `json:"first_name" binding:"required,min=2,max=100"`
	LastName   string  `json:"last_name" binding:"required,min=2,max=100"`
	MiddleName *string `json:"middle_name"`
	BirthDate  string  `json:"birth_date" binding:"required"` // YYYY-MM-DD
}

type UpdateChildRequest struct {
	FirstName  *string `json:"first_name" binding:"omitempty,min=2,max=100"`
	LastName   *string `json:"last_name" binding:"omitempty,min=2,max=100"`
	MiddleName *string `json:"middle_name"`
	BirthDate  *string `json:"birth_date"`
}

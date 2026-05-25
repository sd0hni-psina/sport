package auth

type RegisterRequest struct {
	FirstName   string `json:"first_name" binding:"required,min=2,max=100"`
	LastName    string `json:"last_name" binding:"required,min=2,max=100"`
	MiddleName  string `json:"middle_name"`
	PhoneNumber string `json:"phone_number" binding:"required,min=10,max=20"`
	City        string `json:"city" binding:"required"`
	BirthDate   string `json:"birth_date" binding:"required"` // 2006-01-02
}

type VerifyRequest struct {
	PhoneNumber string `json:"phone_number" binding:"required"`
	Code        string `json:"code" binding:"required,len=6"`
}

type LoginRequest struct {
	PhoneNumber string `json:"phone_number" binding:"required"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type RegisterEmailRequest struct {
	FirstName  string `json:"first_name"  binding:"required,min=2,max=100"`
	LastName   string `json:"last_name"   binding:"required,min=2,max=100"`
	MiddleName string `json:"middle_name"`
	Email      string `json:"email"       binding:"required,email"`
	City       string `json:"city"        binding:"required"`
	BirthDate  string `json:"birth_date"  binding:"required"`
}

type LoginEmailRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type VerifyEmailRequest struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code"  binding:"required,len=6"`
}

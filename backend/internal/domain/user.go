package domain

import "time"

type UserRole string

const (
	UserRoleUser  UserRole = "user"
	UserRoleAdmin UserRole = "admin"
)

type User struct {
	ID          int64     `json:"id"`
	FirstName   string    `json:"first_name"`
	LastName    string    `json:"last_name"`
	MiddleName  *string   `json:"middle_name"`
	PhoneNumber string    `json:"phone_number"`
	City        string    `json:"city"`
	Address     *string   `json:"address"`
	BirthDate   time.Time `json:"birth_date"`
	Role        UserRole  `json:"role"`
	Reputation  int       `json:"reputation"`
	IsBlocked   bool      `json:"is_blocked"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Child struct {
	ID         int64     `json:"id"`
	ParentID   int64     `json:"parent_id"`
	FirstName  string    `json:"first_name"`
	LastName   string    `json:"last_name"`
	MiddleName *string   `json:"middle_name"`
	BirthDate  time.Time `json:"birth_date"`
	CreatedAt  time.Time `json:"created_at"`
}

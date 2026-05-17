package domain

import "errors"

var (
	ErrNotFound       = errors.New("not found")
	ErrAlreadyExists  = errors.New("already exists")
	ErrForbidden      = errors.New("forbidden")
	ErrUnauthorized   = errors.New("unauthorized")
	ErrUserBlocked    = errors.New("user is blocked")
	ErrDeadlinePassed = errors.New("cancellation deadline has passed")
	ErrEventFull      = errors.New("event is full")
	ErrInvalidInput   = errors.New("invalid input")
)

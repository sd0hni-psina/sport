package applications

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sd0hni-psina/sport/internal/domain"
	"github.com/sd0hni-psina/sport/internal/features/auth"
	"github.com/sd0hni-psina/sport/internal/middleware"
)

type Handler struct {
	service  *Service
	userRepo UserRepository
	authRepo *auth.Repository
}

type UserRepository interface {
	GetByID(ctx interface{ Done() <-chan struct{} }, id int64) (*domain.User, error)
}

func NewHandler(service *Service, authRepo *auth.Repository) *Handler {
	return &Handler{service: service, authRepo: authRepo}
}

func (h *Handler) Apply(c *gin.Context) {
	eventID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event id"})
		return
	}

	userID := c.GetInt64(middleware.ContextUserID)

	var req ApplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.authRepo.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	application, err := h.service.Apply(c.Request.Context(), userID, eventID, req, user)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": application})
}

func (h *Handler) Cancel(c *gin.Context) {
	applicationID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	userID := c.GetInt64(middleware.ContextUserID)

	if err := h.service.Cancel(c.Request.Context(), applicationID, userID); err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "application cancelled"})
}

func (h *Handler) MyApplications(c *gin.Context) {
	userID := c.GetInt64(middleware.ContextUserID)

	applications, err := h.service.ListByUser(c.Request.Context(), userID)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": applications})
}

// админские

func (h *Handler) AdminList(c *gin.Context) {
	eventID, err := strconv.ParseInt(c.Query("event_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid event_id"})
		return
	}

	status := c.Query("status")

	applications, err := h.service.AdminListByEvent(c.Request.Context(), eventID, status)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": applications})
}

func (h *Handler) AdminUpdateStatus(c *gin.Context) {
	applicationID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.AdminUpdateStatus(c.Request.Context(), applicationID, req); err != nil {
		h.handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "status updated"})
}

func (h *Handler) handleError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, domain.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
	case errors.Is(err, domain.ErrAlreadyExists):
		c.JSON(http.StatusConflict, gin.H{"error": "already applied"})
	case errors.Is(err, domain.ErrForbidden):
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
	case errors.Is(err, domain.ErrUserBlocked):
		c.JSON(http.StatusForbidden, gin.H{"error": "user is blocked"})
	case errors.Is(err, domain.ErrEventFull):
		c.JSON(http.StatusConflict, gin.H{"error": "event is full"})
	case errors.Is(err, domain.ErrDeadlinePassed):
		c.JSON(http.StatusBadRequest, gin.H{"error": "cancellation deadline has passed"})
	case errors.Is(err, domain.ErrInvalidInput):
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
	}
}

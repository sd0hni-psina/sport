package analytics

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sd0hni-psina/sport/internal/domain"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// публичные счётчики для главной страницы
func (h *Handler) PublicCounters(c *gin.Context) {
	totalEvents, totalParticipants, err := h.service.GetPublicCounters(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_events":       totalEvents,
		"total_participants": totalParticipants,
	})
}

// полная аналитика для акимата — публичная
func (h *Handler) GetStats(c *gin.Context) {
	var f Filter
	if err := c.ShouldBindQuery(&f); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	stats, err := h.service.GetStats(c.Request.Context(), f)
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrInvalidInput):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// расширенная аналитика только для админа
func (h *Handler) AdminGetStats(c *gin.Context) {
	h.GetStats(c)
}

func (h *Handler) AdminSummary(c *gin.Context) {
	summary, err := h.service.GetAdminSummary(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": summary})
}

func (h *Handler) DailyActivity(c *gin.Context) {
	data, err := h.service.GetDailyActivity(c.Request.Context(), 30)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": data})
}
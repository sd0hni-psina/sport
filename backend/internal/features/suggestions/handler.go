package suggestions

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sd0hni-psina/sport/internal/middleware"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

type CreateRequest struct {
	Text    string `json:"text"    binding:"required,min=10"`
	Contact string `json:"contact"`
}

func (h *Handler) Create(c *gin.Context) {
	userID := c.GetInt64(middleware.ContextUserID)

	var req CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.Create(c.Request.Context(), userID, req.Text, req.Contact); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "suggestion submitted"})
}

func (h *Handler) AdminList(c *gin.Context) {
	items, err := h.repo.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}
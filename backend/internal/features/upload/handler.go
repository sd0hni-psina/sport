package upload

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sd0hni-psina/sport/internal/platform/storage"
)

type Handler struct {
	storage *storage.CloudinaryClient
}

func NewHandler(storage *storage.CloudinaryClient) *Handler {
	return &Handler{storage: storage}
}

func (h *Handler) Upload(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}
	defer file.Close()

	// проверяем размер — максимум 10MB
	if header.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file too large, maximum 10MB"})
		return
	}

	result, err := h.storage.Upload(c.Request.Context(), file, header.Filename)
	if err != nil {
		slog.Error("upload failed", "err", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "upload failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":       result.URL,
		"public_id": result.PublicID,
	})
}
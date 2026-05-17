package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sd0hni-psina/sport/internal/features/analytics"
	"github.com/sd0hni-psina/sport/internal/features/applications"
	"github.com/sd0hni-psina/sport/internal/features/auth"
	"github.com/sd0hni-psina/sport/internal/features/events"
	"github.com/sd0hni-psina/sport/internal/features/gallery"
	"github.com/sd0hni-psina/sport/internal/features/news"
	"github.com/sd0hni-psina/sport/internal/features/sections"
	"github.com/sd0hni-psina/sport/internal/features/users"
	"github.com/sd0hni-psina/sport/internal/middleware"
)

func (s *Server) registerRoutes(r *gin.Engine) {
	r.GET("/health", s.healthCheck)

	authRepo := auth.NewRepository(s.pg)
	authService := auth.NewService(authRepo, s.rdb, s.cfg.JWT)
	authHandler := auth.NewHandler(authService)

	eventsRepo := events.NewRepository(s.pg)
	eventsService := events.NewService(eventsRepo)
	eventsHandler := events.NewHandler(eventsService)

	applicationsRepo := applications.NewRepository(s.pg)
	applicationsService := applications.NewService(applicationsRepo, eventsRepo)
	applicationsHandler := applications.NewHandler(applicationsService, authRepo)

	usersRepo := users.NewRepository(s.pg)
	usersService := users.NewService(usersRepo)
	usersHandler := users.NewHandler(usersService)

	newsRepo := news.NewRepository(s.pg)
	newsService := news.NewService(newsRepo)
	newsHandler := news.NewHandler(newsService)

	sectionsRepo := sections.NewRepository(s.pg)
	sectionsService := sections.NewService(sectionsRepo)
	sectionsHandler := sections.NewHandler(sectionsService)

	galleryRepo := gallery.NewRepository(s.pg)
	galleryService := gallery.NewService(galleryRepo)
	galleryHandler := gallery.NewHandler(galleryService)

	analyticsRepo := analytics.NewRepository(s.pg)
	analyticsService := analytics.NewService(analyticsRepo)
	analyticsHandler := analytics.NewHandler(analyticsService)

	v1 := r.Group("/api/v1")
	{
		a := v1.Group("/auth")
		{
			a.POST("/register", authHandler.Register)
			a.POST("/verify", authHandler.Verify)
			a.POST("/login", authHandler.Login)
			a.POST("/refresh", authHandler.Refresh)
			a.POST("/logout", authHandler.Logout)
		}

		// публичные
		v1.GET("/events", eventsHandler.List)
		v1.GET("/events/:id", eventsHandler.GetByID)

		v1.GET("/news", newsHandler.List)
		v1.GET("/news/:id", newsHandler.GetByID)

		v1.GET("/sections", sectionsHandler.List)
		v1.GET("/sections/:id", sectionsHandler.GetByID)

		v1.GET("/gallery", galleryHandler.List)

		v1.GET("/stats", analyticsHandler.PublicCounters)
		v1.GET("/stats/full", analyticsHandler.GetStats)

		// требует JWT
		protected := v1.Group("")
		protected.Use(middleware.Auth(s.cfg.JWT))
		{
			protected.GET("/me", usersHandler.GetProfile)
			protected.PUT("/me", usersHandler.UpdateProfile)
			protected.GET("/me/children", usersHandler.GetChildren)
			protected.POST("/me/children", usersHandler.AddChild)
			protected.PUT("/me/children/:id", usersHandler.UpdateChild)
			protected.DELETE("/me/children/:id", usersHandler.DeleteChild)

			protected.GET("/me/applications", applicationsHandler.MyApplications)
			protected.POST("/events/:id/apply", applicationsHandler.Apply)
			protected.DELETE("/applications/:id", applicationsHandler.Cancel)
		}

		// требует JWT + admin
		admin := v1.Group("/admin")
		admin.Use(middleware.Auth(s.cfg.JWT), middleware.RequireAdmin())
		{
			admin.POST("/events", eventsHandler.Create)
			admin.PUT("/events/:id", eventsHandler.Update)
			admin.DELETE("/events/:id", eventsHandler.Delete)
			admin.PATCH("/events/:id/status", eventsHandler.UpdateStatus)

			admin.GET("/applications", applicationsHandler.AdminList)
			admin.PATCH("/applications/:id/status", applicationsHandler.AdminUpdateStatus)

			admin.GET("/users", usersHandler.AdminListUsers)
			admin.PATCH("/users/:id/block", usersHandler.AdminBlockUser)
			admin.PATCH("/users/:id/unblock", usersHandler.AdminUnblockUser)

			admin.POST("/news", newsHandler.Create)
			admin.PUT("/news/:id", newsHandler.Update)
			admin.DELETE("/news/:id", newsHandler.Delete)

			admin.POST("/sections", sectionsHandler.Create)
			admin.PUT("/sections/:id", sectionsHandler.Update)
			admin.DELETE("/sections/:id", sectionsHandler.Delete)

			admin.POST("/gallery", galleryHandler.Add)
			admin.DELETE("/gallery/:id", galleryHandler.Delete)

			admin.GET("/analytics", analyticsHandler.AdminGetStats)

		}
	}
}

func (s *Server) healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

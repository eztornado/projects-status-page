package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/goravel/framework"
	"github.com/gitlawb/status-page/backend/go/config"
	"github.com/gitlawb/status-page/backend/go/checkers"
	"github.com/gitlawb/status-page/backend/go/scheduler"
)

func main() {
	// Crear la aplicación
	app := framework.New(config.AppEnv)

	// Inicializar base de datos
	if err := app.Database.Init(config.DBConnection, config.DBDatabase); err != nil {
		log.Fatalf("Error inicializando base de datos: %v", err)
	}
	defer app.Database.Close()

	// Registrar routes
	app.Get("/api/v1/services", func(ctx context.Context, app framework.Application) interface{} {
		services := app.Services.GetAll()
		return services
	})

	app.Post("/api/v1/services", func(ctx context.Context, app framework.Application) interface{} {
		service := &models.Service{
			Name:        ctx.Request.PostForm.Get("name"),
			Description: ctx.Request.PostForm.Get("description"),
			Url:         ctx.Request.PostForm.Get("url"),
			ApiUrl:      ctx.Request.PostForm.Get("api_url"),
			Type:        ctx.Request.PostForm.Get("type"),
			Username:    ctx.Request.PostForm.Get("username"),
			Password:    ctx.Request.PostForm.Get("password"),
			Host:        ctx.Request.PostForm.Get("host"),
			Port:        ctx.Request.PostForm.Get("port"),
			Database:    ctx.Request.PostForm.Get("database"),
			UseSSL:      ctx.Request.PostForm.Get("use_ssl") == "true",
			Interval:    60,
			Active:      true,
		}
		app.Services.Create(service)
		return service
	})

	app.Get("/api/v1/services/:id", func(ctx context.Context, app framework.Application) interface{} {
		id := ctx.Params.Get("id")
		service := app.Services.Get(id)
		return service
	})

	app.Delete("/api/v1/services/:id", func(ctx context.Context, app framework.Application) interface{} {
		id := ctx.Params.Get("id")
		app.Services.Delete(id)
		return map[string]string{"status": "deleted"}
	})

	app.Get("/api/v1/status", func(ctx context.Context, app framework.Application) interface{} {
		return map[string]interface{}{
			"app_name": config.AppName,
			"app_env":  config.AppEnv,
		}
	})

	app.Post("/api/v1/webhook", func(ctx context.Context, app framework.Application) interface{} {
		if config.CoolifyWebhookURL != "" {
			// Enviar notificación a Coolify
		}
		return map[string]string{"status": "received"}
	})

	app.Get("/api/v1/services/:id/status", func(ctx context.Context, app framework.Application) interface{} {
		id := ctx.Params.Get("id")
		service := app.Services.Get(id)
		status, _ := app.Services.GetStatus(id)
		return status
	})

	// Iniciar checker y scheduler
	go runScheduler(app)

	// Iniciar servidor HTTP
	if err := app.HttpServer.ListenAndServe(config.Port, nil); err != nil {
		log.Printf("Error en servidor: %v", err)
	}
}

func runScheduler(app framework.Application) {
	scheduler := scheduler.NewScheduler(app)
	scheduler.RunAllChecks()
}

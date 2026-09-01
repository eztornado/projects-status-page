package checkers

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/goravel/framework"
	"github.com/gitlawb/status-page/backend/go/models"
)

type MysqlChecker struct {
	app framework.Application
}

func NewMysqlChecker(app framework.Application) *MysqlChecker {
	return &MysqlChecker{app: app}
}

func (c *MysqlChecker) Check(ctx context.Context, service *models.Service) models.CheckResult {
	result := models.CheckResult{
		Url:          service.Url,
		Status:       "pending",
		ErrorMessage: "",
	}

	start := time.Now()
	result.StartTime = start

	// Obtener connection string de configuración
	dbURL := fmt.Sprintf("%s:%s@/%s", service.Username, service.Password, service.Database)

	var db *sql.DB
	var err error

	if service.UseSSL {
		dbURL = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?sslmode=require", service.Username, service.Password, service.Host, service.Port, service.Database)
	} else {
		dbURL = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", service.Username, service.Password, service.Host, service.Port, service.Database)
	}

	db, err = sql.Open("mysql", dbURL)
	if err != nil {
		result.Status = "error"
		result.ErrorMessage = err.Error()
		result.EndTime = time.Now()
		result.Duration = float64(time.Since(start).Milliseconds())
		return result
	}
	defer db.Close()

	// Intentar query de salud básico
	query := "SELECT 1"
	rows, err := db.QueryContext(ctx, query)
	if err != nil {
		result.Status = "error"
		result.ErrorMessage = fmt.Sprintf("Query error: %s", err.Error())
		result.EndTime = time.Now()
		result.Duration = float64(time.Since(start).Milliseconds())
		return result
	}
	defer rows.Close()

	// Verificar si la consulta devolvió resultados
	if rows.Next() {
		result.Status = "success"
		result.StatusCode = 200
		result.EndTime = time.Now()
		result.Duration = float64(time.Since(start).Milliseconds())
		result.ErrorMessage = ""
		return result
	}

	result.Status = "error"
	result.ErrorMessage = "Query returned no results"
	result.EndTime = time.Now()
	result.Duration = float64(time.Since(start).Milliseconds())
	return result
}

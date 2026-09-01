package checkers

import (
	"context"
	"net/http"
	"time"

	"github.com/goravel/framework"
	"github.com/gitlawb/status-page/backend/models"
)

type HttpChecker struct {
	app framework.Application
}

func NewHttpChecker(app framework.Application) *HttpChecker {
	return &HttpChecker{app: app}
}

func (c *HttpChecker) Check(ctx context.Context, service *models.Service) models.CheckResult {
	result := models.CheckResult{
		Url:          service.Url,
		Status:       "pending",
		ErrorMessage: "",
	}

	start := time.Now()
	result.StartTime = start

	resp, err := http.Get(service.Url)
	if err != nil {
		result.Status = "error"
		result.ErrorMessage = err.Error()
		result.EndTime = time.Now()
		result.Duration = float64(time.Since(start).Milliseconds())
		return result
	}
	defer resp.Body.Close()

	result.Status = "success"
	result.StatusCode = resp.StatusCode
	result.EndTime = time.Now()
	result.Duration = float64(time.Since(start).Milliseconds())
	result.ErrorMessage = ""

	return result
}

func (c *HttpChecker) CheckWithAuth(ctx context.Context, service *models.Service, auth string) models.CheckResult {
	result := models.CheckResult{
		Url:          service.Url,
		Status:       "pending",
		ErrorMessage: "",
	}

	start := time.Now()
	result.StartTime = start

	req, err := http.NewRequestWithContext(ctx, "GET", service.Url, nil)
	if err != nil {
		result.Status = "error"
		result.ErrorMessage = err.Error()
		result.EndTime = time.Now()
		result.Duration = float64(time.Since(start).Milliseconds())
		return result
	}

	if auth != "" {
		req.Header.Set("Authorization", auth)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		result.Status = "error"
		result.ErrorMessage = err.Error()
		result.EndTime = time.Now()
		result.Duration = float64(time.Since(start).Milliseconds())
		return result
	}
	defer resp.Body.Close()

	result.Status = "success"
	result.StatusCode = resp.StatusCode
	result.EndTime = time.Now()
	result.Duration = float64(time.Since(start).Milliseconds())
	result.ErrorMessage = ""

	return result
}

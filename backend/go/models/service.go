package models

import (
	"time"

	"github.com/google/uuid"
)

type Service struct {
	ID          uuid.UUID  `gorm:"type:uuid;primary_key" json:"id"`
	Name        string     `gorm:"size:255" json:"name"`
	Description string     `gorm:"size:255" json:"description"`
	Url         string     `gorm:"size:255" json:"url"`
	ApiUrl      string     `gorm:"size:255" json:"api_url"`
	Type        string     `gorm:"size:50" json:"type"`
	Interval    int        `json:"interval"`
	Active      bool       `json:"active"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	LastStatus  string     `json:"last_status"`
}

func (Service) TableName() string {
	return "services"
}

type CheckResult struct {
	ID           uuid.UUID     `gorm:"type:uuid;primary_key" json:"id"`
	ServiceID    uuid.UUID     `gorm:"type:uuid;not null;index" json:"service_id"`
	Url          string        `gorm:"size:255" json:"url"`
	Status       string        `gorm:"size:50" json:"status"`
	StatusCode   int           `json:"status_code"`
	LastCheckAt  time.Time     `json:"last_check_at"`
	StartTime    time.Time     `json:"start_time"`
	EndTime      time.Time     `json:"end_time"`
	Duration     float64       `json:"duration"`
	ErrorMessage string        `gorm:"size:500" json:"error_message"`
	Metadata     interface{}   `json:"metadata"`
	CreatedAt    time.Time     `json:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at"`
}

func (CheckResult) TableName() string {
	return "check_results"
}

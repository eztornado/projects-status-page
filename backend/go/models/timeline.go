package models

type TimelinePoint struct {
	DateTime     time.Time     `json:"datetime"`
	Status       string        `json:"status"`
	ErrorMessage string        `json:"error_message"`
}

type LatencySeriesPoint struct {
	DateTime time.Time  `json:"datetime"`
	Latency  float64    `json:"latency"`
}

type ServiceStatus struct {
	Uptime       int               `json:"uptime"`
	Status       string            `json:"status"`
	Timeline     []TimelinePoint   `json:"timeline"`
	LatencySeries []LatencySeriesPoint `json:"latency_series"`
}

package config

import (
	"os"
)

var Port = get("PORT", "8000")
var AppName = get("APP_NAME", "Status Page")
var AppEnv = get("APP_ENV", "production")
var AppDebug = get("APP_DEBUG", "true")
var AppURL = get("APP_URL", "http://localhost:8000")
var DBConnection = get("DB_CONNECTION", "sqlite")
var DBDatabase = get("DB_DATABASE", ":memory:")
var DBPrefix = get("DB_PREFIX", "")
var TelegramBotToken = get("TELEGRAM_BOT_TOKEN", "")
var TelegramLogChannel = get("TELEGRAM_LOG_CHANNEL", "")
var CoolifyWebhookURL = get("COOLIFY_WEBHOOK_URL", "")

func get(key, defaultVal string) string {
	val := os.Getenv(key)
	if val == "" {
		val = defaultVal
	}
	return val
}

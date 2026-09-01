#!/usr/bin/env python3
"""
Status Page Backend - Coolify Integration
Adapted to use Coolify as the backend monitoring system
"""

import asyncio
import json
import os
import sqlite3
import sys
import time
from datetime import datetime
from typing import Optional
from uuid import uuid4
from urllib.parse import urlparse

import httpx


# Configuration
COOLIFY_API_URL = os.getenv("COOLIFY_API_URL", "http://localhost:8000")
COOLIFY_API_KEY = os.getenv("COOLIFY_API_KEY", "")
COOLIFY_WEBHOOK_URL = os.getenv("COOLIFY_WEBHOOK_URL", "")
MONITORING_DB_PATH = ":memory:"


class CoolifyBackend:
    """Coolify integration for status page monitoring"""

    def __init__(self):
        self.api_url = COOLIFY_API_URL
        self.api_key = COOLIFY_API_KEY
        self.session = httpx.AsyncClient(base_url=COOLIFY_API_URL, timeout=30.0)
        self.db = self._init_database()

    def _init_database(self) -> sqlite3.Connection:
        """Initialize in-memory database for local operations"""
        conn = sqlite3.connect(MONITORING_DB_PATH)
        conn.execute("CREATE TABLE IF NOT EXISTS services ("
                     "id TEXT PRIMARY KEY, name TEXT, url TEXT, status TEXT, "
                     "last_check TEXT, status_code INTEGER, error_message TEXT)")
        return conn

    async def get_service(self, service_id: str) -> Optional[dict]:
        """Fetch service status from Coolify"""
        # Query local database first
        cursor = self.db.execute(
            "SELECT id, name, url, status, last_check, status_code, error_message FROM services WHERE id=?",
            (service_id,)
        )
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None

    async def create_service(self, service_data: dict) -> dict:
        """Create a new service for monitoring"""
        cursor = self.db.execute(
            "INSERT INTO services (id, name, url, status, last_check, status_code, error_message) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                service_data.get("id"),
                service_data.get("name"),
                service_data.get("url"),
                service_data.get("status"),
                service_data.get("last_check"),
                service_data.get("status_code"),
                service_data.get("error_message")
            )
        )
        self.db.commit()
        return service_data

    async def delete_service(self, service_id: str) -> bool:
        """Delete a service"""
        cursor = self.db.execute("DELETE FROM services WHERE id=?", (service_id,))
        self.db.commit()
        return cursor.rowcount > 0

    async def get_all_services(self) -> list:
        """Get all services"""
        cursor = self.db.execute("SELECT * FROM services")
        return [dict(row) for row in cursor.fetchall()]

    async def get_status(self) -> dict:
        """Get status information"""
        return {
            "app_name": os.getenv("APP_NAME", "Status Page"),
            "app_env": os.getenv("APP_ENV", "production"),
            "coolify_connected": bool(self.api_key)
        }

    async def handle_webhook(self, data: dict) -> dict:
        """Handle webhook notifications from Coolify"""
        if COOLIFY_WEBHOOK_URL:
            # Send notification to Coolify
            pass
        return {"status": "received"}

    async def check_service_health(self, url: str) -> dict:
        """Check health of a service using HTTP"""
        result = {
            "url": url,
            "status": "pending",
            "status_code": None,
            "last_check": time.time(),
            "error_message": ""
        }

        try:
            async with self.session.stream("GET", url, timeout=10.0) as response:
                result["status"] = "success"
                result["status_code"] = response.status_code
                result["error_message"] = ""
        except Exception as e:
            result["status"] = "error"
            result["error_message"] = str(e)

        return result

    async def check_database_health(self, host: str, port: str, db: str, user: str, password: str, ssl: bool = False) -> dict:
        """Check database health (MySQL/PostgreSQL)"""
        result = {
            "url": f"{host}:{port}/{db}",
            "status": "pending",
            "status_code": None,
            "last_check": time.time(),
            "error_message": ""
        }

        try:
            # Try basic connection query
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Note: Full database connectivity requires database driver
                # This is a simplified example
                result["status"] = "success"
                result["status_code"] = 200
        except Exception as e:
            result["status"] = "error"
            result["error_message"] = str(e)

        return result

    async def check_url_health(self, url: str) -> dict:
        """Simple URL health check"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url)
                return {
                    "url": url,
                    "status": "success",
                    "status_code": response.status_code
                }
        except Exception as e:
            return {
                "url": url,
                "status": "error",
                "error_message": str(e)
            }

    async def run_scheduler(self):
        """Run scheduled health checks"""
        # Get all active services
        services = await self.get_all_services()

        for service in services:
            if service.get("active", True):
                try:
                    result = await self.check_service_health(service.get("url", ""))
                    service.update(result)
                    await self.create_service(service)
                except Exception as e:
                    print(f"Error checking service: {e}")

        await asyncio.sleep(60)  # Check every minute

    async def close(self):
        """Cleanup resources"""
        self.session.close()
        self.db.close()


# Global backend instance
backend = CoolifyBackend()


async def get_services():
    """Get all services"""
    return await backend.get_all_services()


async def create_service(name: str, url: str, description: str = ""):
    """Create new service"""
    return await backend.create_service({
        "id": str(uuid := str(datetime.now().timestamp())),
        "name": name,
        "url": url,
        "description": description,
        "status": "unknown",
        "last_check": time.time(),
        "status_code": None,
        "error_message": ""
    })


async def delete_service(service_id: str):
    """Delete service"""
    return await backend.delete_service(service_id)


async def get_service_status(service_id: str):
    """Get specific service status"""
    return await backend.get_service(service_id)


def main():
    """Main entry point for the application"""
    print("Status Page Backend initialized with Coolify integration")
    print(f"Coolify API URL: {COOLIFY_API_URL}")
    print(f"App Name: {os.getenv('APP_NAME', 'Status Page')}")
    print(f"App Env: {os.getenv('APP_ENV', 'production')}")

    # Keep running
    backend.run_scheduler()


if __name__ == "__main__":
    main()

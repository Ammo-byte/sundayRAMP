"""
demo_data.py — Pre-canned data returned for demo-mode users.
"""
from __future__ import annotations

from datetime import date

_TODAY = date.today().strftime("%A, %B %-d")

DEMO_STATUS = {
    "ready": True,
    "llm_provider": "groq",
    "llm_model": "llama-3.1-8b-instant",
    "telegram_configured": False,
    "imessage_enabled": True,
    "maps_configured": True,
    "expo_push_enabled": False,
    "google_connected": True,
    "errors": [],
    "warnings": [],
}

DEMO_EVENTS = {
    "date": _TODAY,
    "events": [
        {
            "id": "demo-evt-1",
            "summary": "Team Standup",
            "start": {"dateTime": f"{date.today().isoformat()}T10:00:00"},
            "end":   {"dateTime": f"{date.today().isoformat()}T10:30:00"},
            "location": "Google Meet",
            "hangoutLink": "https://meet.google.com/demo",
        },
        {
            "id": "demo-evt-2",
            "summary": "Lunch with Sarah",
            "start": {"dateTime": f"{date.today().isoformat()}T12:30:00"},
            "end":   {"dateTime": f"{date.today().isoformat()}T13:30:00"},
            "location": "Terroni, 57 Adelaide St W",
        },
        {
            "id": "demo-evt-3",
            "summary": "Dentist",
            "start": {"dateTime": f"{date.today().isoformat()}T16:00:00"},
            "end":   {"dateTime": f"{date.today().isoformat()}T17:00:00"},
            "location": "123 King St W, Toronto",
        },
    ],
    "travel": [
        {
            "event_id": "demo-evt-1",
            "origin": "Home",
            "destination": "Google Meet",
            "duration_minutes": 0,
            "leave_by": f"{date.today().isoformat()}T09:55:00",
            "mode": "online",
        },
        {
            "event_id": "demo-evt-2",
            "origin": "Home",
            "destination": "Terroni, 57 Adelaide St W",
            "duration_minutes": 18,
            "leave_by": f"{date.today().isoformat()}T12:07:00",
            "mode": "driving",
        },
        {
            "event_id": "demo-evt-3",
            "origin": "Terroni, 57 Adelaide St W",
            "destination": "123 King St W",
            "duration_minutes": 12,
            "leave_by": f"{date.today().isoformat()}T15:43:00",
            "mode": "driving",
        },
    ],
}

# These are seeded into the app's local storage on demo login
DEMO_ALERT_ENTRIES = [
    {
        "id": "demo-alert-1",
        "transcript": "",
        "summary": "Team standup moved to 10 AM tomorrow — Sarah confirmed the time change",
        "createdAt": f"{date.today().isoformat()}T09:15:00.000Z",
        "status": "complete",
        "audioUri": None,
    },
    {
        "id": "demo-alert-2",
        "transcript": "",
        "summary": "Invoice #INV-2847 from Stripe — $240 due April 10th, auto-pay is on",
        "createdAt": f"{date.today().isoformat()}T08:30:00.000Z",
        "status": "complete",
        "audioUri": None,
    },
    {
        "id": "demo-alert-3",
        "transcript": "",
        "summary": "Your AirPods Pro shipped — arriving Wednesday via FedEx, tracking #794644782519",
        "createdAt": f"{date.today().isoformat()}T07:45:00.000Z",
        "status": "complete",
        "audioUri": None,
    },
]

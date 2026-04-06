"""
demo_data.py — Pre-canned data returned for demo-mode users.
"""
from __future__ import annotations

from datetime import date

_TODAY = date.today().strftime("%A, %B %-d")
_TODAY_ISO = date.today().isoformat()

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
            "id": "demo-evt-voice-created",
            "summary": "Product review with Sarah",
            "start": {"dateTime": f"{_TODAY_ISO}T14:00:00"},
            "end":   {"dateTime": f"{_TODAY_ISO}T15:00:00"},
            "location": "Shopify Toronto, 620 King St W",
        },
        {
            "id": "demo-evt-2",
            "summary": "Team Standup",
            "start": {"dateTime": f"{_TODAY_ISO}T11:00:00"},
            "end":   {"dateTime": f"{_TODAY_ISO}T11:30:00"},
            "location": "Google Meet",
            "hangoutLink": "https://meet.google.com/demo",
        },
        {
            "id": "demo-evt-3",
            "summary": "Dentist",
            "start": {"dateTime": f"{_TODAY_ISO}T16:00:00"},
            "end":   {"dateTime": f"{_TODAY_ISO}T17:00:00"},
            "location": "123 King St W, Toronto",
        },
        {
            "id": "demo-evt-4",
            "summary": "Gym session",
            "start": {"dateTime": f"{_TODAY_ISO}T18:15:00"},
            "end":   {"dateTime": f"{_TODAY_ISO}T19:15:00"},
            "location": "Equinox Yorkville, Toronto",
        },
        {
            "id": "demo-evt-5",
            "summary": "Movie night with Maya and Chris",
            "start": {"dateTime": f"{_TODAY_ISO}T20:30:00"},
            "end":   {"dateTime": f"{_TODAY_ISO}T22:45:00"},
            "location": "TIFF Lightbox, Toronto",
        },
    ],
    "travel": [
        {
            "event_id": "demo-evt-voice-created",
            "origin": "Home",
            "destination": "Shopify Toronto, 620 King St W",
            "duration_minutes": 18,
            "leave_by": f"{_TODAY_ISO}T13:32:00",
            "mode": "transit",
        },
        {
            "event_id": "demo-evt-2",
            "origin": "Home",
            "destination": "Google Meet",
            "duration_minutes": 0,
            "leave_by": f"{_TODAY_ISO}T10:55:00",
            "mode": "online",
        },
        {
            "event_id": "demo-evt-3",
            "origin": "Home",
            "destination": "123 King St W, Toronto",
            "duration_minutes": 22,
            "leave_by": f"{_TODAY_ISO}T15:33:00",
            "mode": "transit",
        },
        {
            "event_id": "demo-evt-4",
            "origin": "123 King St W, Toronto",
            "destination": "Equinox Yorkville, Toronto",
            "duration_minutes": 16,
            "leave_by": f"{_TODAY_ISO}T17:57:00",
            "mode": "walking",
        },
        {
            "event_id": "demo-evt-5",
            "origin": "Equinox Yorkville, Toronto",
            "destination": "TIFF Lightbox, Toronto",
            "duration_minutes": 12,
            "leave_by": f"{_TODAY_ISO}T20:08:00",
            "mode": "transit",
        },
    ],
}

# These are seeded into the app's local storage on demo login
DEMO_ALERT_ENTRIES = [
    {
        "id": "demo-alert-voice-calendar",
        "transcript": (
            "Hey, schedule a product review with Sarah for today at 2 PM at Shopify Toronto, "
            "remind me at noon to bring the Q2 deck, and text her that I'll bring printed notes."
        ),
        "summary": "Voice note: booked product review for 2 PM",
        "createdAt": f"{_TODAY_ISO}T09:15:00.000Z",
        "status": "complete",
        "audioUri": None,
        "actions": [
            {
                "type": "calendar_event",
                "title": "Product review with Sarah",
                "date": _TODAY_ISO,
                "start_time": "14:00",
                "end_time": "15:00",
                "location": "Shopify Toronto, 620 King St W",
                "is_online": False,
                "description": "Created from a voice note and added to Google Calendar automatically.",
                "executed": True,
                "conflict": False,
                "conflict_with": None,
            },
            {
                "type": "reminder",
                "task": "Bring the Q2 deck",
                "deadline": _TODAY_ISO,
                "priority": "high",
                "executed": True,
            },
            {
                "type": "preparation",
                "topic": "Product review with Sarah",
                "suggestion": "Bring the Q2 deck and printed notes so the meeting can turn straight into decisions.",
            },
            {
                "type": "send_message",
                "recipient_name": "Sarah",
                "message": "Booked for 2 PM today at Shopify Toronto. I'll bring printed notes.",
                "phone": "+14165550123",
                "executed": True,
            },
        ],
    },
    {
        "id": "demo-alert-2",
        "transcript": "",
        "summary": "Team standup is ready — Meet link, attendees, and today’s agenda are all attached",
        "createdAt": f"{_TODAY_ISO}T08:30:00.000Z",
        "status": "complete",
        "audioUri": None,
    },
    {
        "id": "demo-alert-3",
        "transcript": "",
        "summary": "Dentist at 4 PM — leave by 3:33, insurance card packed, forms already done",
        "createdAt": f"{_TODAY_ISO}T07:45:00.000Z",
        "status": "complete",
        "audioUri": None,
    },
    {
        "id": "demo-alert-4",
        "transcript": "",
        "summary": "Gym session at 6:15 PM — shoes, lock, and protein bar reminder is ready",
        "createdAt": f"{_TODAY_ISO}T07:10:00.000Z",
        "status": "complete",
        "audioUri": None,
    },
    {
        "id": "demo-alert-5",
        "transcript": "",
        "summary": "Movie night tickets are booked for 8:30 PM — seats shared with Maya and Chris",
        "createdAt": f"{_TODAY_ISO}T06:40:00.000Z",
        "status": "complete",
        "audioUri": None,
    },
]

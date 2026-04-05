"""
openclaw.py — Notify the local OpenClaw agent with actionable context.

Sunday processes raw inputs (emails, voice notes) and pushes structured
action items to the OpenClaw webhook so the agent can decide what to do next.

Failures are always silent — OpenClaw being down never disrupts Sunday's core flow.
"""
from __future__ import annotations

import logging

import httpx

from .config import Config

log = logging.getLogger(__name__)

_WAKE_PATH = "/hooks/wake"
_TIMEOUT = 5.0


def _build_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {Config.openclaw_token}"}


async def _post(text: str) -> None:
    """POST a wake event to the OpenClaw gateway."""
    base_url = Config.openclaw_base_url.rstrip("/")
    url = f"{base_url}{_WAKE_PATH}"
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            resp = await client.post(
                url,
                json={"text": text, "mode": "now"},
                headers=_build_headers(),
            )
            resp.raise_for_status()
            log.info("OpenClaw notified (%s)", resp.status_code)
    except Exception as exc:
        log.warning("OpenClaw notification failed (non-fatal): %s", exc)


def _is_enabled() -> bool:
    return bool(Config.openclaw_enabled and Config.openclaw_base_url and Config.openclaw_token)


async def notify_email_event(parsed: dict, subject: str) -> None:
    """
    Send a processed email's action items to OpenClaw.

    Called after Sunday parses an email so the agent knows what needs doing.
    """
    if not _is_enabled():
        return

    summary = parsed.get("summary") or ""
    action_items: list[str] = parsed.get("action_items") or []
    urgency = parsed.get("urgency") or "normal"
    has_event = parsed.get("has_event", False)
    needs_response = parsed.get("needs_response", False)

    lines = [f'Sunday processed email: "{subject}"']

    if summary:
        lines.append(f"Summary: {summary}")

    if has_event:
        event = parsed.get("event") or {}
        event_title = event.get("title", "")
        event_date = event.get("date", "")
        event_time = event.get("start_time", "")
        location = event.get("location", "")
        parts = [p for p in [event_title, event_date, event_time, location] if p]
        lines.append(f"Calendar event: {' · '.join(parts)}")

    if needs_response:
        lines.append("Needs reply: yes")

    if urgency and urgency != "normal":
        lines.append(f"Urgency: {urgency}")

    if action_items:
        lines.append("Action items:")
        for item in action_items:
            lines.append(f"  • {item}")

    await _post("\n".join(lines))


async def notify_voice_note(transcript: str, summary: str) -> None:
    """
    Send a transcribed voice note to OpenClaw.

    Called after Sunday transcribes an app recording so the agent
    can pick out action items or follow-ups from the note.
    """
    if not _is_enabled():
        return

    lines = [f'Sunday: voice note recorded — "{summary}"' if summary else "Sunday: voice note recorded"]
    lines.append(f"Transcript: {transcript}")
    lines.append("Please extract any action items or follow-ups from this note.")

    await _post("\n".join(lines))

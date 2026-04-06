"""
database.py — SQLite user store for multi-user auth.
"""
from __future__ import annotations

import sqlite3
import uuid
from pathlib import Path

from .config import PROJECT_ROOT

DB_PATH = PROJECT_ROOT / ".state" / "sunday.db"
DEMO_USER_ID = "demo-user"


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id       TEXT PRIMARY KEY,
                email    TEXT UNIQUE,
                password TEXT,
                is_demo  INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
        """)
        # Seed the demo user (idempotent)
        conn.execute(
            "INSERT OR IGNORE INTO users (id, email, is_demo) VALUES (?, ?, 1)",
            (DEMO_USER_ID, "demo@sunday.app"),
        )


def create_user(email: str, password_hash: str) -> str:
    user_id = str(uuid.uuid4())
    with _connect() as conn:
        conn.execute(
            "INSERT INTO users (id, email, password) VALUES (?, ?, ?)",
            (user_id, email.lower().strip(), password_hash),
        )
    return user_id


def get_user_by_email(email: str) -> sqlite3.Row | None:
    with _connect() as conn:
        return conn.execute(
            "SELECT * FROM users WHERE email = ?", (email.lower().strip(),)
        ).fetchone()


def get_user_by_id(user_id: str) -> sqlite3.Row | None:
    with _connect() as conn:
        return conn.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        ).fetchone()

"""In-process SQLite store for saved leads.

Single-table key/value store keyed by `crustdata_person_id`. The full
`PersonCard` payload is stored as a JSON blob so the schema doesn't have
to track every Crustdata field individually. Suitable for a single-process
deployment; not safe for horizontal scaling.
"""

from __future__ import annotations

import json
import sqlite3
import threading
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent.parent.parent / "crustpilot.db"

_lock = threading.Lock()
_initialized = False


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, isolation_level=None, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def _ensure_schema() -> None:
    global _initialized
    if _initialized:
        return
    with _lock:
        if _initialized:
            return
        with _connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS saved_leads (
                    crustdata_person_id INTEGER PRIMARY KEY,
                    payload TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
        _initialized = True


def list_leads() -> list[dict[str, Any]]:
    _ensure_schema()
    with _connect() as conn:
        rows = conn.execute(
            "SELECT payload FROM saved_leads ORDER BY created_at DESC;"
        ).fetchall()
    return [json.loads(row["payload"]) for row in rows]


def save_lead(person: dict[str, Any]) -> dict[str, Any]:
    _ensure_schema()
    person_id = person.get("crustdata_person_id")
    if person_id is None:
        raise ValueError(
            "Cannot save a lead without a crustdata_person_id. "
            "Only profiles with a stable person id are persistable."
        )
    payload = json.dumps(person)
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO saved_leads (crustdata_person_id, payload)
            VALUES (?, ?)
            ON CONFLICT(crustdata_person_id) DO UPDATE SET
                payload = excluded.payload,
                updated_at = CURRENT_TIMESTAMP;
            """,
            (person_id, payload),
        )
    return person


def delete_lead(person_id: int) -> bool:
    _ensure_schema()
    with _connect() as conn:
        cursor = conn.execute(
            "DELETE FROM saved_leads WHERE crustdata_person_id = ?;",
            (person_id,),
        )
        return cursor.rowcount > 0

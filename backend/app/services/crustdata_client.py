from __future__ import annotations

from typing import Any

import httpx

from app.core.config import get_settings


class CrustdataAPIError(Exception):
    def __init__(
        self, *, status_code: int, message: str, details: dict[str, Any] | None = None
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.details = details or {}


class CrustdataClient:
    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def headers(self) -> dict[str, str]:
        return {
            "authorization": f"Bearer {self.settings.crustdata_api_key}",
            "content-type": "application/json",
            "x-api-version": self.settings.crustdata_api_version,
        }

    async def search_people(self, payload: dict[str, Any]) -> dict[str, Any]:
        url = f"{self.settings.crustdata_api_base_url}/person/search"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=self.headers, json=payload)

        if response.status_code >= 400:
            try:
                error_payload = response.json()
            except ValueError:
                error_payload = {"message": response.text}

            message = (
                error_payload.get("error", {}).get("message")
                or error_payload.get("message")
                or "Crustdata request failed."
            )
            raise CrustdataAPIError(
                status_code=response.status_code,
                message=message,
                details=error_payload,
            )

        return response.json()

from __future__ import annotations

import os
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "CrustPilot Search API"
    app_env: str = "development"
    openai_api_key: str = Field(..., alias="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-5-mini", alias="OPENAI_MODEL")
    crustdata_api_key: str = Field(..., alias="CRUSTDATA_API_KEY")
    crustdata_api_base_url: str = Field(
        default="https://api.crustdata.com", alias="CRUSTDATA_API_BASE_URL"
    )
    crustdata_api_version: str = Field(
        default="2025-11-01", alias="CRUSTDATA_API_VERSION"
    )
    frontend_origin: str = Field(
        default="http://localhost:3000", alias="FRONTEND_ORIGIN"
    )

    @property
    def cors_origins(self) -> list[str]:
        origins = [
            origin.strip()
            for origin in self.frontend_origin.split(",")
            if origin.strip()
        ]
        return origins or ["http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    os.environ.setdefault("OPENAI_API_KEY", settings.openai_api_key)
    os.environ.setdefault("CRUSTDATA_API_KEY", settings.crustdata_api_key)
    return settings

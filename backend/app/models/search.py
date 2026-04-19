from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=4000)


class PeopleSearchRequest(BaseModel):
    prompt: str | None = Field(default=None, min_length=3, max_length=2000)
    messages: list[ChatMessage] = Field(default_factory=list)
    limit: int = Field(default=10, ge=1, le=25)
    cursor: str | None = None


class NormalizedSearchIntent(BaseModel):
    original_prompt: str
    companies: list[str] = Field(default_factory=list)
    titles: list[str] = Field(default_factory=list)
    locations: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    schools: list[str] = Field(default_factory=list)
    seniorities: list[str] = Field(default_factory=list)
    exclude_titles: list[str] = Field(default_factory=list)
    exclude_companies: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    sort_by_connections: bool = True


class AppliedFilter(BaseModel):
    field: str
    operator: str
    value: Any


class PersonCard(BaseModel):
    crustdata_person_id: int | None = None
    name: str
    headline: str | None = None
    summary: str | None = None
    location: str | None = None
    current_title: str | None = None
    current_company: str | None = None
    profile_url: str | None = None
    connections: int | None = None
    skills: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    current_experience: list[dict[str, Any]] = Field(default_factory=list)
    past_experience: list[dict[str, Any]] = Field(default_factory=list)
    education: list[dict[str, Any]] = Field(default_factory=list)
    contact: dict[str, Any] = Field(default_factory=dict)
    social_profiles: dict[str, Any] = Field(default_factory=dict)
    raw_profile: dict[str, Any] = Field(default_factory=dict)


class PeopleSearchResponse(BaseModel):
    assistant_message: str | None = None
    search_intent_summary: str
    interpreted_request: NormalizedSearchIntent
    applied_filters: list[AppliedFilter] = Field(default_factory=list)
    crustdata_payload: dict[str, Any]
    results: list[PersonCard] = Field(default_factory=list)
    total_count: int = 0
    next_cursor: str | None = None
    reasoning_summary: str | None = None

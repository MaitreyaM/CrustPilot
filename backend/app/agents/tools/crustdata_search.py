from __future__ import annotations

from typing import Any

from agents import RunContextWrapper, function_tool

from app.agents.guardrails.search_guardrails import (
    redact_sensitive_tool_output,
    validate_search_tool_input,
)
from app.models.search import NormalizedSearchIntent, PeopleSearchResponse, PersonCard
from app.services.crustdata_client import CrustdataClient
from app.services.filter_mapper import build_crustdata_payload


def _tool_error_message(
    context: RunContextWrapper[Any], error: Exception
) -> str:
    del context
    return f"Crustdata search tool failed: {error}"


def _map_profiles(profiles: list[dict[str, Any]]) -> list[PersonCard]:
    results: list[PersonCard] = []
    for profile in profiles:
        current_roles = (
            profile.get("experience", {})
            .get("employment_details", {})
            .get("current", [])
        )
        current_role = current_roles[0] if current_roles else {}
        location = (
            profile.get("basic_profile", {})
            .get("location", {})
            .get("full_location")
        )
        profile_url = (
            profile.get("social_handles", {})
            .get("professional_network_identifier", {})
            .get("profile_url")
        )

        results.append(
            PersonCard(
                crustdata_person_id=profile.get("crustdata_person_id"),
                name=profile.get("basic_profile", {}).get("name", "Unknown"),
                headline=profile.get("basic_profile", {}).get("headline"),
                location=location,
                current_title=current_role.get("title"),
                current_company=current_role.get("company_name"),
                profile_url=profile_url,
            )
        )
    return results


@function_tool(
    failure_error_function=_tool_error_message,
    tool_input_guardrails=[validate_search_tool_input],
    tool_output_guardrails=[redact_sensitive_tool_output],
)
async def search_people_crustdata(
    original_prompt: str,
    companies: list[str] | None = None,
    titles: list[str] | None = None,
    locations: list[str] | None = None,
    skills: list[str] | None = None,
    schools: list[str] | None = None,
    seniorities: list[str] | None = None,
    exclude_titles: list[str] | None = None,
    exclude_companies: list[str] | None = None,
    keywords: list[str] | None = None,
    sort_by_connections: bool = True,
    limit: int = 10,
    cursor: str | None = None,
) -> str:
    """Run a validated Crustdata people search and return compact JSON results.

    Use this tool exactly once for a search request after converting the prompt
    into normalized search fields.
    """

    intent = NormalizedSearchIntent(
        original_prompt=original_prompt,
        companies=companies or [],
        titles=titles or [],
        locations=locations or [],
        skills=skills or [],
        schools=schools or [],
        seniorities=seniorities or [],
        exclude_titles=exclude_titles or [],
        exclude_companies=exclude_companies or [],
        keywords=keywords or [],
        sort_by_connections=sort_by_connections,
    )

    payload, applied_filters = build_crustdata_payload(
        intent, limit=limit, cursor=cursor
    )

    client = CrustdataClient()
    raw_response = await client.search_people(payload)
    results = _map_profiles(raw_response.get("profiles", []))

    response = PeopleSearchResponse(
        search_intent_summary="Crustdata people search executed from normalized prompt intent.",
        interpreted_request=intent,
        applied_filters=applied_filters,
        crustdata_payload=payload,
        results=results,
        total_count=raw_response.get("total_count", 0),
        next_cursor=raw_response.get("next_cursor"),
        reasoning_summary=(
            "Used the strict Crustdata tool with validated fields and stable sorts."
        ),
    )
    return response.model_dump_json()

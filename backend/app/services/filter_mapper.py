from __future__ import annotations

from typing import Any

from app.models.search import AppliedFilter, NormalizedSearchIntent


DEFAULT_FIELDS = [
    "basic_profile.name",
    "basic_profile.headline",
    "basic_profile.summary",
    "basic_profile.languages",
    "basic_profile.location.full_location",
    "experience.employment_details.current",
    "experience.employment_details.past",
    "education.schools",
    "skills.professional_network_skills",
    "contact.has_business_email",
    "contact.has_personal_email",
    "contact.has_phone_number",
    "social_handles.professional_network_identifier.profile_url",
    "social_handles.twitter_identifier.slug",
    "social_handles.dev_platform_identifier.profile_url",
    "professional_network.connections",
]


def _contains_condition(field: str, values: list[str]) -> tuple[dict[str, Any], AppliedFilter] | None:
    cleaned = [value.strip() for value in values if value.strip()]
    if not cleaned:
        return None

    if len(cleaned) == 1:
        value: str | list[str] = cleaned[0]
    else:
        value = "|".join(cleaned)

    condition = {"field": field, "type": "(.)", "value": value}
    return condition, AppliedFilter(field=field, operator="(.)", value=value)


def _list_condition(field: str, operator: str, values: list[str]) -> tuple[dict[str, Any], AppliedFilter] | None:
    cleaned = [value.strip() for value in values if value.strip()]
    if not cleaned:
        return None

    value: str | list[str]
    if operator == "=" and len(cleaned) == 1:
        value = cleaned[0]
    else:
        operator = "in" if operator == "=" else operator
        value = cleaned

    condition = {"field": field, "type": operator, "value": value}
    return condition, AppliedFilter(field=field, operator=operator, value=value)


def build_crustdata_payload(
    intent: NormalizedSearchIntent, *, limit: int, cursor: str | None
) -> tuple[dict[str, Any], list[AppliedFilter]]:
    conditions: list[dict[str, Any]] = []
    applied_filters: list[AppliedFilter] = []

    mappings = [
        _list_condition(
            "experience.employment_details.current.company_name", "=", intent.companies
        ),
        _contains_condition("experience.employment_details.current.title", intent.titles),
        _contains_condition("basic_profile.location.full_location", intent.locations),
        _contains_condition("skills.professional_network_skills", intent.skills),
        _contains_condition("education.schools.school", intent.schools),
        _contains_condition(
            "experience.employment_details.current.seniority_level", intent.seniorities
        ),
        _contains_condition("basic_profile.headline", intent.keywords),
        _list_condition(
            "experience.employment_details.title", "not_in", intent.exclude_titles
        ),
        _list_condition(
            "experience.employment_details.company_name",
            "not_in",
            intent.exclude_companies,
        ),
    ]

    for mapping in mappings:
        if mapping is None:
            continue
        condition, applied_filter = mapping
        conditions.append(condition)
        applied_filters.append(applied_filter)

    filters: dict[str, Any]
    if not conditions:
        filters = {
            "field": "basic_profile.headline",
            "type": "(.)",
            "value": ".*",
        }
        applied_filters.append(
            AppliedFilter(
                field="basic_profile.headline",
                operator="(.)",
                value=".*",
            )
        )
    elif len(conditions) == 1:
        filters = conditions[0]
    else:
        filters = {"op": "and", "conditions": conditions}

    sorts = [{"field": "crustdata_person_id", "order": "asc"}]
    if intent.sort_by_connections:
        sorts = [
            {"field": "professional_network.connections", "order": "desc"},
            {"field": "crustdata_person_id", "order": "asc"},
        ]

    payload: dict[str, Any] = {
        "filters": filters,
        "fields": DEFAULT_FIELDS,
        "sorts": sorts,
        "limit": limit,
    }
    if cursor:
        payload["cursor"] = cursor

    return payload, applied_filters

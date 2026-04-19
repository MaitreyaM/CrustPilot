from __future__ import annotations

from agents import Agent

from app.agents.guardrails.search_guardrails import validate_people_search_prompt
from app.agents.tools.crustdata_search import search_people_crustdata
from app.core.config import get_settings
from app.models.search import PeopleSearchResponse


def build_people_search_agent() -> Agent:
    settings = get_settings()

    return Agent(
        name="People Search Specialist",
        model=settings.openai_model,
        instructions=(
            "You are a people search specialist for a prompt-driven search product. "
            "Your only job is to interpret the user's search request into normalized "
            "people-search criteria and use the Crustdata search tool. "
            "Always stay within people search. Do not invent unsupported Crustdata "
            "fields or operators. "
            "If the prompt is ambiguous, make a reasonable best effort and explain "
            "your assumptions briefly in reasoning_summary. "
            "Use the tool exactly once for a typical search request, then return a "
            "final response that matches the required output schema."
        ),
        tools=[search_people_crustdata],
        input_guardrails=[validate_people_search_prompt],
        output_type=PeopleSearchResponse,
    )

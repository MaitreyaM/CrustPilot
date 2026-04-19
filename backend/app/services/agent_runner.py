from __future__ import annotations

from agents import Runner
from agents.exceptions import InputGuardrailTripwireTriggered

from app.agents.people_search_agent import build_people_search_agent
from app.models.search import PeopleSearchRequest, PeopleSearchResponse


class AgentExecutionError(Exception):
    pass


class AgentValidationError(Exception):
    pass


async def run_people_search(request: PeopleSearchRequest) -> PeopleSearchResponse:
    agent = build_people_search_agent()
    prompt = (
        "Run a people search for this request.\n"
        f"Prompt: {request.prompt}\n"
        f"Limit: {request.limit}\n"
        f"Cursor: {request.cursor or 'none'}\n\n"
        "Interpret the prompt into structured search criteria, use the Crustdata "
        "tool once, and return the typed search response."
    )

    try:
        result = await Runner.run(agent, prompt)
    except InputGuardrailTripwireTriggered as exc:
        raise AgentValidationError("Prompt failed validation guardrails.") from exc
    except Exception as exc:  # noqa: BLE001
        raise AgentExecutionError("Agent run failed.") from exc

    if not isinstance(result.final_output, PeopleSearchResponse):
        raise AgentExecutionError("Agent returned an unexpected response type.")

    return result.final_output

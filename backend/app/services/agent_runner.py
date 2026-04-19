from __future__ import annotations

from agents import Runner
from agents.exceptions import InputGuardrailTripwireTriggered

from app.agents.people_search_agent import build_people_search_agent
from app.models.search import ChatMessage, PeopleSearchRequest, PeopleSearchResponse


class AgentExecutionError(Exception):
    pass


class AgentValidationError(Exception):
    pass


def _messages_to_transcript(messages: list[ChatMessage]) -> str:
    transcript_lines: list[str] = []
    for message in messages:
        speaker = "User" if message.role == "user" else "Assistant"
        transcript_lines.append(f"{speaker}: {message.content}")
    return "\n".join(transcript_lines)


async def run_people_search(request: PeopleSearchRequest) -> PeopleSearchResponse:
    agent = build_people_search_agent()
    if request.messages:
        latest_user_message = next(
            (message.content for message in reversed(request.messages) if message.role == "user"),
            request.prompt or "",
        )
        transcript = _messages_to_transcript(request.messages)
    else:
        latest_user_message = request.prompt or ""
        transcript = latest_user_message

    prompt = (
        "Run a people search for this conversational request.\n"
        f"Latest user message: {latest_user_message}\n"
        f"Conversation transcript:\n{transcript}\n\n"
        f"Limit: {request.limit}\n"
        f"Cursor: {request.cursor or 'none'}\n\n"
        "Interpret the prompt into structured search criteria, use the Crustdata "
        "tool once, and return the typed search response. "
        "Set assistant_message to a natural follow-up that matches a conversational UI."
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

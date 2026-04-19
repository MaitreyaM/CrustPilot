from __future__ import annotations

import json

from pydantic import BaseModel

from agents import (
    Agent,
    GuardrailFunctionOutput,
    RunContextWrapper,
    TResponseInputItem,
    ToolGuardrailFunctionOutput,
    input_guardrail,
    tool_input_guardrail,
    tool_output_guardrail,
)


class SearchPromptCheck(BaseModel):
    is_valid: bool
    reasoning: str


@input_guardrail
async def validate_people_search_prompt(
    ctx: RunContextWrapper[None],
    agent: Agent,
    input: str | list[TResponseInputItem],
) -> GuardrailFunctionOutput:
    del ctx, agent
    prompt = input if isinstance(input, str) else json.dumps(input)
    prompt = prompt.strip()

    is_valid = 3 <= len(prompt) <= 2000
    reasoning = "Prompt accepted."
    if len(prompt) < 3:
        reasoning = "Prompt is too short to interpret into search filters."
    elif len(prompt) > 2000:
        reasoning = "Prompt is too long for the initial search scaffold."

    return GuardrailFunctionOutput(
        output_info=SearchPromptCheck(is_valid=is_valid, reasoning=reasoning),
        tripwire_triggered=not is_valid,
    )


@tool_input_guardrail
def validate_search_tool_input(data) -> ToolGuardrailFunctionOutput:
    args = json.loads(data.context.tool_arguments or "{}")
    limit = args.get("limit", 10)

    if limit > 25:
        return ToolGuardrailFunctionOutput.reject_content(
            "Search limit must be 25 or fewer results."
        )

    return ToolGuardrailFunctionOutput.allow()


@tool_output_guardrail
def redact_sensitive_tool_output(data) -> ToolGuardrailFunctionOutput:
    output_text = str(data.output or "")
    if "sk-" in output_text:
        return ToolGuardrailFunctionOutput.reject_content(
            "Tool output contained a secret-like token."
        )

    return ToolGuardrailFunctionOutput.allow()

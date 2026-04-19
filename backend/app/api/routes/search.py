from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.search import PeopleSearchRequest, PeopleSearchResponse
from app.services.agent_runner import (
    AgentExecutionError,
    AgentValidationError,
    run_people_search,
)
from app.services.crustdata_client import CrustdataAPIError

router = APIRouter(prefix="/api/search", tags=["search"])


@router.post("/people", response_model=PeopleSearchResponse)
async def search_people(request: PeopleSearchRequest) -> PeopleSearchResponse:
    try:
        return await run_people_search(request)
    except AgentValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except CrustdataAPIError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail={"message": exc.message, "details": exc.details},
        ) from exc
    except AgentExecutionError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

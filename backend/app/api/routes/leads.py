from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.models.search import PersonCard
from app.services import leads_store

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.get("", response_model=list[PersonCard])
async def list_saved_leads() -> list[PersonCard]:
    rows = leads_store.list_leads()
    return [PersonCard.model_validate(row) for row in rows]


@router.post("", response_model=PersonCard, status_code=status.HTTP_201_CREATED)
async def save_lead(person: PersonCard) -> PersonCard:
    if person.crustdata_person_id is None:
        raise HTTPException(
            status_code=400,
            detail="crustdata_person_id is required to save a lead.",
        )
    saved = leads_store.save_lead(person.model_dump())
    return PersonCard.model_validate(saved)


@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_lead(person_id: int) -> None:
    deleted = leads_store.delete_lead(person_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lead not found.")

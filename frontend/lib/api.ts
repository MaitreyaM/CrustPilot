import type {
  PeopleSearchRequest,
  PeopleSearchResponse,
  PersonCard,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function parseError(response: Response, fallback: string): Promise<string> {
  const errorBody = await response.json().catch(() => null);
  return (
    errorBody?.detail?.message ?? errorBody?.detail ?? errorBody?.message ?? fallback
  );
}

export async function searchPeople(
  payload: PeopleSearchRequest,
): Promise<PeopleSearchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/search/people`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Unable to run people search."));
  }

  return (await response.json()) as PeopleSearchResponse;
}

export async function fetchSavedLeads(): Promise<PersonCard[]> {
  const response = await fetch(`${API_BASE_URL}/api/leads`);
  if (!response.ok) {
    throw new Error(await parseError(response, "Unable to load saved leads."));
  }
  return (await response.json()) as PersonCard[];
}

export async function persistSavedLead(person: PersonCard): Promise<PersonCard> {
  const response = await fetch(`${API_BASE_URL}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(person),
  });
  if (!response.ok) {
    throw new Error(await parseError(response, "Unable to save lead."));
  }
  return (await response.json()) as PersonCard;
}

export async function deleteSavedLead(personId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/leads/${personId}`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(await parseError(response, "Unable to delete lead."));
  }
}

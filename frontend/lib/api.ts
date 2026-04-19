import type { PeopleSearchRequest, PeopleSearchResponse } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function searchPeople(
  payload: PeopleSearchRequest,
): Promise<PeopleSearchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/search/people`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.detail?.message ??
      errorBody?.detail ??
      "Unable to run people search.";
    throw new Error(message);
  }

  return (await response.json()) as PeopleSearchResponse;
}

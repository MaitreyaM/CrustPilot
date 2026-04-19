export type AppliedFilter = {
  field: string;
  operator: string;
  value: unknown;
};

export type NormalizedSearchIntent = {
  original_prompt: string;
  companies: string[];
  titles: string[];
  locations: string[];
  skills: string[];
  schools: string[];
  seniorities: string[];
  exclude_titles: string[];
  exclude_companies: string[];
  keywords: string[];
  sort_by_connections: boolean;
};

export type PersonCard = {
  crustdata_person_id: number | null;
  name: string;
  headline: string | null;
  location: string | null;
  current_title: string | null;
  current_company: string | null;
  profile_url: string | null;
};

export type PeopleSearchResponse = {
  search_intent_summary: string;
  interpreted_request: NormalizedSearchIntent;
  applied_filters: AppliedFilter[];
  crustdata_payload: Record<string, unknown>;
  results: PersonCard[];
  total_count: number;
  next_cursor: string | null;
  reasoning_summary: string | null;
};

export type PeopleSearchRequest = {
  prompt: string;
  limit?: number;
  cursor?: string | null;
};

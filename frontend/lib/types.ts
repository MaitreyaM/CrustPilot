export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

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
  summary: string | null;
  location: string | null;
  current_title: string | null;
  current_company: string | null;
  profile_url: string | null;
  connections: number | null;
  skills: string[];
  languages: string[];
  current_experience: Array<Record<string, unknown>>;
  past_experience: Array<Record<string, unknown>>;
  education: Array<Record<string, unknown>>;
  contact: Record<string, unknown>;
  social_profiles: Record<string, unknown>;
  raw_profile: Record<string, unknown>;
  /**
   * Optional direct phone number (only present for manually added/demo leads;
   * Crustdata search responses only return availability flags via `contact.has_phone_number`).
   */
  phone_number?: string | null;
};

export type PeopleSearchResponse = {
  assistant_message: string | null;
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
  prompt?: string | null;
  messages?: ChatMessage[];
  limit?: number;
  cursor?: string | null;
};

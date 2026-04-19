import type { PeopleSearchResponse } from "@/lib/types";

type SearchResultsProps = {
  data: PeopleSearchResponse | null;
  isLoading: boolean;
  error: string | null;
};

export function SearchResults({
  data,
  isLoading,
  error,
}: SearchResultsProps) {
  return (
    <section className="panel">
      <h2>People Results</h2>
      <p>
        Browse the interpreted matches from Crustdata, including role, company,
        location, and profile URL when available.
      </p>

      {error ? <div className="error-state">{error}</div> : null}

      {isLoading ? (
        <div className="empty-state">Running the agent and querying Crustdata...</div>
      ) : null}

      {!isLoading && !error && !data ? (
        <div className="empty-state">
          Submit a prompt to see interpreted filters and ranked people results.
        </div>
      ) : null}

      {!isLoading && !error && data && data.results.length === 0 ? (
        <div className="empty-state">
          No people matched the current filters. Try broadening the prompt.
        </div>
      ) : null}

      {data ? (
        <>
          <div className="pill-row">
            <span className="pill">{data.total_count} total matches</span>
            {data.next_cursor ? <span className="pill">More pages available</span> : null}
          </div>
          <div className="result-list">
            {data.results.map((person) => (
              <article className="result-card" key={person.crustdata_person_id ?? person.name}>
                <h3>{person.name}</h3>
                {person.headline ? <div className="meta">{person.headline}</div> : null}
                <div className="meta">
                  {[person.current_title, person.current_company]
                    .filter(Boolean)
                    .join(" at ") || "Role unavailable"}
                </div>
                {person.location ? <div className="meta">{person.location}</div> : null}
                {person.profile_url ? (
                  <a href={person.profile_url} target="_blank" rel="noreferrer">
                    View profile
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

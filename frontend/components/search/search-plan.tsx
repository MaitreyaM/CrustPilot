import type { PeopleSearchResponse } from "@/lib/types";

type SearchPlanProps = {
  data: PeopleSearchResponse | null;
};

export function SearchPlan({ data }: SearchPlanProps) {
  if (!data) {
    return (
      <section className="panel">
        <h2>Interpreted Search</h2>
        <p>
          The backend agent will translate your prompt into normalized search
          filters, then execute a validated Crustdata people search.
        </p>
        <div className="pill-row">
          <span className="pill">Titles</span>
          <span className="pill">Companies</span>
          <span className="pill">Locations</span>
          <span className="pill">Skills</span>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Interpreted Search</h2>
      <p>{data.search_intent_summary}</p>
      {data.reasoning_summary ? (
        <div className="pill-row">
          <span className="pill">{data.reasoning_summary}</span>
        </div>
      ) : null}
      <div className="filter-list">
        {data.applied_filters.map((filter) => (
          <div className="filter-chip" key={`${filter.field}-${filter.operator}`}>
            <strong>{filter.field}</strong>
            <span>{filter.operator}</span>
            <span>{JSON.stringify(filter.value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

type SearchFormProps = {
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  samplePrompts: string[];
};

export function SearchForm({
  prompt,
  setPrompt,
  onSubmit,
  isLoading,
  samplePrompts,
}: SearchFormProps) {
  return (
    <form className="search-form" onSubmit={onSubmit}>
      <textarea
        className="search-input"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Find founders in San Francisco with AI startup experience and exclude interns."
      />
      <div className="hero-actions">
        <button className="primary-button" disabled={isLoading || !prompt.trim()} type="submit">
          {isLoading ? "Searching..." : "Search people"}
        </button>
      </div>
      <div className="sample-row">
        {samplePrompts.map((samplePrompt) => (
          <button
            className="sample-button"
            key={samplePrompt}
            onClick={() => setPrompt(samplePrompt)}
            type="button"
          >
            {samplePrompt}
          </button>
        ))}
      </div>
    </form>
  );
}

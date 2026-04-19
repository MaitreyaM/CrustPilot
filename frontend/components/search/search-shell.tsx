"use client";

import { useState } from "react";

import { SearchForm } from "@/components/search/search-form";
import { SearchPlan } from "@/components/search/search-plan";
import { SearchResults } from "@/components/search/search-results";
import { searchPeople } from "@/lib/api";
import type { PeopleSearchResponse } from "@/lib/types";

const SAMPLE_PROMPTS = [
  "Find founders in San Francisco with AI startup experience.",
  "Show VP Sales leaders at Series B fintech companies in New York.",
  "Find product leaders at OpenAI alumni companies.",
];

export function SearchShell() {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPTS[0]);
  const [data, setData] = useState<PeopleSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await searchPeople({ prompt, limit: 10 });
      setData(response);
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Unexpected frontend error.";
      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="search-shell">
        <section className="hero-card">
          <div className="hero-inner">
            <div className="eyebrow">CrustPilot</div>
            <h1 className="hero-title">Who are you looking for?</h1>
            <p className="hero-copy">
              Prompt-driven people search for a Happenstance-style workflow. The
              frontend sends your search intent to a FastAPI backend that runs an
              OpenAI Agents SDK specialist and executes validated Crustdata person
              search requests.
            </p>
            <SearchForm
              prompt={prompt}
              setPrompt={setPrompt}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              samplePrompts={SAMPLE_PROMPTS}
            />
          </div>
        </section>

        <section className="grid">
          <SearchPlan data={data} />
          <SearchResults data={data} error={error} isLoading={isLoading} />
        </section>
      </div>
    </main>
  );
}

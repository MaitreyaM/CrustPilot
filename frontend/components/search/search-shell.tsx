"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpIcon, BookmarkPlus, Paperclip, Search, Sparkles } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { searchPeople } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ChatMessage, PeopleSearchResponse, PersonCard } from "@/lib/types";

const QUICK_PROMPTS = [
  "Find founders in San Francisco with AI startup experience.",
  "Show VP Sales leaders at Series B fintech companies in New York.",
];

export function SearchShell() {
  const [activeView, setActiveView] = useState<"people-search" | "saved-leads">(
    "people-search",
  );
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchData, setSearchData] = useState<PeopleSearchResponse | null>(null);
  const [savedLeads, setSavedLeads] = useState<PersonCard[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const hasConversation = messages.length > 0;

  const selectedLead = useMemo(
    () =>
      savedLeads.find((lead) => lead.crustdata_person_id === selectedLeadId) ??
      savedLeads[0] ??
      null,
    [savedLeads, selectedLeadId],
  );

  function addToLeads(person: PersonCard) {
    setSavedLeads((current) => {
      const exists = current.some(
        (lead) => lead.crustdata_person_id === person.crustdata_person_id,
      );
      if (exists) return current;
      return [person, ...current];
    });
    setSelectedLeadId(person.crustdata_person_id);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handlePromptSubmit(message);
  }

  async function handlePromptSubmit(rawMessage: string) {
    const trimmedMessage = rawMessage.trim();
    if (!trimmedMessage || isLoading) return;
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmedMessage },
    ];

    setMessages(nextMessages);
    setMessage("");
    setIsLoading(true);
    setError(null);
    setActiveView("people-search");

    try {
      const response = await searchPeople({
        messages: nextMessages,
        prompt: trimmedMessage,
        limit: 10,
      });
      setSearchData(response);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            response.assistant_message ??
            response.reasoning_summary ??
            "I found a set of people results for that request.",
        },
      ]);
    } catch (submissionError) {
      const nextError =
        submissionError instanceof Error
          ? submissionError.message
          : "Unexpected error.";
      setError(nextError);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `I ran into an error while searching: ${nextError}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, searchData, isLoading]);

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar
        activeView={activeView}
        onChangeView={setActiveView}
        savedLeadsCount={savedLeads.length}
      />
      <SidebarInset>
        {activeView === "people-search" ? (
          <PeopleSearchView
            error={error}
            handleSubmit={handleSubmit}
            hasConversation={hasConversation}
            isLoading={isLoading}
            message={message}
            messages={messages}
            onAddToLeads={addToLeads}
            onQuickPromptClick={(prompt) => void handlePromptSubmit(prompt)}
            savedLeads={savedLeads}
            scrollRef={scrollRef}
            searchData={searchData}
            setMessage={setMessage}
            textareaRef={textareaRef}
          />
        ) : (
          <SavedLeadsView
            leads={savedLeads}
            onBackToSearch={() => setActiveView("people-search")}
            onSelectLead={setSelectedLeadId}
            selectedLead={selectedLead}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

type PeopleSearchViewProps = {
  hasConversation: boolean;
  message: string;
  setMessage: (value: string) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onQuickPromptClick: (prompt: string) => void;
  onAddToLeads: (person: PersonCard) => void;
  isLoading: boolean;
  error: string | null;
  messages: ChatMessage[];
  searchData: PeopleSearchResponse | null;
  savedLeads: PersonCard[];
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
  textareaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
};

function PeopleSearchView({
  hasConversation,
  message,
  setMessage,
  handleSubmit,
  onQuickPromptClick,
  onAddToLeads,
  isLoading,
  error,
  messages,
  searchData,
  savedLeads,
  scrollRef,
  textareaRef,
}: PeopleSearchViewProps) {
  return (
    <div className="relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
      {/* Animated moon background — extends behind the sidebar via fixed positioning */}
      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-0 transition-opacity duration-700 ease-out",
          hasConversation ? "opacity-30" : "opacity-100",
        )}
      >
        <div
          className="absolute inset-0 animate-[ruixenFloat_18s_ease-in-out_infinite] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/80" />
      </div>

      {/* Header bar */}
      <header className="relative z-20 flex items-center gap-3 border-b border-white/5 px-4 py-3">
        <SidebarTrigger />
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <Search className="size-4" />
          <span className="font-medium text-neutral-200">People Search</span>
        </div>
      </header>

      {/* Hero block — collapses when conversation starts */}
      <div
        className={cn(
          "relative z-10 flex flex-col items-center px-6 transition-all duration-700 ease-out",
          hasConversation
            ? "max-h-0 -translate-y-4 opacity-0"
            : "max-h-[60vh] translate-y-0 pt-[14vh] opacity-100",
        )}
      >
        <img
          alt="CrustPilot"
          className="mb-6 size-16 brightness-0 invert drop-shadow-[0_0_24px_rgba(255,255,255,0.35)]"
          src="/crustpilot.svg"
        />
        <h1 className="text-center text-4xl font-semibold tracking-tight text-white drop-shadow-sm md:text-5xl">
          CrustPilot AI
        </h1>
        <p className="mt-3 max-w-xl text-center text-sm text-neutral-300 md:text-base">
          Search real people through conversation. Just start typing below.
        </p>
      </div>

      {/* Conversation scroll area — shows messages + results */}
      <div
        className={cn(
          "relative z-10 flex-1 overflow-y-auto",
          hasConversation ? "pt-6" : "pt-0",
        )}
        ref={scrollRef}
      >
        {hasConversation ? (
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 pb-6">
            {messages.map((entry, index) => (
              <ChatBubble entry={entry} key={`${entry.role}-${index}`} />
            ))}
            {isLoading ? <TypingBubble /> : null}
            {error && !isLoading ? (
              <div className="self-start rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}
            {searchData ? (
              <ResultsList
                onAddToLeads={onAddToLeads}
                savedLeads={savedLeads}
                searchData={searchData}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Input — centered when hero, docked at bottom when chatting */}
      <div
        className={cn(
          "relative z-20 px-4 transition-all duration-700 ease-out",
          hasConversation ? "pb-6 pt-2" : "-mt-6 pb-[18vh]",
        )}
      >
        <div className="mx-auto w-full max-w-3xl">
          <form
            className="rounded-2xl border border-neutral-700 bg-black/70 backdrop-blur-md"
            onSubmit={handleSubmit}
          >
            <Textarea
              className="min-h-[56px] w-full resize-none border-none bg-transparent px-4 py-3 text-sm text-white placeholder:text-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  if (message.trim() && !isLoading) {
                    handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
                  }
                }
              }}
              placeholder={
                hasConversation
                  ? "Refine your search or ask a follow-up..."
                  : "Type your request..."
              }
              ref={textareaRef}
              value={message}
            />
            <div className="flex items-center justify-between p-2.5">
              <button
                className="inline-flex size-8 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-800/60 hover:text-neutral-200"
                type="button"
              >
                <Paperclip className="size-4" />
              </button>
              <button
                className={cn(
                  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium transition",
                  !message.trim() || isLoading
                    ? "cursor-not-allowed bg-neutral-800 text-neutral-500"
                    : "bg-white text-black hover:bg-white/90",
                )}
                disabled={!message.trim() || isLoading}
                type="submit"
              >
                <span>Send</span>
                <ArrowUpIcon className="size-3.5" />
              </button>
            </div>
          </form>

          {!hasConversation ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-black/50 px-3.5 py-1.5 text-xs text-neutral-300 transition hover:border-neutral-600 hover:bg-neutral-800/60 hover:text-white"
                  key={prompt}
                  onClick={() => onQuickPromptClick(prompt)}
                  type="button"
                >
                  <Sparkles className="size-3" />
                  {prompt.replace(/\.$/, "")}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ entry }: { entry: ChatMessage }) {
  const isUser = entry.role === "user";
  return (
    <div
      className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 transition-all animate-[fadeUp_0.4s_ease-out]",
        isUser
          ? "self-end bg-white text-neutral-900"
          : "self-start border border-neutral-800/80 bg-neutral-900/60 text-neutral-100",
      )}
    >
      {entry.content}
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="self-start rounded-2xl border border-neutral-800/80 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-400">
      <span className="inline-flex gap-1">
        <span className="animate-pulse">●</span>
        <span className="animate-pulse [animation-delay:200ms]">●</span>
        <span className="animate-pulse [animation-delay:400ms]">●</span>
      </span>
    </div>
  );
}

function ResultsList({
  searchData,
  savedLeads,
  onAddToLeads,
}: {
  searchData: PeopleSearchResponse;
  savedLeads: PersonCard[];
  onAddToLeads: (person: PersonCard) => void;
}) {
  if (searchData.results.length === 0) return null;

  return (
    <div className="self-stretch animate-[fadeUp_0.5s_ease-out]">
      <div className="mb-3 flex items-center justify-between text-xs text-neutral-500">
        <span>{searchData.total_count} matching profiles</span>
        {searchData.next_cursor ? <span>More available</span> : null}
      </div>
      <div className="grid gap-2.5">
        {searchData.results.map((person) => {
          const isSaved = savedLeads.some(
            (lead) => lead.crustdata_person_id === person.crustdata_person_id,
          );
          return (
            <article
              className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-4"
              key={person.crustdata_person_id ?? person.name}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-neutral-100">
                    {person.name}
                  </h3>
                  {person.headline ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-400">
                      {person.headline}
                    </p>
                  ) : null}
                </div>
                <Button
                  className="shrink-0"
                  onClick={() => onAddToLeads(person)}
                  size="sm"
                  type="button"
                  variant={isSaved ? "secondary" : "outline"}
                >
                  <BookmarkPlus className="size-3.5" />
                  {isSaved ? "Saved" : "Save"}
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                {(person.current_title || person.current_company) && (
                  <span>
                    {[person.current_title, person.current_company]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
                {person.location ? <span>{person.location}</span> : null}
                {person.connections ? (
                  <span>{person.connections} connections</span>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function SavedLeadsView({
  leads,
  selectedLead,
  onSelectLead,
  onBackToSearch,
}: {
  leads: PersonCard[];
  selectedLead: PersonCard | null;
  onSelectLead: (leadId: number | null) => void;
  onBackToSearch: () => void;
}) {
  return (
    <div className="relative flex h-screen min-w-0 flex-1 flex-col lg:flex-row">
      <div className="w-full border-b border-neutral-800/80 lg:w-[340px] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-800/80 px-4 py-3">
          <SidebarTrigger />
          <div className="mr-auto">
            <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Saved Leads
            </div>
            <div className="text-sm font-semibold text-neutral-100">
              {leads.length} profile{leads.length === 1 ? "" : "s"}
            </div>
          </div>
          <Button onClick={onBackToSearch} size="sm" variant="outline">
            Back
          </Button>
        </div>

        <div className="space-y-1.5 p-3">
          {leads.length === 0 ? (
            <div className="rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-4 text-xs text-neutral-500">
              No saved leads yet. Save people from search results.
            </div>
          ) : (
            leads.map((lead) => (
              <button
                className={cn(
                  "w-full rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-3 text-left transition hover:border-neutral-700 hover:bg-neutral-900/70",
                  selectedLead?.crustdata_person_id === lead.crustdata_person_id &&
                    "border-neutral-600 bg-neutral-900/90",
                )}
                key={lead.crustdata_person_id ?? lead.name}
                onClick={() => onSelectLead(lead.crustdata_person_id)}
                type="button"
              >
                <div className="text-sm font-semibold text-neutral-100">
                  {lead.name}
                </div>
                <div className="mt-1 truncate text-xs text-neutral-500">
                  {[lead.current_title, lead.current_company]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-auto p-6">
        {selectedLead ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-2xl font-semibold text-neutral-100">
                    {selectedLead.name}
                  </div>
                  {selectedLead.headline ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
                      {selectedLead.headline}
                    </p>
                  ) : null}
                </div>
                {selectedLead.profile_url ? (
                  <Button
                    onClick={() =>
                      window.open(selectedLead.profile_url ?? "", "_blank")
                    }
                    size="sm"
                    variant="outline"
                  >
                    View profile
                  </Button>
                ) : null}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <LeadField label="Current title" value={selectedLead.current_title} />
                <LeadField
                  label="Current company"
                  value={selectedLead.current_company}
                />
                <LeadField label="Location" value={selectedLead.location} />
                <LeadField
                  label="Connections"
                  value={
                    selectedLead.connections
                      ? `${selectedLead.connections} connections`
                      : null
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <LeadSection
                items={selectedLead.skills}
                renderItem={(s) => s}
                title="Skills"
              />
              <LeadSection
                items={selectedLead.languages}
                renderItem={(l) => l}
                title="Languages"
              />
              <LeadObjectSection
                data={selectedLead.contact}
                title="Contact flags"
              />
              <LeadObjectSection
                data={selectedLead.social_profiles}
                title="Social profiles"
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <LeadRecordSection
                records={selectedLead.current_experience}
                title="Current background"
              />
              <LeadRecordSection
                records={selectedLead.past_experience}
                title="Past background"
              />
            </div>

            <LeadRecordSection
              records={selectedLead.education}
              title="Education"
            />

            {selectedLead.summary ? (
              <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-5">
                <div className="text-sm font-semibold text-neutral-100">Summary</div>
                <p className="mt-2 text-sm leading-6 text-neutral-400">
                  {selectedLead.summary}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-6 text-sm text-neutral-500">
            Select a saved lead to inspect their returned details.
          </div>
        )}
      </div>
    </div>
  );
}

function LeadField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-lg border border-neutral-800/80 bg-neutral-900/40 p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </div>
      <div className="mt-1.5 text-sm text-neutral-200">{value || "—"}</div>
    </div>
  );
}

function LeadSection<T>({
  title,
  items,
  renderItem,
}: {
  title: string;
  items: T[];
  renderItem: (item: T) => string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-5">
      <div className="text-sm font-semibold text-neutral-100">{title}</div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.length > 0 ? (
          items.map((item, index) => (
            <span
              className="rounded-md bg-neutral-800/60 px-2.5 py-1 text-xs text-neutral-300"
              key={`${title}-${index}`}
            >
              {renderItem(item)}
            </span>
          ))
        ) : (
          <div className="text-xs text-neutral-500">No data.</div>
        )}
      </div>
    </div>
  );
}

function LeadObjectSection({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown>;
}) {
  const entries = Object.entries(data).filter(
    ([, value]) => value !== null && value !== "",
  );
  return (
    <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-5">
      <div className="text-sm font-semibold text-neutral-100">{title}</div>
      <div className="mt-3 space-y-2">
        {entries.length > 0 ? (
          entries.map(([key, value]) => (
            <div
              className="rounded-md border border-neutral-800/80 bg-neutral-900/40 p-2.5 text-xs text-neutral-400"
              key={key}
            >
              <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                {key}
              </div>
              <div className="mt-1 break-words text-neutral-300">{String(value)}</div>
            </div>
          ))
        ) : (
          <div className="text-xs text-neutral-500">No data.</div>
        )}
      </div>
    </div>
  );
}

function LeadRecordSection({
  title,
  records,
}: {
  title: string;
  records: Array<Record<string, unknown>>;
}) {
  return (
    <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-5">
      <div className="text-sm font-semibold text-neutral-100">{title}</div>
      <div className="mt-3 space-y-2.5">
        {records.length > 0 ? (
          records.map((record, index) => (
            <div
              className="rounded-md border border-neutral-800/80 bg-neutral-900/40 p-3 text-xs text-neutral-300"
              key={`${title}-${index}`}
            >
              {Object.entries(record).map(([key, value]) => (
                <div className="mt-1.5 first:mt-0" key={key}>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                    {key}
                  </span>
                  <div className="mt-0.5 break-words text-neutral-300">
                    {String(value)}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="text-xs text-neutral-500">No data.</div>
        )}
      </div>
    </div>
  );
}

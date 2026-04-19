"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpIcon,
  BookmarkPlus,
  ExternalLink,
  Globe,
  Paperclip,
  Phone,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { searchPeople } from "@/lib/api";
import { ROHAN_MAYYA_DEMO_LEAD } from "@/lib/demo-leads";
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
  const [savedLeads, setSavedLeads] = useState<PersonCard[]>([
    ROHAN_MAYYA_DEMO_LEAD,
  ]);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const hasConversation = messages.length > 0;

  const selectedLead = useMemo(
    () =>
      selectedLeadId === null
        ? null
        : savedLeads.find(
            (lead) => lead.crustdata_person_id === selectedLeadId,
          ) ?? null,
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
  }

  function removeLead(personId: number | null) {
    setSavedLeads((current) =>
      current.filter((lead) => lead.crustdata_person_id !== personId),
    );
    setSelectedLeadId(null);
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
        onChangeView={(view) => {
          setActiveView(view);
          if (view === "saved-leads") {
            setSelectedLeadId(null);
          }
        }}
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
            onRemoveLead={removeLead}
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
          const phone = person.phone_number ?? null;
          const phoneAvailable = Boolean(
            phone || (person.contact as { has_phone_number?: boolean })?.has_phone_number,
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
                <div className="flex shrink-0 items-center gap-1.5">
                  <CallButton compact phone={phone} phoneAvailable={phoneAvailable} />
                  <Button
                    onClick={() => onAddToLeads(person)}
                    size="sm"
                    type="button"
                    variant={isSaved ? "secondary" : "outline"}
                  >
                    <BookmarkPlus className="size-3.5" />
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                </div>
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
  onRemoveLead,
  onBackToSearch,
}: {
  leads: PersonCard[];
  selectedLead: PersonCard | null;
  onSelectLead: (leadId: number | null) => void;
  onRemoveLead: (leadId: number | null) => void;
  onBackToSearch: () => void;
}) {
  // Detail mode: selected lead is shown, with back arrow to grid
  if (selectedLead) {
    return (
      <div className="relative flex h-screen min-w-0 flex-1 flex-col">
        <header className="relative z-20 flex items-center gap-3 border-b border-white/5 px-4 py-3">
          <SidebarTrigger />
          <button
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-neutral-400 transition hover:bg-white/5 hover:text-neutral-100"
            onClick={() => onSelectLead(null)}
            type="button"
          >
            <ArrowLeft className="size-4" />
            All leads
          </button>
          <span className="ml-auto text-xs text-neutral-500">
            {selectedLead.name}
          </span>
        </header>

        <div className="flex-1 overflow-auto px-6 py-8">
          <LeadDetail
            lead={selectedLead}
            onRemove={() => onRemoveLead(selectedLead.crustdata_person_id)}
          />
        </div>
      </div>
    );
  }

  // Grid mode: all saved leads
  return (
    <div className="relative flex h-screen min-w-0 flex-1 flex-col">
      <header className="relative z-20 flex items-center gap-3 border-b border-white/5 px-4 py-3">
        <SidebarTrigger />
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <BookmarkPlus className="size-4" />
          <span className="font-medium text-neutral-200">Saved Leads</span>
        </div>
        <span className="ml-auto text-xs text-neutral-500">
          {leads.length} profile{leads.length === 1 ? "" : "s"}
        </span>
      </header>

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Your saved leads
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                Click a card to inspect the full profile, or call directly.
              </p>
            </div>
            <Button onClick={onBackToSearch} size="sm" variant="outline">
              Back to search
            </Button>
          </div>

          {leads.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-10 text-center text-sm text-neutral-500">
              No saved leads yet. Save people from search results to build your
              outreach list.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {leads.map((lead) => (
                <LeadGridCard
                  key={lead.crustdata_person_id ?? lead.name}
                  lead={lead}
                  onOpen={() => onSelectLead(lead.crustdata_person_id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LeadGridCard({
  lead,
  onOpen,
}: {
  lead: PersonCard;
  onOpen: () => void;
}) {
  const phone = lead.phone_number ?? null;
  const phoneAvailable = Boolean(
    phone || (lead.contact as { has_phone_number?: boolean })?.has_phone_number,
  );
  return (
    <article
      aria-label={`Open ${lead.name}`}
      className="group flex h-full cursor-pointer flex-col rounded-xl border border-white/8 bg-white/[0.02] p-5 transition hover:border-white/15 hover:bg-white/[0.04]"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-neutral-100">
              {lead.name}
            </h3>
            <p className="mt-1 truncate text-xs text-neutral-500">
              {[lead.current_title, lead.current_company]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {lead.profile_url ? (
              <a
                aria-label="Open LinkedIn profile"
                className="inline-flex size-7 items-center justify-center rounded-md text-neutral-500 transition hover:bg-white/8 hover:text-neutral-100"
                href={lead.profile_url}
                onClick={(e) => e.stopPropagation()}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="size-3.5" />
              </a>
            ) : null}
          </div>
        </div>

        {lead.headline ? (
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-neutral-400">
            {lead.headline}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
          {lead.location ? <span>{lead.location}</span> : null}
          {lead.connections ? (
            <span>{lead.connections.toLocaleString()} connections</span>
          ) : null}
        </div>

        {lead.skills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1">
            {lead.skills.slice(0, 4).map((skill) => (
              <span
                className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-neutral-300"
                key={skill}
              >
                {skill}
              </span>
            ))}
            {lead.skills.length > 4 ? (
              <span className="rounded bg-white/4 px-1.5 py-0.5 text-[10px] text-neutral-500">
                +{lead.skills.length - 4}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
        <CallButton
          onClickStop
          phone={phone}
          phoneAvailable={phoneAvailable}
          size="sm"
        />
        <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-600">
          Open profile →
        </span>
      </div>
    </article>
  );
}

function LeadDetail({
  lead,
  onRemove,
}: {
  lead: PersonCard;
  onRemove: () => void;
}) {
  const phone = lead.phone_number ?? null;
  const phoneAvailable = Boolean(
    phone || (lead.contact as { has_phone_number?: boolean })?.has_phone_number,
  );
  const socialEntries = Object.entries(lead.social_profiles ?? {}).filter(
    ([, value]) => typeof value === "string" && value,
  ) as Array<[string, string]>;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Hero card */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-3xl font-semibold tracking-tight text-white">
              {lead.name}
            </div>
            {lead.headline ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
                {lead.headline}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
              {lead.location ? <span>{lead.location}</span> : null}
              {lead.connections ? (
                <span>{lead.connections.toLocaleString()} connections</span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CallButton phone={phone} phoneAvailable={phoneAvailable} size="default" />
            {lead.profile_url ? (
              <Button
                onClick={() => window.open(lead.profile_url ?? "", "_blank")}
                size="default"
                type="button"
                variant="outline"
              >
                <ExternalLink className="size-4" />
                LinkedIn
              </Button>
            ) : null}
            <button
              aria-label="Remove lead"
              className="inline-flex size-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] text-neutral-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
              onClick={onRemove}
              type="button"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <DetailField label="Current title" value={lead.current_title} />
          <DetailField label="Current company" value={lead.current_company} />
          <DetailField label="Location" value={lead.location} />
          <DetailField
            label="Phone"
            value={phone ?? (phoneAvailable ? "Available via Crustdata" : null)}
          />
        </div>
      </div>

      {/* Summary */}
      {lead.summary ? (
        <DetailCard title="Summary">
          <p className="text-sm leading-6 text-neutral-300">{lead.summary}</p>
        </DetailCard>
      ) : null}

      {/* Skills + Languages + Social */}
      <div className="grid gap-4 lg:grid-cols-3">
        <DetailCard title="Skills">
          <ChipList items={lead.skills} />
        </DetailCard>
        <DetailCard title="Languages">
          <ChipList items={lead.languages} />
        </DetailCard>
        <DetailCard title="Social profiles">
          {socialEntries.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {socialEntries.map(([key, url]) => (
                <a
                  className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-400 transition hover:bg-white/5 hover:text-neutral-100"
                  href={url}
                  key={key}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Globe className="size-3.5 shrink-0 text-neutral-500 group-hover:text-neutral-300" />
                  <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
                </a>
              ))}
            </div>
          ) : (
            <EmptyHint>No social profiles linked.</EmptyHint>
          )}
        </DetailCard>
      </div>

      {/* Experience */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DetailCard title="Current role">
          <RecordList records={lead.current_experience} />
        </DetailCard>
        <DetailCard title="Past roles">
          <RecordList records={lead.past_experience} />
        </DetailCard>
      </div>

      {/* Education */}
      <DetailCard title="Education">
        <RecordList records={lead.education} />
      </DetailCard>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </div>
      <div className="mt-1.5 text-sm text-neutral-200">{value || "—"}</div>
    </div>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
      <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
        {title}
      </div>
      {children}
    </div>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) return <EmptyHint>No data.</EmptyHint>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <span
          className="rounded-md bg-white/8 px-2.5 py-1 text-xs text-neutral-200"
          key={`${item}-${index}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function RecordList({
  records,
}: {
  records: Array<Record<string, unknown>>;
}) {
  if (records.length === 0) return <EmptyHint>No data.</EmptyHint>;
  return (
    <div className="space-y-3">
      {records.map((record, index) => {
        const title = (record.title as string) || (record.degree as string) || "Role";
        const company =
          (record.company_name as string) || (record.school as string) || "";
        const range = [record.start_date, record.end_date]
          .filter(Boolean)
          .join(" – ");
        const description = (record.description as string) || "";
        return (
          <div
            className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
            key={`record-${index}`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-sm font-medium text-neutral-100">{title}</div>
              {range ? (
                <div className="text-[11px] text-neutral-500">{range}</div>
              ) : null}
            </div>
            {company ? (
              <div className="mt-0.5 text-xs text-neutral-400">{company}</div>
            ) : null}
            {description ? (
              <p className="mt-2 text-xs leading-5 text-neutral-400">
                {description}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-neutral-500">{children}</div>;
}

function CallButton({
  phone,
  phoneAvailable,
  size = "sm",
  compact = false,
  onClickStop = false,
}: {
  phone: string | null;
  phoneAvailable: boolean;
  size?: "sm" | "default";
  compact?: boolean;
  onClickStop?: boolean;
}) {
  const disabled = !phone;
  const label = compact
    ? phone ?? (phoneAvailable ? "Phone" : "No phone")
    : phone ?? (phoneAvailable ? "Phone available" : "No phone on file");

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (onClickStop) e.stopPropagation();
    if (disabled) e.preventDefault();
  };

  return (
    <a
      aria-disabled={disabled}
      className={cn(
        "relative z-10 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] text-xs font-medium transition",
        size === "default" ? "h-10 px-3.5 text-sm" : "h-7 px-2.5",
        disabled
          ? "cursor-not-allowed text-neutral-600"
          : "text-neutral-100 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-200",
      )}
      href={disabled ? undefined : `tel:${phone}`}
      onClick={handleClick}
      title={
        disabled && !phoneAvailable
          ? "No phone number available"
          : disabled
            ? "Phone available via Crustdata enrichment"
            : `Call ${phone}`
      }
    >
      <Phone className="size-3.5" />
      <span>{label}</span>
    </a>
  );
}

# YC Context

**An AI voice agent that researches your lead with Crustdata, then calls them with full context — live.**

Built at **ContextCon** (Crustdata × Y Combinator), Bengaluru, April 19, 2026.

---

## The Idea

Cold calls are dead because they're cold. What if the agent knew everything about your lead before dialing — their company, role, recent work, and what they care about — and used that context to have a real conversation?

**YC Context** is a dashboard that:

1. **Searches leads** using Crustdata's Person & Company APIs (700M+ profiles, 40M+ companies)
2. **Enriches context** — employment history, recent work, company signals, interests
3. **Generates a conversation strategy** from the enriched profile
4. **Triggers a live AI voice call** with talking points already loaded
5. **Shows outcomes live** — appointments booked, follow-ups scheduled, all in real time

## Why it matters (YC Spring 2026 RFS fit)

Maps directly to **AI-Native Agencies** and **AI-Native SDR** in YC's Spring 2026 Request for Startups. Agencies of the future look like software companies with software margins — YC Context is the sales call, fully automated, with better context than any human SDR could gather.

## Demo Flow

1. User opens dashboard → sees hardcoded leads (today's judges, pre-enriched via Crustdata)
2. Clicks a lead → full context appears: company, role, background, recent signals
3. Hits **Call** → AI voice agent dials the lead live
4. Live transcript streams on screen
5. Outcome (e.g. appointment booked) appears on dashboard in real time

## Stack

- **Crustdata APIs** — Person Search, Person Enrich, Company Enrich, Web Search
- **VAPI** — realistic AI voice calls
- **Frontend** — dashboard with lead list, context view, live call transcript
- **LLM** — context synthesis → talking points → conversation strategy

## Team

- Hritik Datta
- Saket Toshniwal
- *(third teammate)*

---

Built in 5 hours. Powered by Crustdata.
# Riyaaz — Search & Timestamp

Search Kathak terminology ("tukda", "tatkar", "paran", "tihai"...) across
YouTube, or paste a performance link directly, and jump straight to the
exact timestamp where it happens.

## How it works

```
frontend (Vite + React + TS + Tailwind)
    │  fetch()
    ▼
backend (FastAPI)
    ├── normalization.py    → maps typos/variants ("tukra") to a canonical term ("tukda")
    ├── youtube_client.py   → YouTube Data API search + oEmbed metadata
    ├── transcript_service  → youtube-transcript-api, cached in SQLite
    ├── search_service.py   → matches transcript segments against term variations, ranks, timestamps
    └── SQLite (SQLAlchemy) → videos, transcript segments, term dictionary,
                               search queries, results shown, clicks, feedback
```

Two search modes:

1. **Term search** — `"tukra"` → normalized to `tukda` → YouTube Data API
   finds candidate videos → transcripts are fetched and cached → segments
   are matched against every known spelling of the term → best matches
   are ranked and returned with a direct timestamped link.
2. **Paste a video** — drop in any YouTube URL. If a specific term is given,
   Riyaaz searches just that video's transcript for it. If no term is
   given, it scans the transcript against the whole Kathak term dictionary
   and returns everything it recognizes.

Every search, its results, every click on "Watch from here", and every
thumbs up/down is logged (see **Analytics & future ranking** below) — that
data is exactly what upgrading this to embeddings/semantic search or
learned ranking later would train on.

## Why this stack

- **Backend: FastAPI + SQLite** — matches Riyaaz's existing FastAPI
  decision. SQLite needs zero setup for local dev; `DATABASE_URL` in
  `.env` is the only thing that changes to point it at Postgres/Supabase
  later — the SQLAlchemy models don't change.
- **Frontend: Vite + React + TS + Tailwind**, not full Next.js — this is
  one self-contained screen, so a lighter build keeps local setup fast.
  It's plain React components + `fetch` calls, so it drops into the main
  Next.js app later as a route with minimal changes.
- **rapidfuzz** for typo tolerance instead of a hosted fuzzy-search
  service — no extra infra for an MVP-sized term dictionary.

## Project structure

```
riyaaz-search/
├── backend/
│   ├── app/
│   │   ├── main.py                 FastAPI app + CORS + startup (creates tables, seeds terms)
│   │   ├── config.py                env-based settings
│   │   ├── database.py              SQLAlchemy engine/session
│   │   ├── models.py                Video, TranscriptSegment, KathakTerm, TermVariation,
│   │   │                            SearchQuery, SearchResultLog, ClickLog, Feedback
│   │   ├── schemas.py               Pydantic request/response models
│   │   ├── kathak_terms_seed.py     starter term dictionary (tukda, tatkar, paran, tihai, ...)
│   │   ├── init_terms.py            seeds the dictionary into the DB
│   │   ├── normalization.py         exact + fuzzy term matching
│   │   ├── youtube_client.py        YouTube Data API search, oEmbed metadata, URL parsing
│   │   ├── transcript_service.py    transcript fetch + cache
│   │   ├── search_service.py        orchestrates search → match → rank → log
│   │   └── routers/
│   │       ├── search.py            POST /api/search, POST /api/search/video
│   │       ├── feedback.py          POST /api/click, POST /api/feedback
│   │       └── health.py            GET /api/health
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.tsx                  state machine: idle/loading/results/no-results/
    │   │                            transcript-unavailable/error
    │   ├── components/
    │   │   ├── SearchBar.tsx        term-search / paste-video toggle
    │   │   ├── ResultCard.tsx       thumbnail, snippet, timestamp, Watch from here, feedback
    │   │   ├── States.tsx           loading/empty/no-results/transcript-unavailable/error
    │   │   └── Wordmark.tsx
    │   └── lib/
    │       ├── api.ts               typed fetch client
    │       └── types.ts
    ├── package.json
    └── .env.example
```

## Setup

### 1. Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env
```

Add a YouTube Data API v3 key to `.env` (`YOUTUBE_API_KEY=...`) — get one
at https://console.cloud.google.com/apis/credentials with the "YouTube
Data API v3" enabled on the project. **Term search won't find candidate
videos without this key.** Pasting a specific video link still works
without a key (it uses YouTube's public oEmbed endpoint for metadata).

```bash
uvicorn app.main:app --reload --port 8000
```

This creates `riyaaz_search.db` (SQLite) and seeds the Kathak term
dictionary automatically on first run. Docs at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

Open `http://localhost:5173`.

## API

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/search` | `{ query, guru?, session_id? }` → ranked results across YouTube |
| POST | `/api/search/video` | `{ url, term?, session_id? }` → matches within one pasted video |
| POST | `/api/click` | logs a "Watch from here" click |
| POST | `/api/feedback` | logs a thumbs up/down on a result |
| GET | `/api/health` | liveness check |

Full request/response shapes are in `backend/app/schemas.py` and live at
`/docs` (Swagger UI) once the server is running.

## Database schema

- **videos** — cached YouTube metadata + whether a transcript exists
- **transcript_segments** — every caption line, with `start_seconds`, per video
- **kathak_terms** / **term_variations** — the spelling-normalization dictionary
- **search_queries** — every search: raw text, normalized term, guru filter, result count, success
- **search_result_logs** — every result actually shown, with rank and match score
- **click_logs** — every "Watch from here" click
- **feedback** — thumbs up/down (and optional comment) per result

## Analytics & future ranking

This is deliberately logged, not just displayed:

- **Failed searches** (`search_queries.succeeded = false`) are the backlog
  for expanding `kathak_terms_seed.py` — low-confidence fuzzy matches
  (`normalization.py`'s `confidence` score) point at spelling variants
  worth adding.
- **`search_result_logs` + `click_logs`** together give a shown-vs-clicked
  signal — the basis for learning a real ranking function later, instead
  of the current score (`substring/fuzzy match + guru bonus`).
- **`feedback`** is a direct relevance label per result.

None of this requires new infrastructure to start using — it's already
being written on every request.

## Where this goes next (intentionally not built yet)

- **Semantic search / embeddings**: `transcript_segments.text` is the
  natural column to embed (e.g. pgvector once on Postgres) for
  meaning-based matching beyond exact/fuzzy term matching.
- **AI-based composition classification**: a model that labels transcript
  segments by composition type without relying on the term dictionary at
  all — `kathak_terms` would become training labels rather than the
  matching mechanism itself.
- **Learned ranking**: `search_result_logs` + `click_logs` + `feedback` is
  exactly the training set for that.

Deliberately not in this version: user accounts (sessions are anonymous,
client-generated IDs), caching layer beyond the DB, background job queue
for transcript fetching (it's synchronous — fine at this scale, worth
revisiting if search latency becomes noticeable with real traffic).

## Error handling & edge cases already covered

- No `YOUTUBE_API_KEY` → term search returns an empty, explained result
  set rather than erroring.
- Video with captions disabled / no transcript → surfaced as a distinct
  "transcript unavailable" state, not a generic error, both for term
  search (video is silently skipped) and pasted-link search (shown
  explicitly, since it's the one video the user asked about).
- Invalid/unparseable YouTube URL → explicit message, not a 500.
- Any transcript-fetch exception (private video, region lock, etc.) is
  caught and treated as "no transcript" rather than crashing the request.

# MEMORY PALACE

**Turn knowledge into a place you can walk through.**

MEMORY PALACE is a multilingual spatial learning environment that transforms documents, subjects, and lessons into interactive 3D memory worlds — built for the Education Track and designed to scale into a full AI-powered platform.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Three.js](https://img.shields.io/badge/Three.js-R3F-000?style=flat-square&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)

## Problem

Students store knowledge in flat notes, PDFs, and folders. That makes it hard to remember, connect, and explore ideas. Many learners also struggle because platforms are not visual, adaptive, or multilingual.

## Solution

MEMORY PALACE turns knowledge into a **3D learning world**. Learners walk through concepts, click memory nodes, follow learning routes, practice questions, revise flashcards, and study in their preferred language — **with no external API required for the MVP**.

## Features

- **3D Knowledge Rooms** — floating nodes, glowing connections, central document core, orbit controls
- **Multilingual learning** — English, French, Spanish, Portuguese, Swahili, Bemba, Nyanja
- **Grade 1 to University** — curriculum levels, subjects, and built-in lessons
- **Local Knowledge Engine** — paste text or upload documents; concepts extracted in-browser
- **Math Practice Engine** — grade-based problems with hints and step-by-step solutions
- **Study guides & flashcards** — key points, review decks, spaced-style local tracking
- **Memory routes** — ordered learning paths through concepts
- **Presentation mode** — guided concept-by-concept journey
- **Ask the Palace** — local search over room content (no cloud AI)
- **Progress tracking** — quiz scores, weak/strong concepts, completed topics (localStorage)
- **Demo palace** — instant Artificial Intelligence memory world (`demo-ai`)
- **10 built-in lessons** — math, science, physics, programming, databases, genetics, and more
- **2D fallback** — knowledge graph view if WebGL is unavailable

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 App Router, TypeScript |
| Styling | Tailwind CSS, glassmorphism, Framer Motion |
| UI | shadcn/ui patterns, Lucide icons |
| 3D | React Three Fiber, Three.js, @react-three/drei |
| State | Zustand (language, level, translations) |
| Persistence (MVP) | localStorage |
| Document upload | `officeparser` via `/api/extract-file` (local parsing) |
| Future-ready | OpenAI, Supabase, vector search stubs |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No API keys are required. Optional environment variables can be added later:

```env
# Optional — future integrations
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Hackathon Demo Flow

1. Open the landing page and select a language (navbar or settings).
2. Click **Launch Demo Palace** → 3D Artificial Intelligence memory palace.
3. Click memory nodes to read concept details.
4. Use **Ask the Palace** for local Q&A from room content.
5. Open **Study** — guide, flashcards, key points.
6. Open **Practice** — quizzes with hints and scoring.
7. Follow the **Memory Route** in the room or presentation mode.
8. Return to **Dashboard** — progress is saved in localStorage.

## How Multilingual Support Works

- Translation files live in `src/lib/i18n/` (`en`, `fr`, `es`, `pt`, `sw`, `bem`, `nya`).
- UI labels use `getTranslations(language)` via Zustand `useAppStore`.
- Lesson content uses `MultilingualText` with `resolveText()` — missing translations fall back to English.
- Selected language is stored under `memory-palace-language`.

## How the Curriculum Engine Works

- Types: `src/types/curriculum.ts`, `src/types/learning.ts`
- Built-in lessons: `src/lib/curriculum/lessons.ts` (10 MVP lessons)
- Library page filters by subject, level, and search
- Lessons convert to `KnowledgeRoom` via `lessonToRoom()` for 3D generation

## How the Local Knowledge Engine Works

`src/lib/localKnowledgeEngine.ts` accepts raw text and:

1. Tokenizes and removes stop words
2. Extracts 8–15 concepts with summaries and clusters
3. Builds relationships from co-occurrence in sentences/paragraphs
4. Assigns 3D positions and importance (frequency-based)
5. Generates study guide, flashcards, practice questions, and memory route

Short input uses demo fallback content so the app never breaks.

## How the Math Engine Works

`src/lib/mathEngine.ts` provides:

- `generateMathProblem(level, topic, difficulty)`
- `checkMathAnswer(problem, userAnswer)`
- `getMathHint(problem)` and `getStepByStepSolution(problem)`

Topics map to grades: addition (G1), fractions (G4), linear equations (G8), quadratics (G10), calculus basics (University Y1).

## How the 3D Memory Palace Works

- `KnowledgeRoom3D` renders a glowing document core, concept spheres, and connection lines
- Node size and color reflect importance and cluster
- `ConceptDetailPanel` shows summaries and related concepts on click
- `KnowledgeGraph2D` provides a fallback 2D view
- Demo room: `src/lib/demoRoom.ts` → saved as `demo-ai`

## How localStorage Works

| Key | Purpose |
|-----|---------|
| `memory-palace-language` | Selected UI language |
| `memory-palace-level` | Learner education level |
| `memory-palace-rooms` | Saved knowledge rooms |
| `memory-palace-progress` | Quiz scores, weak/strong concepts, completed topics |
| `memory-palace-flashcards` | Flashcard review state |

Utilities: `src/lib/progressStorage.ts`, `src/lib/roomStorage.ts`

## Project Structure

```
src/
├── app/                      # Pages & API routes
│   ├── dashboard/
│   ├── library/[lessonId]/
│   ├── create/
│   ├── room/[id]/            # 3D room, study, practice, present
│   └── settings/
├── components/               # UI, 3D, study, practice
├── lib/
│   ├── i18n/                 # Translations
│   ├── curriculum/           # Built-in lessons
│   ├── localKnowledgeEngine.ts
│   ├── mathEngine.ts
│   ├── localSearch.ts
│   ├── progressStorage.ts
│   └── roomStorage.ts
├── store/appStore.ts         # Zustand
└── types/                    # learning, curriculum, memory-palace
```

## API Routes (Local MVP)

| Route | Purpose |
|-------|---------|
| `POST /api/process-content` | Local knowledge extraction from text |
| `POST /api/ask-room` | Local “Ask the Palace” search |
| `POST /api/extract-file` | PDF/DOCX/PPTX text extraction |
| `POST /api/generate-study-guide` | Study guide from room data |
| `POST /api/generate-memory-route` | Memory route from room data |

All core routes work without OpenAI or Supabase.

## How to Add OpenAI Later

1. Create `src/lib/ai/openai.ts` with structured JSON prompts.
2. In `process-content`, try OpenAI first; on failure or missing key, call `extractKnowledgeFromText`.
3. In `ask-room`, try embeddings + GPT; fallback to `searchPalace` in `localSearch.ts`.
4. Store rooms in Supabase instead of (or synced with) localStorage.

Architecture stubs: `src/lib/supabase.ts` (optional).

## Deploy on Vercel

### Preflight (run locally)

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run start   # smoke-test at http://localhost:3000
```

### Vercel

1. Push the repo to GitHub.
2. Import the project in [Vercel](https://vercel.com) (Framework: **Next.js**).
3. **Node.js 20+** (see `.nvmrc`).
4. Build command: `npm run build` · Output: default (Next.js).
5. **No env vars required** for the demo MVP (localStorage + local knowledge engine).

Optional env vars — copy from `.env.example`:

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Cloud AI (future) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth & cloud sync |
| `MAX_UPLOAD_MB` / `NEXT_PUBLIC_MAX_UPLOAD_MB` | File upload cap (default **4** on Vercel) |

`vercel.json` sets a 60s timeout for document extraction (`/api/extract-file`).

## Future Improvements

- OpenAI for richer extraction and narration
- Supabase auth, rooms, and pgvector search
- Pinecone or Supabase Vector for semantic Ask the Palace
- Voice narration and VR/WebXR walkthrough
- Collaborative palaces and teacher dashboards
- Spaced repetition scheduler from flashcard analytics

## License

MIT — built for hackathon demos and education.

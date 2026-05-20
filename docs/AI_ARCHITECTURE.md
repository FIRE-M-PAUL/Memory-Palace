# MEMORY PALACE — Adaptive AI Knowledge Architecture

## Learning loop

```
Upload → Chunk + Extract concepts → Embeddings → Vector memory
    → User study + Ask questions → Feedback → Confidence updates → Smarter retrieval
```

## Modules (`src/lib/ai/`)

| Module | Role |
|--------|------|
| `embeddings.ts` | OpenAI `text-embedding-3-small` when `OPENAI_API_KEY` is set; otherwise local TF-IDF vectors |
| `vectorIndex.ts` | Index rooms (chunks, concepts, relationships); cosine retrieval |
| `ragPolicy.ts` | Strict thresholds, lexical grounding, off-topic refusal (no general AI) |
| `ragAnswer.ts` | Document-only RAG answers from retrieved chunks (no lexical fallback) |
| `ingestPipeline.ts` | Post-upload indexing + relationship evolution |
| `feedbackEngine.ts` | Human-in-the-loop confidence adjustments |
| `learningProfile.ts` | Per-user interaction memory (local) |
| `knowledgeEvolution.ts` | Auto-link semantically similar concepts |
| `aiMemoryStorage.ts` | Persist index + feedback in localStorage |
| `client.ts` | Browser API helpers |

## API routes

- `POST /api/ai/index-room` — build/update vector index after upload
- `POST /api/ask-room` — strict RAG Q&A; refuses when retrieval confidence is low (optional client index in body)
- `POST /api/ai/feedback` — thumbs up/down updates chunk confidence

## Environment

```env
OPENAI_API_KEY=   # optional; enables higher-quality embeddings
```

Without OpenAI, the system still runs real local semantic retrieval (not hardcoded Q&A).

## Future (Supabase / pgvector)

See `supabase/schema.sql` extensions for cloud vector storage and multi-device sync.

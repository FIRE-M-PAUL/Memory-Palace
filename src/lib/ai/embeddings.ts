import OpenAI from "openai";
import { normalizeVector, tokenize } from "@/lib/ai/vectorMath";
import type { EmbeddingProvider } from "@/types/ai-memory";

const OPENAI_MODEL = "text-embedding-3-small";
const LOCAL_DIM_CAP = 384;

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) return null;
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: key });
  return openaiClient;
}

export function getEmbeddingProvider(): EmbeddingProvider {
  return getOpenAI() ? "openai" : "local-tfidf";
}

export async function embedTexts(
  texts: string[],
  corpus?: string[]
): Promise<{ vectors: number[][]; provider: EmbeddingProvider; vocabulary?: string[] }> {
  const provider = getEmbeddingProvider();
  if (provider === "openai") {
    const client = getOpenAI()!;
    const batch = texts.map((t) => t.slice(0, 8000));
    const res = await client.embeddings.create({
      model: OPENAI_MODEL,
      input: batch,
    });
    const vectors = res.data
      .sort((a, b) => a.index - b.index)
      .map((d) => normalizeVector(d.embedding));
    return { vectors, provider, vocabulary: undefined };
  }

  const { terms, map: vocab } = buildVocabulary(corpus ?? texts);
  const idf = buildIdf(corpus ?? texts, vocab);
  const vectors = texts.map((t) => buildTfidfVector(t, vocab, idf));
  return { vectors, provider: "local-tfidf", vocabulary: terms };
}

export async function embedQuery(
  query: string,
  index: { vocabulary?: string[]; corpus?: string[]; provider: EmbeddingProvider; sampleVector?: number[] }
): Promise<number[]> {
  if (index.provider === "openai") {
    const { vectors } = await embedTexts([query]);
    return vectors[0] ?? [];
  }

  const corpus = index.corpus ?? [];
  const vocab =
    index.vocabulary?.length
      ? (() => {
          const m = new Map<string, number>();
          index.vocabulary!.forEach((t, i) => m.set(t, i));
          return m;
        })()
      : buildVocabulary(corpus).map;
  const idf = buildIdf(corpus, vocab);
  const q = buildTfidfVector(query, vocab, idf);
  if (index.sampleVector && q.length !== index.sampleVector.length) {
    return alignVector(q, index.sampleVector.length);
  }
  return q;
}

function buildVocabulary(texts: string[]): { terms: string[]; map: Map<string, number> } {
  const df = new Map<string, number>();
  for (const text of texts) {
    const seen = new Set(tokenize(text));
    for (const t of seen) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const terms = [...df.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, LOCAL_DIM_CAP)
    .map(([t]) => t);
  const map = new Map<string, number>();
  terms.forEach((t, i) => map.set(t, i));
  return { terms, map };
}

function buildIdf(corpus: string[], vocab: Map<string, number>): Map<string, number> {
  const n = Math.max(corpus.length, 1);
  const df = new Map<string, number>();
  for (const text of corpus) {
    const seen = new Set(tokenize(text));
    for (const term of seen) {
      if (vocab.has(term)) df.set(term, (df.get(term) ?? 0) + 1);
    }
  }
  const idf = new Map<string, number>();
  for (const term of vocab.keys()) {
    const docFreq = df.get(term) ?? 0;
    idf.set(term, Math.log(1 + n / (1 + docFreq)));
  }
  return idf;
}

function buildTfidfVector(
  text: string,
  vocab: Map<string, number>,
  idf: Map<string, number>
): number[] {
  const tokens = tokenize(text);
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  const vec = new Array(vocab.size).fill(0);
  for (const [term, idx] of vocab) {
    const count = tf.get(term) ?? 0;
    if (count > 0) vec[idx] = count * (idf.get(term) ?? 1);
  }
  return normalizeVector(vec);
}

function alignVector(v: number[], dim: number): number[] {
  if (v.length === dim) return v;
  const out = new Array(dim).fill(0);
  for (let i = 0; i < Math.min(v.length, dim); i++) out[i] = v[i];
  return normalizeVector(out);
}

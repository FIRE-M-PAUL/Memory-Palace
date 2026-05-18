import type { KnowledgeRoom } from "@/types/memory-palace";
import { mt } from "@/lib/multilingual";
import { DEMO_ROOM_ID } from "@/lib/roomStorage";
import { positionsFor } from "@/lib/curriculum/lessonBuilder";

export function getDemoRoom(): KnowledgeRoom {
  const pos = positionsFor(10);
  const concepts = [
    { id: "concept-1", title: mt("Artificial Intelligence"), summary: mt("Machines that simulate human intelligence."), cluster: "Core Concepts", importance: "high" as const, position: pos[0] },
    { id: "concept-2", title: mt("Machine Learning"), summary: mt("Systems that learn from data."), cluster: "Fundamentals", importance: "high" as const, position: pos[1] },
    { id: "concept-3", title: mt("Deep Learning"), summary: mt("Neural networks with many layers."), cluster: "Fundamentals", importance: "high" as const, position: pos[2] },
    { id: "concept-4", title: mt("Natural Language Processing"), summary: mt("AI that understands language."), cluster: "Applications", importance: "medium" as const, position: pos[3] },
    { id: "concept-5", title: mt("Computer Vision"), summary: mt("AI that interprets images."), cluster: "Applications", importance: "medium" as const, position: pos[4] },
    { id: "concept-6", title: mt("AI Ethics"), summary: mt("Fairness and responsibility in AI."), cluster: "Ethics & Society", importance: "high" as const, position: pos[5] },
    { id: "concept-7", title: mt("Reinforcement Learning"), summary: mt("Learning through rewards."), cluster: "Fundamentals", importance: "medium" as const, position: pos[6] },
    { id: "concept-8", title: mt("Neural Networks"), summary: mt("Layers that work like a brain to find patterns."), cluster: "Fundamentals", importance: "medium" as const, position: pos[7] },
    { id: "concept-9", title: mt("Training Data"), summary: mt("Examples used to teach models."), cluster: "Process", importance: "medium" as const, position: pos[8] },
    { id: "concept-10", title: mt("Inference"), summary: mt("Using a trained model on new data."), cluster: "Process", importance: "low" as const, position: pos[9] },
  ].map((c) => ({
    ...c,
    sourceExcerpt: mt(`Key idea: ${c.title.en} — ${c.summary.en}`),
  }));

  return {
    id: DEMO_ROOM_ID,
    title: mt("Introduction to Artificial Intelligence"),
    summary: mt("Explore AI fundamentals, machine learning, applications, and ethics in a spatial memory palace."),
    concepts,
    relationships: [
      { source: "concept-1", target: "concept-2", label: "includes" },
      { source: "concept-2", target: "concept-3", label: "uses" },
      { source: "concept-3", target: "concept-8", label: "built on" },
      { source: "concept-1", target: "concept-4", label: "enables" },
      { source: "concept-1", target: "concept-5", label: "enables" },
      { source: "concept-1", target: "concept-6", label: "requires" },
      { source: "concept-2", target: "concept-7", label: "includes" },
      { source: "concept-2", target: "concept-9", label: "needs" },
      { source: "concept-9", target: "concept-10", label: "leads to" },
    ],
    studyGuide: {
      overview: mt("A demo palace mapping the landscape of modern AI."),
      keyPoints: concepts.slice(0, 5).map((c) => mt(`${c.title.en}: ${c.summary.en}`)),
      questions: [mt("What is the relationship between AI and ML?"), mt("Why is AI ethics important?")],
      flashcards: concepts.slice(0, 4).map((c, i) => ({
        id: `dfc-${i}`,
        front: c.title,
        back: c.summary,
        conceptId: c.id,
      })),
    },
    flashcards: concepts.map((c, i) => ({
      id: `dfc-${i}`,
      front: c.title,
      back: c.summary,
      conceptId: c.id,
    })),
    practiceQuestions: [
      {
        id: "dq1",
        type: "short-answer",
        question: mt("What is machine learning?"),
        answer: "learning from data",
        explanation: mt("ML learns patterns from data without explicit rules."),
        difficulty: "easy",
        hints: [mt("Think about data and patterns.")],
      },
    ],
    memoryRoute: concepts.filter((c) => c.importance !== "low").map((c, i) => ({
      step: i + 1,
      conceptId: c.id,
      title: c.title,
      explanation: c.summary,
      reason: mt(`Start here to build your AI mental model.`),
    })),
    createdAt: new Date().toISOString(),
    isDemo: true,
  };
}

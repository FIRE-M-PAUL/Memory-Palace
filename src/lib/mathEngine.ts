import type { EducationLevel } from "@/types/learning";
import { mt } from "@/lib/multilingual";

export type MathTopic =
  | "addition"
  | "fractions"
  | "linear-equations"
  | "quadratic-equations"
  | "calculus-basics";

export interface MathProblem {
  id: string;
  level: EducationLevel;
  topic: MathTopic;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  answer: string;
  hints: string[];
  steps: string[];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMathProblem(
  level: EducationLevel,
  topic: MathTopic,
  difficulty: "easy" | "medium" | "hard" = "medium"
): MathProblem {
  const id = `math-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  if (topic === "addition" || level === "grade-1") {
    const a = randInt(1, difficulty === "easy" ? 10 : 20);
    const b = randInt(1, difficulty === "easy" ? 10 : 20);
    return {
      id,
      level: "grade-1",
      topic: "addition",
      difficulty,
      question: `${a} + ${b} = ?`,
      answer: String(a + b),
      hints: [`Start with ${a}, then count up ${b} more.`, `You can use objects to count.`],
      steps: [`Add the two numbers: ${a} + ${b}`, `Result = ${a + b}`],
    };
  }

  if (topic === "fractions" || level === "grade-4") {
    const d = randInt(2, 8);
    const n1 = randInt(1, d - 1);
    const n2 = randInt(1, d - 1);
    return {
      id,
      level: "grade-4",
      topic: "fractions",
      difficulty,
      question: `${n1}/${d} + ${n2}/${d} = ? (give as fraction like a/b)`,
      answer: `${n1 + n2}/${d}`,
      hints: [`Same denominator ${d} — add numerators.`, `${n1} + ${n2} = ${n1 + n2}`],
      steps: [
        `Same denominator: ${d}`,
        `Add numerators: ${n1} + ${n2} = ${n1 + n2}`,
        `Answer: ${n1 + n2}/${d}`,
      ],
    };
  }

  if (topic === "linear-equations" || level === "grade-8") {
    const x = randInt(1, 12);
    const a = randInt(2, 5);
    const b = randInt(1, 10);
    const c = a * x + b;
    return {
      id,
      level: "grade-8",
      topic: "linear-equations",
      difficulty,
      question: `Solve for x: ${a}x + ${b} = ${c}`,
      answer: String(x),
      hints: [`Subtract ${b} from both sides.`, `Divide both sides by ${a}.`],
      steps: [
        `${a}x = ${c} - ${b} = ${c - b}`,
        `x = ${c - b} / ${a}`,
        `x = ${x}`,
      ],
    };
  }

  if (topic === "quadratic-equations" || level === "grade-10") {
    const r1 = randInt(1, 6);
    const r2 = randInt(1, 6);
    const b = -(r1 + r2);
    const c = r1 * r2;
    const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    return {
      id,
      level: "grade-10",
      topic: "quadratic-equations",
      difficulty,
      question: `Solve: x² ${bStr}x + ${c} = 0 (smaller root)`,
      answer: String(Math.min(r1, r2)),
      hints: [`Factor: (x - ${r1})(x - ${r2}) = 0`, `Roots are x = ${r1} and x = ${r2}`],
      steps: [
        `Factorise: (x - ${r1})(x - ${r2}) = 0`,
        `x = ${r1} or x = ${r2}`,
        `Smaller root: ${Math.min(r1, r2)}`,
      ],
    };
  }

  // calculus basics
  return {
    id,
    level: "university-year-1",
    topic: "calculus-basics",
    difficulty,
    question: "Find the derivative of f(x) = x²",
    answer: "2x",
    hints: ["Use the power rule: d/dx(x^n) = n·x^(n-1)", "Here n = 2"],
    steps: ["f(x) = x²", "f'(x) = 2x^(2-1) = 2x"],
  };
}

export function checkMathAnswer(problem: MathProblem, userAnswer: string): boolean {
  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/x\s*\*\s*2/g, "2x");
  return normalize(userAnswer) === normalize(problem.answer);
}

export function getMathHint(problem: MathProblem, hintIndex = 0): string {
  return problem.hints[Math.min(hintIndex, problem.hints.length - 1)] ?? problem.hints[0];
}

export function getStepByStepSolution(problem: MathProblem): string[] {
  return problem.steps;
}

export function topicForLevel(level: EducationLevel): MathTopic {
  if (level === "grade-1" || level === "grade-2" || level === "grade-3") return "addition";
  if (level === "grade-4" || level === "grade-5" || level === "grade-6") return "fractions";
  if (level === "grade-7" || level === "grade-8" || level === "grade-9") return "linear-equations";
  if (level === "grade-10" || level === "grade-11" || level === "grade-12")
    return "quadratic-equations";
  return "calculus-basics";
}

export function mathProblemToPractice(problem: MathProblem) {
  return {
    id: problem.id,
    type: "math-input" as const,
    question: mt(problem.question),
    answer: problem.answer,
    explanation: mt(problem.steps.join("\n")),
    difficulty: problem.difficulty,
    hints: problem.hints.map((h) => mt(h)),
  };
}

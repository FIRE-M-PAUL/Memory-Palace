import type { Lesson } from "@/types/curriculum";
import { mt } from "@/lib/multilingual";
import { buildLesson } from "./lessonBuilder";

const q = (
  id: string,
  question: string,
  answer: string,
  explanation: string,
  hints: string[] = []
) => ({
  id,
  type: "short-answer" as const,
  question: mt(question),
  answer: answer.toLowerCase(),
  explanation: mt(explanation),
  difficulty: "medium" as const,
  hints: hints.map((h) => mt(h)),
});

const fc = (id: string, front: string, back: string, conceptId?: string) => ({
  id,
  front: mt(front),
  back: mt(back),
  conceptId,
});

export const BUILT_IN_LESSONS: Lesson[] = [
  buildLesson({
    id: "beginner-addition",
    title: mt("Addition", { sw: "Kuongeza", bem: "Kukonkesha", nya: "Kuwerengera" }),
    subject: "mathematics",
    difficulty: "beginner",
    overview: mt(
      "Addition means putting numbers together to find how many in total. It is one of the first maths skills learners master.",
      { sw: "Kuongeza ni kuweka namba pamoja kupata jumla.", bem: "Ukukonkesha kuleta amanamba pamodzi." }
    ),
    conceptData: [
      { title: mt("Addition"), summary: mt("Combining two or more numbers to get a total."), cluster: "Fundamentals", importance: "high" },
      { title: mt("Plus Sign (+)"), summary: mt("The symbol that tells us to add."), cluster: "Fundamentals" },
      { title: mt("Sum"), summary: mt("The answer after adding numbers."), cluster: "Core Concepts" },
      { title: mt("Counting On"), summary: mt("Start from the bigger number and count forward."), cluster: "Process" },
      { title: mt("Number Line"), summary: mt("A line that helps visualize addition."), cluster: "Applications" },
      { title: mt("Word Problems"), summary: mt("Stories that ask us to add objects."), cluster: "Examples" },
    ],
    relationshipPairs: [[0, 1, "uses"], [0, 2, "produces"], [3, 0, "helps"], [4, 3, "supports"], [5, 0, "applies"]],
    examples: [mt("2 + 3 = 5"), mt("If you have 4 apples and get 2 more, you have 6.")],
    practiceQuestions: [
      q("q1", "What is 5 + 4?", "9", "5 + 4 = 9"),
      q("q2", "What do we call the answer in addition?", "sum", "The answer is called the sum."),
    ],
    flashcards: [
      fc("f1", "What is addition?", "Putting numbers together to find a total.", "concept-1"),
      fc("f2", "What is a sum?", "The result of addition.", "concept-3"),
    ],
  }),

  buildLesson({
    id: "basic-fractions",
    title: mt("Fractions"),
    subject: "mathematics",
    difficulty: "basic",
    overview: mt("Fractions show parts of a whole. The top number is the numerator and the bottom is the denominator."),
    conceptData: [
      { title: mt("Fraction"), summary: mt("A number that represents part of a whole."), cluster: "Fundamentals", importance: "high" },
      { title: mt("Numerator"), summary: mt("The top number — how many parts we have."), cluster: "Fundamentals" },
      { title: mt("Denominator"), summary: mt("The bottom number — total equal parts."), cluster: "Fundamentals" },
      { title: mt("Equivalent Fractions"), summary: mt("Different fractions that equal the same value."), cluster: "Core Concepts" },
      { title: mt("Simplifying"), summary: mt("Reducing a fraction to lowest terms."), cluster: "Process" },
      { title: mt("Comparing Fractions"), summary: mt("Finding which fraction is larger."), cluster: "Applications" },
    ],
    relationshipPairs: [[0, 1, "has"], [0, 2, "has"], [3, 0, "relates to"], [4, 0, "transforms"], [5, 0, "uses"]],
    examples: [mt("1/2 means one of two equal parts."), mt("2/4 = 1/2")],
    practiceQuestions: [q("q1", "In 3/4, what is the numerator?", "3", "The top number is 3.")],
    flashcards: [fc("f1", "What is a fraction?", "A part of a whole.", "concept-1")],
  }),

  buildLesson({
    id: "intermediate-linear-equations",
    title: mt("Linear Equations"),
    subject: "mathematics",
    difficulty: "intermediate",
    overview: mt("A linear equation has variables raised only to the first power. Solving means finding the value of the variable."),
    conceptData: [
      { title: mt("Linear Equation"), summary: mt("An equation that graphs as a straight line."), cluster: "Fundamentals", importance: "high" },
      { title: mt("Variable"), summary: mt("A letter representing an unknown value."), cluster: "Fundamentals" },
      { title: mt("Balance Method"), summary: mt("Do the same operation to both sides."), cluster: "Process" },
      { title: mt("Slope"), summary: mt("Rate of change in a linear relationship."), cluster: "Core Concepts" },
      { title: mt("y-intercept"), summary: mt("Where the line crosses the y-axis."), cluster: "Core Concepts" },
      { title: mt("Graphing"), summary: mt("Plotting solutions on a coordinate plane."), cluster: "Applications" },
    ],
    relationshipPairs: [[0, 1, "contains"], [2, 0, "solves"], [3, 4, "defines line with"], [5, 0, "visualizes"]],
    examples: [mt("2x + 3 = 11 → x = 4")],
    practiceQuestions: [q("q1", "Solve: x + 5 = 12", "7", "x = 12 - 5 = 7")],
    flashcards: [fc("f1", "How do you keep an equation balanced?", "Do the same to both sides.", "concept-3")],
  }),

  buildLesson({
    id: "advanced-quadratic-equations",
    title: mt("Quadratic Equations"),
    subject: "mathematics",
    difficulty: "advanced",
    overview: mt("Quadratic equations include x² terms. They can be solved by factoring, completing the square, or the quadratic formula."),
    conceptData: [
      { title: mt("Quadratic Equation"), summary: mt("An equation with x² as the highest power."), cluster: "Fundamentals", importance: "high" },
      { title: mt("Parabola"), summary: mt("The U-shaped graph of a quadratic."), cluster: "Applications" },
      { title: mt("Factoring"), summary: mt("Rewriting as product of binomials."), cluster: "Process" },
      { title: mt("Quadratic Formula"), summary: mt("x = (-b ± √(b²-4ac)) / 2a"), cluster: "Core Concepts" },
      { title: mt("Discriminant"), summary: mt("b² - 4ac tells number and type of roots."), cluster: "Core Concepts" },
      { title: mt("Roots"), summary: mt("Solutions where the equation equals zero."), cluster: "Fundamentals" },
    ],
    relationshipPairs: [[0, 1, "graphs as"], [2, 0, "solves"], [3, 0, "solves"], [4, 3, "part of"], [5, 0, "are solutions of"]],
    examples: [mt("x² - 5x + 6 = 0 → (x-2)(x-3)=0")],
    practiceQuestions: [q("q1", "What shape is the graph of y = x²?", "parabola", "Quadratics form parabolas.")],
    flashcards: [fc("f1", "What is the quadratic formula used for?", "Finding roots of ax²+bx+c=0.", "concept-4")],
  }),

  buildLesson({
    id: "advanced-calculus-basics",
    title: mt("Calculus Basics"),
    subject: "mathematics",
    difficulty: "advanced",
    overview: mt("Calculus studies change. Derivatives measure rates of change; integrals measure accumulation."),
    conceptData: [
      { title: mt("Limit"), summary: mt("The value a function approaches."), cluster: "Fundamentals", importance: "high" },
      { title: mt("Derivative"), summary: mt("Instantaneous rate of change."), cluster: "Core Concepts", importance: "high" },
      { title: mt("Integral"), summary: mt("Accumulation or area under a curve."), cluster: "Core Concepts" },
      { title: mt("Power Rule"), summary: mt("d/dx(x^n) = n·x^(n-1)"), cluster: "Process" },
      { title: mt("Chain Rule"), summary: mt("Derivative of composed functions."), cluster: "Process" },
      { title: mt("Fundamental Theorem"), summary: mt("Links derivatives and integrals."), cluster: "Applications" },
    ],
    relationshipPairs: [[0, 1, "defines"], [1, 2, "inverse of"], [3, 1, "computes"], [4, 1, "extends"], [5, 1, "connects to"]],
    examples: [mt("d/dx(x³) = 3x²")],
    practiceQuestions: [q("q1", "Derivative of x²?", "2x", "Power rule: 2x^(2-1)")],
    flashcards: [fc("f1", "What does a derivative measure?", "Rate of change.", "concept-2")],
  }),

  buildLesson({
    id: "intermediate-photosynthesis",
    title: mt("Photosynthesis", { sw: "Photosynthesis", bem: "Photosynthesis" }),
    subject: "science",
    difficulty: "intermediate",
    overview: mt(
      "Photosynthesis is how green plants make food using sunlight, water, and carbon dioxide, releasing oxygen.",
      { sw: "Mimea hutengeneza chakula kwa kutumia jua, maji, na dioksidi ya kaboni." }
    ),
    conceptData: [
      { title: mt("Photosynthesis"), summary: mt("Process plants use to make glucose."), cluster: "Fundamentals", importance: "high" },
      { title: mt("Chlorophyll"), summary: mt("Green pigment that captures light."), cluster: "Fundamentals" },
      { title: mt("Sunlight"), summary: mt("Energy source for the reaction."), cluster: "Core Concepts" },
      { title: mt("Carbon Dioxide"), summary: mt("Gas absorbed from air."), cluster: "Core Concepts" },
      { title: mt("Oxygen"), summary: mt("Gas released as a byproduct."), cluster: "Applications" },
      { title: mt("Glucose"), summary: mt("Sugar produced for plant energy."), cluster: "Applications" },
    ],
    relationshipPairs: [[0, 1, "requires"], [0, 2, "powered by"], [0, 3, "uses"], [0, 4, "releases"], [0, 5, "produces"]],
    examples: [mt("6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂")],
    practiceQuestions: [q("q1", "What gas do plants release during photosynthesis?", "oxygen", "Oxygen is released.")],
    flashcards: [fc("f1", "What does chlorophyll do?", "Absorbs light energy.", "concept-2")],
  }),

  buildLesson({
    id: "advanced-electricity",
    title: mt("Electricity"),
    subject: "physics",
    difficulty: "advanced",
    overview: mt("Electricity is the flow of electric charge. Circuits need a source, conductors, and often a load."),
    conceptData: [
      { title: mt("Electric Current"), summary: mt("Flow of charge through a conductor."), cluster: "Fundamentals", importance: "high" },
      { title: mt("Voltage"), summary: mt("Electrical pressure that pushes charge."), cluster: "Fundamentals" },
      { title: mt("Resistance"), summary: mt("Opposition to current flow."), cluster: "Core Concepts" },
      { title: mt("Ohm's Law"), summary: mt("V = I × R"), cluster: "Core Concepts" },
      { title: mt("Series Circuit"), summary: mt("One path for current."), cluster: "Process" },
      { title: mt("Parallel Circuit"), summary: mt("Multiple paths for current."), cluster: "Process" },
    ],
    relationshipPairs: [[3, 0, "relates"], [3, 1, "relates"], [3, 2, "relates"], [4, 0, "arranges"], [5, 0, "arranges"]],
    examples: [mt("A 12V battery driving a 4Ω resistor: I = 3A")],
    practiceQuestions: [q("q1", "State Ohm's Law", "v=ir", "Voltage = current × resistance")],
    flashcards: [fc("f1", "What is current?", "Flow of electric charge.", "concept-1")],
  }),

  buildLesson({
    id: "basic-programming-fundamentals",
    title: mt("Programming Fundamentals"),
    subject: "programming",
    difficulty: "basic",
    overview: mt("Programming is giving instructions to a computer. Core ideas include variables, control flow, and functions."),
    conceptData: [
      { title: mt("Algorithm"), summary: mt("Step-by-step procedure to solve a problem."), cluster: "Fundamentals", importance: "high" },
      { title: mt("Variable"), summary: mt("Named storage for data."), cluster: "Fundamentals" },
      { title: mt("Conditionals"), summary: mt("if/else decisions in code."), cluster: "Process" },
      { title: mt("Loops"), summary: mt("Repeating code blocks."), cluster: "Process" },
      { title: mt("Function"), summary: mt("Reusable block of code."), cluster: "Core Concepts" },
      { title: mt("Debugging"), summary: mt("Finding and fixing errors."), cluster: "Applications" },
    ],
    relationshipPairs: [[0, 1, "uses"], [2, 0, "implements"], [3, 0, "implements"], [4, 0, "structures"], [5, 4, "maintains"]],
    examples: [mt("for (let i = 0; i < 5; i++) { print(i); }")],
    practiceQuestions: [q("q1", "What stores data in a program?", "variable", "Variables hold values.")],
    flashcards: [fc("f1", "What is an algorithm?", "Steps to solve a problem.", "concept-1")],
  }),

  buildLesson({
    id: "intermediate-databases",
    title: mt("Databases"),
    subject: "database-systems",
    difficulty: "intermediate",
    overview: mt("Databases organize data for efficient storage and retrieval. Tables, keys, and SQL are foundational."),
    conceptData: [
      { title: mt("Database"), summary: mt("Organized collection of data."), cluster: "Fundamentals", importance: "high" },
      { title: mt("Table"), summary: mt("Rows and columns of related data."), cluster: "Fundamentals" },
      { title: mt("Primary Key"), summary: mt("Unique identifier for each row."), cluster: "Core Concepts" },
      { title: mt("SQL"), summary: mt("Language to query and manage data."), cluster: "Process" },
      { title: mt("Query"), summary: mt("Request for specific data."), cluster: "Process" },
      { title: mt("Relationship"), summary: mt("Links between tables."), cluster: "Applications" },
    ],
    relationshipPairs: [[0, 1, "contains"], [1, 2, "uses"], [3, 4, "executes"], [5, 1, "connects"]],
    examples: [mt("SELECT name FROM students WHERE score > 80;")],
    practiceQuestions: [q("q1", "What uniquely identifies a row?", "primary key", "Primary keys are unique.")],
    flashcards: [fc("f1", "What is SQL?", "Structured Query Language.", "concept-4")],
  }),

  buildLesson({
    id: "expert-genetics",
    title: mt("Genetics"),
    subject: "biology",
    difficulty: "expert",
    overview: mt("Genetics studies heredity and variation. DNA carries genes that determine traits passed to offspring."),
    conceptData: [
      { title: mt("DNA"), summary: mt("Molecule storing genetic instructions."), cluster: "Fundamentals", importance: "high" },
      { title: mt("Gene"), summary: mt("Section of DNA coding for a trait."), cluster: "Fundamentals" },
      { title: mt("Chromosome"), summary: mt("Structure carrying many genes."), cluster: "Core Concepts" },
      { title: mt("Allele"), summary: mt("Different versions of a gene."), cluster: "Core Concepts" },
      { title: mt("Dominant"), summary: mt("Allele expressed when present."), cluster: "Process" },
      { title: mt("Recessive"), summary: mt("Allele expressed only if homozygous."), cluster: "Process" },
    ],
    relationshipPairs: [[0, 1, "contains"], [1, 2, "organized in"], [3, 1, "variant of"], [4, 3, "type of"], [5, 3, "type of"]],
    examples: [mt("Bb × Bb Punnett square for dominant trait B.")],
    practiceQuestions: [q("q1", "What carries genetic information?", "dna", "DNA stores genetic code.")],
    flashcards: [fc("f1", "What is a gene?", "Unit of heredity on DNA.", "concept-2")],
  }),
];

export function getLessonById(id: string): Lesson | undefined {
  return BUILT_IN_LESSONS.find((l) => l.id === id);
}

/** Resolve lesson by current or legacy id */
export function getLessonByIdOrLegacy(id: string): Lesson | undefined {
  const direct = getLessonById(id);
  if (direct) return direct;
  const legacyMap: Record<string, string> = {
    "grade-1-addition": "beginner-addition",
    "grade-4-fractions": "basic-fractions",
    "grade-8-linear-equations": "intermediate-linear-equations",
    "grade-10-quadratic": "advanced-quadratic-equations",
    "uni-1-calculus": "advanced-calculus-basics",
    "grade-8-photosynthesis": "intermediate-photosynthesis",
    "grade-10-electricity": "advanced-electricity",
    "uni-1-programming": "basic-programming-fundamentals",
    "grade-10-databases": "intermediate-databases",
    "grade-12-genetics": "expert-genetics",
  };
  const mapped = legacyMap[id];
  return mapped ? getLessonById(mapped) : undefined;
}

export function filterLessons(filters: {
  subject?: string;
  difficulty?: string;
  search?: string;
}): Lesson[] {
  return BUILT_IN_LESSONS.filter((l) => {
    if (filters.subject && filters.subject !== "all" && l.subject !== filters.subject) return false;
    if (filters.difficulty && filters.difficulty !== "all" && l.difficulty !== filters.difficulty)
      return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!l.title.en.toLowerCase().includes(s) && !l.overview.en.toLowerCase().includes(s))
        return false;
    }
    return true;
  });
}

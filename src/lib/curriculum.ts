// Draft CS scope-and-sequence for an English-medium international school, P1–S2 (ages 7–14).
// Editable: adjust topics per band to match the school's actual scheme of work.

export interface CurriculumBand {
  yearLabel: string;
  ageMin: number;
  ageMax: number;
  topics: string[];
}

export const CURRICULUM: CurriculumBand[] = [
  {
    yearLabel: "P1",
    ageMin: 7,
    ageMax: 7,
    topics: [
      "Parts of a computer",
      "Mouse and keyboard skills",
      "Following instructions in order (sequencing)",
      "Algorithms as everyday instructions",
      "Spotting patterns",
      "Being safe and kind online",
    ],
  },
  {
    yearLabel: "P2",
    ageMin: 8,
    ageMax: 8,
    topics: [
      "Sequencing and simple algorithms",
      "Introduction to block coding",
      "Repeat loops (basic)",
      "Debugging: finding and fixing mistakes",
      "Digital citizenship basics",
      "Typing skills",
    ],
  },
  {
    yearLabel: "P3",
    ageMin: 9,
    ageMax: 9,
    topics: [
      "Sprites and events (block coding)",
      "Sequences and loops in block coding",
      "Simple IF conditions",
      "Introduction to algorithms and flowcharts",
      "Internet safety and searching",
    ],
  },
  {
    yearLabel: "P4",
    ageMin: 10,
    ageMax: 10,
    topics: [
      "Variables in block coding",
      "Loops and IF-ELSE in block coding",
      "Decomposition (breaking down problems)",
      "Simple flowcharts",
      "Introduction to binary and how computers store data",
    ],
  },
  {
    yearLabel: "P5",
    ageMin: 11,
    ageMax: 11,
    topics: [
      "IF-ELSE statements",
      "Loops (for/while)",
      "Variables and operators",
      "Introduction to functions and procedures",
      "Introduction to Python syntax",
      "Sorting and searching (introduction)",
      "How the internet works",
    ],
  },
  {
    yearLabel: "P6",
    ageMin: 12,
    ageMax: 12,
    topics: [
      "Python variables and data types",
      "Input and output",
      "IF-ELIF-ELSE",
      "For loops and while loops",
      "Lists (arrays) basics",
      "Functions with parameters",
      "Debugging techniques",
      "Introduction to HTML",
    ],
  },
  {
    yearLabel: "S1",
    ageMin: 13,
    ageMax: 13,
    topics: [
      "Functions: parameters and return values",
      "Lists and dictionaries",
      "Nested loops and conditionals",
      "String manipulation",
      "Searching and sorting algorithms",
      "Pseudocode and flowcharts",
      "Reading and writing files",
      "Introduction to HTML and CSS",
    ],
  },
  {
    yearLabel: "S2",
    ageMin: 14,
    ageMax: 14,
    topics: [
      "Object-oriented programming basics (classes and objects)",
      "Recursion (introduction)",
      "Algorithm efficiency (introduction)",
      "Stacks and queues (introduction)",
      "Databases and SQL (introduction)",
      "Web development basics (HTML, CSS, JavaScript)",
      "Computational thinking and problem decomposition",
      "Mini project: build a simple program",
    ],
  },
];

export function getTopicsForAge(age: number): string[] {
  const band = CURRICULUM.find((b) => age >= b.ageMin && age <= b.ageMax);
  return band ? band.topics : [];
}

export function getYearLabelForAge(age: number): string {
  const band = CURRICULUM.find((b) => age >= b.ageMin && age <= b.ageMax);
  return band ? band.yearLabel : "";
}

export const YEAR_LABELS = CURRICULUM.map((b) => b.yearLabel);

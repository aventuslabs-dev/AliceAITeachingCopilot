import { Homework, LessonPlan, LessonPlanRequest, ScheduleBlock, Worksheet } from "./types";

function isYoung(age: number) {
  return age <= 9;
}

// Approximates the school's "Year" numbering used on its worksheet template (Year 7 ≈ age 11).
function yearLabelFor(age: number) {
  return `Year ${Math.max(1, age - 4)}`;
}

/** Deterministic pick so the same topic always gets the same scenario/vocab flavour. */
function pick<T>(list: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return list[hash % list.length];
}

/**
 * A relatable scenario the placeholder content hangs its examples on, by age band.
 * Deliberately game/maze/adventure flavoured to match the school's existing worksheet
 * style (see public/*.docx: lava, coins, walls, mazes) — keep new entries in that spirit
 * so generated and hand-made worksheets feel like one family.
 */
const YOUNG_SCENARIOS = [
  "a game character named Pixel collecting coins in the right order",
  "training a robot dog to sit, fetch and roll over",
  "following a treasure map to find hidden gold, avoiding the lava",
  "making the perfect peanut butter and jelly sandwich",
  "getting a superhero ready before they save the day",
  "throwing a pretend pizza party for a room full of stuffed animals",
  "helping a maze-runner avoid walls and reach the exit door",
  "leveling up a dragon by feeding it the right snacks in order",
];

const OLDER_SCENARIOS = [
  "planning a penalty shoot-out strategy for a football match",
  "programming a robot vacuum to clean a messy bedroom",
  "building a daily login streak for a mobile game",
  "planning the ultimate movie marathon night, snacks included",
  "designing an escape-room puzzle for friends to solve",
  "auto-generating the perfect road-trip playlist",
  "designing the rules for a battle royale game so no one can cheat",
  "scripting an NPC's decisions in an open-world game",
];

/** Best-effort keyword match so vocabulary at least loosely tracks the topic. */
const VOCAB_BANK: { match: RegExp; young: string[]; older: string[] }[] = [
  {
    match: /loop|repeat|iterat/i,
    young: ["loop (循环)", "repeat (重复)", "count (数一数)"],
    older: ["loop", "iteration", "repeat until", "counter"],
  },
  {
    match: /variable|data type|value/i,
    young: ["variable (变量)", "box (盒子)", "value (数值)"],
    older: ["variable", "value", "assign", "data type"],
  },
  {
    match: /condition|if|else|branch|decision/i,
    young: ["condition (条件)", "true / false (真 / 假)", "decision (决定)"],
    older: ["condition", "boolean", "branch", "logic flow"],
  },
  {
    match: /function|method|procedure/i,
    young: ["function (功能)", "input (输入)", "output (输出)"],
    older: ["function", "parameter", "return value", "reusable"],
  },
  {
    match: /algorithm|sequence|order|step/i,
    young: ["algorithm (算法)", "step (步骤)", "in order (按顺序)"],
    older: ["algorithm", "sequence", "step-by-step", "precise"],
  },
  {
    match: /debug|error|bug|fix/i,
    young: ["bug (小虫子/错误)", "fix (修复)", "test (测试)"],
    older: ["bug", "debug", "error", "trace"],
  },
];

/**
 * "Reorder the jumbled steps" only fits sequence-shaped topics (algorithms, loops).
 * Decision-shaped topics (logic, rules, reasoning) read better as a dilemma with a
 * forced choice — modelled on public/Y6 Logic Worksheet.docx (rain + umbrella/phone/
 * water bottle; lava-path A vs B) and public/Y6 Rules Worksheet.docx.
 */
const DECISION_TOPIC = /logic|reasoning|deduc|rule|judg|decision.?mak/i;

const DECISION_DILEMMAS = [
  {
    setup:
      "You're walking home from school when it suddenly starts raining. You're carrying an umbrella, a phone, and a water bottle.",
    question: "What would you do?",
  },
  {
    setup:
      "In a game, you're not allowed to touch the lava. Path A is shorter but runs straight through the lava. Path B is longer but completely safe.",
    question: "Which path would you choose?",
  },
  {
    setup:
      "Your game character can only carry 2 items, but there are 3 useful ones nearby: a shield, a healing potion, and a map.",
    question: "Which 2 items would you pick?",
  },
  {
    setup:
      "You're the last one awake in your dorm and you really want a midnight snack, but there's a rule: no leaving your room after lights-out.",
    question: "What would you do?",
  },
];

function dilemmaFor(topic: string) {
  return pick(DECISION_DILEMMAS, topic);
}

function vocabularyFor(topic: string, young: boolean): string[] {
  const entry = VOCAB_BANK.find((v) => v.match.test(topic));
  if (entry) return young ? entry.young : entry.older;
  return young
    ? [`${topic} (关键词)`, "try it out (试一试)", "check (检查一下)"]
    : [topic, "practice", "review", "apply"];
}

/**
 * Prototype-only stand-in for the real AI call. Shapes output based on age
 * and topic so the UI can be evaluated with realistic-looking content before
 * the Claude API is wired in. Assumes a fixed 60-minute lesson.
 */
export async function generateLessonPlan(
  request: LessonPlanRequest
): Promise<LessonPlan> {
  await new Promise((r) => setTimeout(r, 1400));

  const young = isYoung(request.age);
  const topic = request.topic.trim() || "Today's topic";
  const scenario = pick(young ? YOUNG_SCENARIOS : OLDER_SCENARIOS, topic);
  const vocabulary = vocabularyFor(topic, young);
  const isDecisionTopic = DECISION_TOPIC.test(topic);
  const dilemma = dilemmaFor(topic);

  const objectives = [
    young
      ? `Explain "${topic}" in your own words, using ${scenario} as the example`
      : `Explain the purpose and structure of ${topic}, using ${scenario} as a running example`,
    `Write a correct example of ${topic}${young ? ", with guidance" : " independently"}`,
    young
      ? "Use the new English vocabulary correctly in a full sentence"
      : "Spot a common mistake in someone else's example and fix it",
  ];

  const schedule: ScheduleBlock[] = [
    {
      startMinute: 0,
      endMinute: 10,
      type: "warmup",
      title: "Warm-up & hook",
      description: young
        ? `Quick game: act out ${scenario} as a class, calling out each step out loud before we connect it to ${topic}.`
        : `60-second challenge: in pairs, students race to put the steps of ${scenario} in order, then we connect it to ${topic}.`,
    },
    {
      startMinute: 10,
      endMinute: 25,
      type: "teaching",
      title: "Direct teaching",
      description: `Introduce ${topic} through ${scenario}, show the minimal syntax/structure one piece at a time, and live-model one worked example on the board (bilingual key-term callout for new vocabulary).`,
    },
    {
      startMinute: 25,
      endMinute: 50,
      type: "exercise",
      title: "Worksheet — guided then independent practice",
      description: young
        ? `Students work through the worksheet: start with a fill-in-the-blank ${topic} example built around ${scenario}, then try one small original example on their own while the teacher circulates.`
        : `Students work through the worksheet independently: apply ${topic} to 2–3 problems of increasing difficulty inspired by ${scenario}, checking with a partner before asking the teacher.`,
    },
    {
      startMinute: 50,
      endMinute: 58,
      type: "wrapup",
      title: "Wrap-up & recap",
      description: young
        ? `Ask 2–3 students to explain ${topic} back in their own words (English), using ${scenario} again, then reward participation points.`
        : `Cold-call recap: what's the key rule of ${topic}? Address one common mistake seen during practice.`,
    },
    {
      startMinute: 58,
      endMinute: 60,
      type: "wrapup",
      title: "Assign homework",
      description: "Briefly explain the homework task and submission format (name, class, date).",
    },
  ];

  const worksheet: Worksheet = {
    yearLabel: yearLabelFor(request.age),
    questions: [
      {
        stars: 1,
        prompt: young
          ? `In your own words, explain ${topic}. Use ${scenario} to help — no boring definitions allowed!`
          : `Explain ${topic} in your own words, using ${scenario} as your example.`,
        responseLines: 4,
      },
      {
        stars: 2,
        prompt: isDecisionTopic
          ? young
            ? `${dilemma.setup} ${dilemma.question} Explain your ${topic} — why did you choose that?`
            : `${dilemma.setup} ${dilemma.question} Explain the ${topic} behind your decision.`
          : young
          ? `Uh-oh — the steps for ${scenario} got mixed up! Put them back in order (1, 2, 3...) so ${topic} works properly.`
          : `The steps below for ${scenario} are jumbled. Identify which steps use ${topic} and rewrite them in the correct order.`,
        responseLines: 5,
      },
      {
        stars: 3,
        prompt: young
          ? `Time to go on a hunt! Think of a different game, toy, or story where ${topic} shows up too, and explain how.`
          : `Level up: compare a simple and a trickier use of ${topic}. Give one example of each, one of them inspired by ${scenario}.`,
        responseLines: 4,
      },
      {
        stars: 4,
        prompt: young
          ? `Big challenge! A character in ${scenario} has a huge decision to make using ${topic}. What would you tell them to do, step by step?`
          : `Design a brand-new scenario (game, app, or sport) that needs ${topic} to make a decision. Explain your reasoning, then write the steps.`,
        responseLines: 5,
      },
    ],
    remember: young
      ? [`Using ${topic} helps us make good decisions, just like in ${scenario}!`, "Follow the steps in order — no skipping!", "Read your answer back to check it makes sense."]
      : [`Using ${topic} lets a program choose between outcomes.`, "The order of steps changes the result.", "Always trace through an example before trusting it."],
  };

  const homework: Homework = {
    questions: [
      {
        stars: 1,
        prompt: young
          ? `In one sentence, remind yourself about ${topic} — pretend you're teaching it to a friend who missed class!`
          : `In one sentence, remind yourself about ${topic} — pretend you're explaining it to a friend who missed class.`,
        responseLines: 3,
      },
      {
        stars: 2,
        prompt: young
          ? `Go on a mission at home: spot one example of ${topic} in a game you play or something around the house (not ${scenario}), and describe it.`
          : `Give one new real-world example of ${topic}, different from ${scenario}, and explain why it fits.`,
        responseLines: 4,
      },
      {
        stars: 3,
        prompt: young
          ? `Invent a brand-new mini-adventure (not ${scenario}). Show, step by step, how ${topic} saves the day.`
          : `Challenge round: solve this ${topic} problem step by step, showing your working. Apply it to a scenario your teacher did not cover in the lesson.`,
        responseLines: 5,
      },
      {
        stars: 4,
        prompt: young
          ? `You're the game designer now! Create your own game level or story that needs ${topic} to work. Draw or describe it, then explain your trickiest decision.`
          : `Design your own scenario that needs ${topic} to solve, then solve it and explain any tricky decisions you made.`,
        responseLines: 6,
      },
    ],
    hints: young
      ? [`Look back at your worksheet notes on ${topic} if you get stuck.`, "Try saying your answer out loud before writing it.", "It's okay to ask a family member to read the question with you."]
      : [`Re-read the worked example from class before starting the harder questions.`, "Break the problem into smaller steps if you're stuck.", "Check your answer against the 'Remember' box from the worksheet."],
  };

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    request,
    durationMinutes: 60,
    objectives,
    vocabulary,
    schedule,
    worksheet,
    homework,
  };
}

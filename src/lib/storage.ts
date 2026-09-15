import { CURRICULUM } from "./curriculum";
import { CurriculumTopic, LessonPlan } from "./types";

const STORAGE_KEY = "edutech.lessonPlans";
const CURRICULUM_STORAGE_KEY = "edutech.curriculumTopics";

export function loadLessonPlans(): LessonPlan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LessonPlan[]) : [];
  } catch {
    return [];
  }
}

export function saveLessonPlan(plan: LessonPlan): LessonPlan[] {
  const plans = [plan, ...loadLessonPlans().filter((p) => p.id !== plan.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  return plans;
}

export function deleteLessonPlan(id: string): LessonPlan[] {
  const plans = loadLessonPlans().filter((p) => p.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  return plans;
}

// Seed data for a first-ever load: flatten the draft scope-and-sequence into rows.
function seedCurriculumTopics(): CurriculumTopic[] {
  return CURRICULUM.flatMap((band, bandIndex) =>
    band.topics.map((topic, topicIndex) => ({
      id: `seed-${bandIndex}-${topicIndex}`,
      yearLabel: band.yearLabel,
      topic,
    }))
  );
}

export function loadCurriculumTopics(): CurriculumTopic[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CURRICULUM_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CurriculumTopic[];
    const seeded = seedCurriculumTopics();
    window.localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return [];
  }
}

export function saveCurriculumTopic(topic: CurriculumTopic): CurriculumTopic[] {
  const topics = [...loadCurriculumTopics().filter((t) => t.id !== topic.id), topic];
  window.localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(topics));
  return topics;
}

export function deleteCurriculumTopic(id: string): CurriculumTopic[] {
  const topics = loadCurriculumTopics().filter((t) => t.id !== id);
  window.localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(topics));
  return topics;
}

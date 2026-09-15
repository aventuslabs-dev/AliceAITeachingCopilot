export interface LessonPlanRequest {
  topic: string;
  age: number;
  notes?: string;
}

export interface WorksheetQuestion {
  stars: 1 | 2 | 3 | 4;
  prompt: string;
  responseLines: number;
}

export interface Worksheet {
  yearLabel: string;
  questions: WorksheetQuestion[];
  remember: string[];
}

export interface Homework {
  questions: WorksheetQuestion[];
  hints: string[];
}

export type BlockType = "warmup" | "teaching" | "exercise" | "wrapup";

export interface ScheduleBlock {
  startMinute: number;
  endMinute: number;
  type: BlockType;
  title: string;
  description: string;
}

export interface LessonPlan {
  id: string;
  createdAt: string;
  request: LessonPlanRequest;
  durationMinutes: number;
  objectives: string[];
  vocabulary: string[];
  schedule: ScheduleBlock[];
  worksheet: Worksheet;
  homework: Homework;
}

export const MIN_AGE = 7;
export const MAX_AGE = 14;

export interface CurriculumTopic {
  id: string;
  yearLabel: string;
  topic: string;
}

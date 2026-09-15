"use client";

import { useState } from "react";
import { BoltIcon, ListIcon } from "@/icons";
import Badge from "@/components/ui/badge/Badge";
import TopicPickerModal from "@/components/TopicPickerModal";
import { getYearLabelForAge } from "@/lib/curriculum";
import { LessonPlanRequest, MAX_AGE, MIN_AGE } from "@/lib/types";

interface Props {
  onGenerate: (request: LessonPlanRequest) => void;
  isGenerating: boolean;
  topicFromPicker?: { topic: string; id: number } | null;
  onAgeChange?: (age: number) => void;
}

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400";

export default function LessonPlannerForm({
  onGenerate,
  isGenerating,
  topicFromPicker,
  onAgeChange,
}: Props) {
  const [topic, setTopic] = useState("Logic");
  const [age, setAge] = useState(11);
  const [notes, setNotes] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [lastPickedId, setLastPickedId] = useState(0);

  // Adjust state during render when the sidebar's curriculum browser picks a topic.
  if (topicFromPicker && topicFromPicker.id !== lastPickedId) {
    setLastPickedId(topicFromPicker.id);
    setTopic(topicFromPicker.topic);
  }

  function handleAge(next: number) {
    setAge(next);
    onAgeChange?.(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ topic: topic.trim(), age, notes: notes.trim() || undefined });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3 px-6 py-5">
        <div>
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Plan a lesson</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Topic and student age &rarr; a full 60-minute plan.
          </p>
        </div>
        <Badge color="primary" size="sm">
          {getYearLabelForAge(age)}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">
        <div className="space-y-5">
          <div>
            <label htmlFor="topic" className={labelClass}>
              Topic
            </label>
            <div className="flex gap-2">
              <input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Logic"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                aria-label="Browse curriculum topics"
                title="Browse curriculum topics"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
              >
                <ListIcon className="size-5" />
              </button>
            </div>
          </div>

          <TopicPickerModal
            open={pickerOpen}
            initialYearLabel={getYearLabelForAge(age)}
            onClose={() => setPickerOpen(false)}
            onSelect={setTopic}
          />

          <div>
            <label htmlFor="age" className={labelClass}>
              Student age
              <span className="ml-1 font-semibold text-brand-500">{age}</span>
            </label>
            <input
              id="age"
              type="range"
              min={MIN_AGE}
              max={MAX_AGE}
              step={1}
              value={age}
              onChange={(e) => handleAge(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 accent-brand-500 dark:bg-gray-800"
            />
            <div className="mt-2 flex justify-between text-theme-xs text-gray-500 dark:text-gray-400">
              <span>{MIN_AGE} (P1)</span>
              <span>{MAX_AGE} (S2)</span>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className={labelClass}>
              Notes for the AI <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. this class struggled with loops last week, match my usual rubric format..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
          >
            <BoltIcon className={`size-5 ${isGenerating ? "animate-pulse" : ""}`} />
            {isGenerating ? "Generating…" : "Generate lesson plan"}
          </button>
        </div>
      </form>
    </div>
  );
}

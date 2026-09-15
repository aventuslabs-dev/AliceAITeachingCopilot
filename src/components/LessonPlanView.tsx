"use client";

import { useState } from "react";
import {
  BookmarkIcon,
  CheckLineIcon,
  DownloadIcon,
  LightbulbIcon,
  PlusIcon,
  TimeIcon,
  TrashBinIcon,
} from "@/icons";
import Badge from "@/components/ui/badge/Badge";
import { BlockType, LessonPlan, ScheduleBlock, WorksheetQuestion } from "@/lib/types";
import { downloadHomeworkDocx, downloadWorksheetDocx } from "@/lib/exportDocx";
import { downloadBriefingPdf } from "@/lib/exportPdf";

interface Props {
  plan: LessonPlan;
  onChange: (plan: LessonPlan) => void;
  onSave: () => void;
  saved: boolean;
}

function StarRating({ value, onChange }: { value: 1 | 2 | 3 | 4; onChange: (v: 1 | 2 | 3 | 4) => void }) {
  return (
    <div className="flex shrink-0 gap-0.5">
      {([1, 2, 3, 4] as const).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star`}
          className="text-warning-500 transition-colors hover:text-warning-600"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill={n <= value ? "currentColor" : "none"}>
            <path
              d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L12 16.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L12 3.5z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

const blockColor: Record<BlockType, string> = {
  warmup: "border-blue-light-500/30 bg-blue-light-50 dark:bg-blue-light-500/10",
  teaching: "border-brand-500/25 bg-brand-50 dark:bg-brand-500/10",
  exercise: "border-success-500/25 bg-success-50 dark:bg-success-500/10",
  wrapup: "border-warning-500/25 bg-warning-50 dark:bg-warning-500/10",
};

const blockDot: Record<BlockType, string> = {
  warmup: "bg-blue-light-500",
  teaching: "bg-brand-500",
  exercise: "bg-success-500",
  wrapup: "bg-warning-500",
};

const blockLabel: Record<BlockType, string> = {
  warmup: "Warm-up",
  teaching: "Teaching",
  exercise: "Exercise",
  wrapup: "Wrap-up",
};

const fieldClass =
  "w-full resize-none rounded-lg border border-transparent bg-transparent px-3 py-2 text-theme-sm text-gray-800 transition-colors outline-hidden hover:border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:text-white/90 dark:hover:border-gray-700 dark:focus:border-brand-800";

function EditableList({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-4 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
          <textarea
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            rows={1}
            className={fieldClass}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            aria-label="Remove"
            className="mt-2 shrink-0 text-gray-400 transition-colors hover:text-error-500"
          >
            <TrashBinIcon className="size-5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="ml-3.5 flex w-fit items-center gap-1.5 text-theme-sm font-medium text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400"
      >
        <PlusIcon className="size-3 fill-current" /> {placeholder ?? "Add item"}
      </button>
    </div>
  );
}

function QuestionBlock({
  index,
  question,
  onChange,
}: {
  index: number;
  question: WorksheetQuestion;
  onChange: (next: WorksheetQuestion) => void;
}) {
  return (
    <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-theme-xs font-semibold text-white">
          {index + 1}
        </span>
        <StarRating value={question.stars} onChange={(stars) => onChange({ ...question, stars })} />
      </div>
      <textarea
        value={question.prompt}
        onChange={(e) => onChange({ ...question, prompt: e.target.value })}
        rows={2}
        className={fieldClass}
      />
      <div className="mt-2 flex flex-col gap-2 px-3">
        {Array.from({ length: question.responseLines }).map((_, lineIdx) => (
          <div key={lineIdx} className="h-px w-full bg-gray-200 dark:bg-gray-800" />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-2 px-3">
        <label className="text-theme-xs text-gray-500 dark:text-gray-400">Response lines</label>
        <input
          type="number"
          min={2}
          max={8}
          value={question.responseLines}
          onChange={(e) => onChange({ ...question, responseLines: Number(e.target.value) })}
          className="h-8 w-16 rounded-lg border border-gray-300 bg-transparent px-2 text-theme-xs text-gray-700 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-700 dark:text-gray-400"
        />
      </div>
    </div>
  );
}

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">{title}</h3>
        {action}
      </div>
      <div className="border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">{children}</div>
    </section>
  );
}

function OutlineButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-theme-sm text-gray-700 ring-1 ring-gray-300 transition ring-inset hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 print:hidden dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
    >
      <DownloadIcon className="size-5 fill-current" />
      {label}
    </button>
  );
}

export default function LessonPlanView({ plan, onChange, onSave, saved }: Props) {
  const [exportingDocx, setExportingDocx] = useState<"worksheet" | "homework" | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  async function handleDownloadBriefingPdf() {
    setExportingPdf(true);
    try {
      await downloadBriefingPdf(plan);
    } finally {
      setExportingPdf(false);
    }
  }

  async function handleDownloadWorksheetDocx() {
    setExportingDocx("worksheet");
    try {
      await downloadWorksheetDocx(plan);
    } finally {
      setExportingDocx(null);
    }
  }

  async function handleDownloadHomeworkDocx() {
    setExportingDocx("homework");
    try {
      await downloadHomeworkDocx(plan);
    } finally {
      setExportingDocx(null);
    }
  }

  function updateBlock(index: number, next: ScheduleBlock) {
    const schedule = [...plan.schedule];
    schedule[index] = next;
    onChange({ ...plan, schedule });
  }

  function updateBlockDuration(index: number, newDuration: number) {
    const duration = Math.max(1, Math.round(newDuration) || 1);
    const schedule = plan.schedule.map((block, i) => {
      if (i !== index) return block;
      return { ...block, endMinute: block.startMinute + duration };
    });
    for (let i = index + 1; i < schedule.length; i++) {
      const prevEnd = schedule[i - 1].endMinute;
      const blockDuration = schedule[i].endMinute - schedule[i].startMinute;
      schedule[i] = { ...schedule[i], startMinute: prevEnd, endMinute: prevEnd + blockDuration };
    }
    const totalMinutes = schedule.length > 0 ? schedule[schedule.length - 1].endMinute : plan.durationMinutes;
    onChange({ ...plan, schedule, durationMinutes: totalMinutes });
  }

  function updateQuestion(index: number, next: WorksheetQuestion) {
    const questions = [...plan.worksheet.questions];
    questions[index] = next;
    onChange({ ...plan, worksheet: { ...plan.worksheet, questions } });
  }

  function updateHomeworkQuestion(index: number, next: WorksheetQuestion) {
    const questions = [...plan.homework.questions];
    questions[index] = next;
    onChange({ ...plan, homework: { ...plan.homework, questions } });
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Plan header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {plan.request.topic}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-theme-sm text-gray-500 dark:text-gray-400">
            <TimeIcon className="size-4" /> Age {plan.request.age} &middot; {plan.durationMinutes} min
            lesson
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <OutlineButton
            label={exportingPdf ? "Preparing..." : "Export PDF"}
            onClick={handleDownloadBriefingPdf}
            disabled={exportingPdf}
          />
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
          >
            {saved && <CheckLineIcon className="size-4" />}
            {saved ? "Saved" : "Save to library"}
          </button>
        </div>
      </div>

      <Card title="Learning objectives">
        <EditableList
          items={plan.objectives}
          onChange={(objectives) => onChange({ ...plan, objectives })}
          placeholder="Add objective"
        />
      </Card>

      <Card title="Key vocabulary">
        <EditableList
          items={plan.vocabulary}
          onChange={(vocabulary) => onChange({ ...plan, vocabulary })}
          placeholder="Add term"
        />
      </Card>

      <Card title={`${plan.durationMinutes}-minute breakdown`}>
        <div className="flex flex-col gap-3">
          {plan.schedule.map((block, i) => (
            <div key={i} className={`flex gap-4 rounded-xl border p-4 ${blockColor[block.type]}`}>
              <div className="flex w-20 shrink-0 flex-col items-start pt-1">
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${blockDot[block.type]}`} />
                  <span className="text-theme-xs font-medium text-gray-800 dark:text-white/90">
                    {blockLabel[block.type]}
                  </span>
                </span>
                <span className="mt-1.5 text-theme-sm font-semibold text-gray-800 dark:text-white/90">
                  {block.startMinute}&ndash;{block.endMinute}
                </span>
                <div className="mt-2 flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={block.endMinute - block.startMinute}
                    onChange={(e) => updateBlockDuration(i, Number(e.target.value))}
                    className="h-7 w-12 rounded-lg border border-gray-300 bg-white/70 px-1.5 text-theme-xs text-gray-700 focus:border-brand-300 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400"
                  />
                  <span className="text-theme-xs text-gray-500 dark:text-gray-400">min</span>
                </div>
              </div>
              <div className="flex-1">
                <input
                  value={block.title}
                  onChange={(e) => updateBlock(i, { ...block, title: e.target.value })}
                  className={`${fieldClass} font-semibold`}
                />
                <textarea
                  value={block.description}
                  onChange={(e) => updateBlock(i, { ...block, description: e.target.value })}
                  rows={2}
                  className={`${fieldClass} text-gray-500 dark:text-gray-400`}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Worksheet"
        action={
          <OutlineButton
            label={exportingDocx === "worksheet" ? "Preparing..." : "Download DOCX"}
            onClick={handleDownloadWorksheetDocx}
            disabled={exportingDocx === "worksheet"}
          />
        }
      >
        <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
          <p className="text-center text-theme-sm font-semibold tracking-wide text-gray-800 dark:text-white/90">
            {plan.request.topic.toUpperCase()}
          </p>
          <p className="mt-0.5 text-center text-theme-sm text-gray-500 dark:text-gray-400">Worksheet</p>
          <div className="mt-5 flex flex-wrap gap-8 text-theme-sm text-gray-500 dark:text-gray-400">
            <span>Name: ______________________</span>
            <span>Class: ______________________</span>
          </div>

          <div className="mt-5 flex flex-col gap-5">
            {plan.worksheet.questions.map((q, i) => (
              <QuestionBlock key={i} index={i} question={q} onChange={(next) => updateQuestion(i, next)} />
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-warning-500/25 bg-warning-50 p-4 dark:bg-warning-500/10">
            <p className="mb-3">
              <Badge color="warning" size="sm" startIcon={<BookmarkIcon className="size-3.5" />}>
                Remember
              </Badge>
            </p>
            <EditableList
              items={plan.worksheet.remember}
              onChange={(remember) => onChange({ ...plan, worksheet: { ...plan.worksheet, remember } })}
              placeholder="Add takeaway"
            />
          </div>
        </div>
      </Card>

      <div className="print:break-before-page">
        <Card
          title="Homework"
          action={
            <OutlineButton
              label={exportingDocx === "homework" ? "Preparing..." : "Download DOCX"}
              onClick={handleDownloadHomeworkDocx}
              disabled={exportingDocx === "homework"}
            />
          }
        >
          <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-800">
            <p className="text-center text-theme-sm font-semibold tracking-wide text-gray-800 dark:text-white/90">
              {plan.request.topic.toUpperCase()}
            </p>
            <p className="mt-0.5 text-center text-theme-sm text-gray-500 dark:text-gray-400">Homework</p>
            <div className="mt-5 flex flex-wrap gap-8 text-theme-sm text-gray-500 dark:text-gray-400">
              <span>Name: ______________________</span>
              <span>Class: ______________________</span>
            </div>

            <div className="mt-5 flex flex-col gap-5">
              {plan.homework.questions.map((q, i) => (
                <QuestionBlock
                  key={i}
                  index={i}
                  question={q}
                  onChange={(next) => updateHomeworkQuestion(i, next)}
                />
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-brand-500/20 bg-brand-50 p-4 dark:bg-brand-500/10">
              <p className="mb-3">
                <Badge color="primary" size="sm" startIcon={<LightbulbIcon className="size-3.5" />}>
                  Hints
                </Badge>
              </p>
              <EditableList
                items={plan.homework.hints}
                onChange={(hints) => onChange({ ...plan, homework: { ...plan.homework, hints } })}
                placeholder="Add hint"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

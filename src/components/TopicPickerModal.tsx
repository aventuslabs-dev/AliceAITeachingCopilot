"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { CURRICULUM, YEAR_LABELS } from "@/lib/curriculum";
import { loadCurriculumTopics } from "@/lib/storage";

interface Props {
  open: boolean;
  initialYearLabel: string;
  onClose: () => void;
  onSelect: (topic: string) => void;
}

export default function TopicPickerModal({ open, initialYearLabel, onClose, onSelect }: Props) {
  if (!open) return null;

  return (
    <TopicPickerModalContent
      key={initialYearLabel}
      initialYearLabel={initialYearLabel}
      onClose={onClose}
      onSelect={onSelect}
    />
  );
}

function TopicPickerModalContent({ initialYearLabel, onClose, onSelect }: Omit<Props, "open">) {
  const [yearLabel, setYearLabel] = useState(initialYearLabel);
  const topics = useMemo(() => loadCurriculumTopics(), []);
  const bands = YEAR_LABELS.map((label) => ({
    yearLabel: label,
    ageMin: CURRICULUM.find((b) => b.yearLabel === label)?.ageMin ?? 0,
    topics: topics.filter((t) => t.yearLabel === label).map((t) => t.topic),
  }));
  const band = bands.find((b) => b.yearLabel === yearLabel) ?? bands[0];

  return (
    <Modal isOpen onClose={onClose} className="m-4 max-w-[700px]">
      <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-3xl">
        <div className="px-2 pt-8 sm:px-6 sm:pt-10">
          <h4 className="mb-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Browse curriculum topics
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Draft scope-and-sequence for P1&ndash;S2. Pick a topic to load it into the planner.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {bands.map((b) => (
              <button
                key={b.yearLabel}
                type="button"
                onClick={() => setYearLabel(b.yearLabel)}
                className={`rounded-full px-3 py-1.5 text-theme-sm font-medium transition-colors ${
                  b.yearLabel === yearLabel
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                }`}
              >
                {b.yearLabel}
                <span className="ml-1 opacity-70">Age {b.ageMin}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 px-2 sm:px-6">
          <div className="flex h-[420px] flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="shrink-0 border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                    >
                      {band.yearLabel} topics
                    </TableCell>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
            <div className="custom-scrollbar flex-1 overflow-y-auto">
              <Table>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {band.topics.map((topic) => (
                    <TableRow key={topic}>
                      <TableCell className="p-0">
                        <button
                          type="button"
                          onClick={() => {
                            onSelect(topic);
                            onClose();
                          }}
                          className="w-full px-5 py-3 text-left text-theme-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                        >
                          {topic}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {band.topics.length === 0 && (
                    <TableRow>
                      <TableCell className="px-5 py-6 text-center text-theme-sm text-gray-400 dark:text-gray-500">
                        No topics yet for this year.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="px-2 py-6 text-theme-xs text-gray-500 sm:px-6 dark:text-gray-400">
          Can&apos;t find it? Close this and type your own topic in the field.
        </div>
      </div>
    </Modal>
  );
}

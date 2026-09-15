"use client";

import { useMemo, useState } from "react";
import { PencilIcon, PlusIcon, TrashBinIcon, ListIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { YEAR_LABELS } from "@/lib/curriculum";
import { CurriculumTopic } from "@/lib/types";

interface Props {
  topics: CurriculumTopic[];
  onSave: (topic: CurriculumTopic) => void;
  onDelete: (id: string) => void;
}

const selectClass =
  "h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-theme-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400";

export default function CurriculumPage({ topics, onSave, onDelete }: Props) {
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [editing, setEditing] = useState<CurriculumTopic | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const rows = useMemo(() => {
    const list = levelFilter === "all" ? topics : topics.filter((t) => t.yearLabel === levelFilter);
    return [...list].sort(
      (a, b) => YEAR_LABELS.indexOf(a.yearLabel) - YEAR_LABELS.indexOf(b.yearLabel) || a.topic.localeCompare(b.topic)
    );
  }, [topics, levelFilter]);

  function openCreate() {
    setEditing({ id: crypto.randomUUID(), yearLabel: levelFilter !== "all" ? levelFilter : YEAR_LABELS[0], topic: "" });
    setFormOpen(true);
  }

  function openEdit(topic: CurriculumTopic) {
    setEditing(topic);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !editing.topic.trim()) return;
    onSave({ ...editing, topic: editing.topic.trim() });
    closeForm();
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Curriculum</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage the scope-and-sequence topics used by the lesson planner.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
        >
          <PlusIcon className="size-4 fill-current" />
          Add topic
        </button>
      </div>

      <div className="col-span-12 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Topics</h3>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">All levels</option>
            {YEAR_LABELS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 border-t border-gray-100 px-5 py-16 text-center dark:border-gray-800">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
              <ListIcon className="size-6" />
            </span>
            <p className="mt-2 font-medium text-gray-800 dark:text-white/90">No topics yet</p>
            <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">
              Add a topic to build out the curriculum for this level.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
            >
              <PlusIcon className="size-4 fill-current" />
              Add topic
            </button>
          </div>
        ) : (
          <div className="custom-scrollbar max-h-[60vh] max-w-full overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 border-y border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-gray-900">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400"
                  >
                    Level
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400"
                  >
                    Topic
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-right text-theme-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {rows.map((t) => (
                  <TableRow
                    key={t.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  >
                    <TableCell className="px-5 py-4 sm:px-6">
                      <Badge size="sm" color="primary">
                        {t.yearLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-700 sm:px-6 dark:text-gray-300">
                      {t.topic}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => openEdit(t)}
                          aria-label="Edit"
                          className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400"
                        >
                          <PencilIcon className="size-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(t.id)}
                          aria-label="Delete"
                          className="text-gray-500 transition-colors hover:text-error-500 dark:text-gray-400"
                        >
                          <TrashBinIcon className="size-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {formOpen && editing && (
        <Modal isOpen onClose={closeForm} className="m-4 max-w-[480px]">
          <div className="px-2 pt-8 pb-6 sm:px-6 sm:pt-10">
            <h4 className="mb-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {topics.some((t) => t.id === editing.id) ? "Edit topic" : "Add topic"}
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Topics appear in the curriculum browser and the lesson planner.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="curriculum-level" className={labelClass}>
                  Level
                </label>
                <select
                  id="curriculum-level"
                  value={editing.yearLabel}
                  onChange={(e) => setEditing({ ...editing, yearLabel: e.target.value })}
                  className={`${selectClass} w-full`}
                >
                  {YEAR_LABELS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="curriculum-topic" className={labelClass}>
                  Topic
                </label>
                <input
                  id="curriculum-topic"
                  value={editing.topic}
                  onChange={(e) => setEditing({ ...editing, topic: e.target.value })}
                  placeholder="e.g. IF-ELSE statements"
                  className={inputClass}
                  required
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-gray-300 transition ring-inset hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

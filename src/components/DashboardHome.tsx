"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpIcon,
  BoxIconLine,
  DownloadIcon,
  FileIcon,
  GroupIcon,
  PencilIcon,
  PlusIcon,
  TimeIcon,
  TrashBinIcon,
} from "@/icons";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { BlockType, LessonPlan } from "@/lib/types";
import { getYearLabelForAge } from "@/lib/curriculum";

interface Props {
  plans: LessonPlan[];
  search: string;
  onOpen: (plan: LessonPlan) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

type SortKey = "newest" | "oldest" | "topic" | "duration";

// Metric tile cloned from TailAdmin src/components/ecommerce/EcommerceMetrics.tsx
function MetricCard({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  badge: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
        {icon}
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
          <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">{value}</h4>
        </div>
        {badge}
      </div>
    </div>
  );
}

const BLOCK_LABEL: Record<BlockType, string> = {
  warmup: "Warm-up",
  teaching: "Teaching",
  exercise: "Exercise",
  wrapup: "Wrap-up",
};

const BLOCK_BAR: Record<BlockType, string> = {
  warmup: "bg-blue-light-500",
  teaching: "bg-brand-500",
  exercise: "bg-success-500",
  wrapup: "bg-warning-500",
};

const selectClass =
  "h-9 rounded-lg border border-gray-300 bg-transparent px-3 text-theme-sm text-gray-700 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400";

export default function DashboardHome({ plans, search, onOpen, onDelete, onNew }: Props) {
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Read the current time once on mount; not derivable during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
  }, []);

  const stats = useMemo(() => {
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const thisWeek =
      now === null ? 0 : plans.filter((p) => now - new Date(p.createdAt).getTime() <= weekMs).length;
    const uniqueTopics = new Set(plans.map((p) => p.request.topic.toLowerCase())).size;
    const avgDuration = plans.length
      ? Math.round(plans.reduce((sum, p) => sum + p.durationMinutes, 0) / plans.length)
      : 0;
    return { total: plans.length, thisWeek, uniqueTopics, avgDuration };
  }, [plans, now]);

  const yearOptions = useMemo(() => {
    const years = new Set(plans.map((p) => getYearLabelForAge(p.request.age)));
    return Array.from(years).sort();
  }, [plans]);

  // Plans per year level — the dashboard's bar chart.
  const byYear = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of plans) {
      const label = getYearLabelForAge(p.request.age);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    const entries = Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const max = entries.reduce((m, [, n]) => Math.max(m, n), 0);
    return { entries, max };
  }, [plans]);

  // Average share of lesson time per block type, across saved plans.
  const timeSplit = useMemo(() => {
    const totals: Record<BlockType, number> = { warmup: 0, teaching: 0, exercise: 0, wrapup: 0 };
    let grand = 0;
    for (const p of plans) {
      for (const b of p.schedule) {
        const minutes = Math.max(0, b.endMinute - b.startMinute);
        totals[b.type] += minutes;
        grand += minutes;
      }
    }
    return (Object.keys(totals) as BlockType[]).map((type) => ({
      type,
      pct: grand ? Math.round((totals[type] / grand) * 100) : 0,
    }));
  }, [plans]);

  const rows = useMemo(() => {
    let list = plans;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.request.topic.toLowerCase().includes(q) ||
          getYearLabelForAge(p.request.age).toLowerCase().includes(q)
      );
    }
    if (yearFilter !== "all") {
      list = list.filter((p) => getYearLabelForAge(p.request.age) === yearFilter);
    }
    const sorted = [...list];
    switch (sortKey) {
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "topic":
        sorted.sort((a, b) => a.request.topic.localeCompare(b.request.topic));
        break;
      case "duration":
        sorted.sort((a, b) => b.durationMinutes - a.durationMinutes);
        break;
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }, [plans, search, yearFilter, sortKey]);

  function handleExportCsv() {
    const header = ["Topic", "Year level", "Age", "Duration (min)", "Created"];
    const lines = rows.map((p) =>
      [
        p.request.topic,
        getYearLabelForAge(p.request.age),
        p.request.age,
        p.durationMinutes,
        new Date(p.createdAt).toLocaleDateString(),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lesson-plans.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const iconClass = "size-6 text-gray-800 dark:text-white/90";

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your lesson library at a glance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={rows.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-gray-700 ring-1 ring-gray-300 transition ring-inset hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
          >
            <DownloadIcon className="size-5 fill-current" />
            Export
          </button>
          <button
            type="button"
            onClick={onNew}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
          >
            <PlusIcon className="size-4 fill-current" />
            New Lesson Plan
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        <MetricCard
          icon={<GroupIcon className={iconClass} />}
          label="Total Lesson Plans"
          value={stats.total}
          badge={
            stats.thisWeek > 0 ? (
              <Badge color="success">
                <ArrowUpIcon className="size-3 fill-current" />
                {stats.thisWeek}
              </Badge>
            ) : (
              <Badge color="light">&mdash;</Badge>
            )
          }
        />
        <MetricCard
          icon={<BoxIconLine className={iconClass} />}
          label="Saved This Week"
          value={stats.thisWeek}
          badge={<Badge color="light">7 days</Badge>}
        />
        <MetricCard
          icon={<FileIcon className={iconClass} />}
          label="Topics Covered"
          value={stats.uniqueTopics}
          badge={<Badge color="light">of {stats.total}</Badge>}
        />
        <MetricCard
          icon={<TimeIcon className={iconClass} />}
          label="Avg. Lesson Length"
          value={stats.avgDuration ? `${stats.avgDuration}m` : "—"}
          badge={<Badge color="light">per lesson</Badge>}
        />
      </div>

      {/* Plans by year level */}
      <div className="col-span-12 rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 xl:col-span-7 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Plans by year level
          </h3>
          <span className="text-theme-sm text-gray-500 dark:text-gray-400">P1&ndash;S2</span>
        </div>

        {byYear.entries.length === 0 ? (
          <div className="flex h-[180px] items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Saved plans will chart here.
          </div>
        ) : (
          <div className="mt-6 flex h-[180px] items-end justify-between gap-3">
            {byYear.entries.map(([label, count]) => (
              <div key={label} className="flex h-full w-full flex-col items-center justify-end gap-2">
                <span className="text-theme-xs font-medium text-gray-800 dark:text-white/90">
                  {count}
                </span>
                <div
                  className="w-full max-w-12 rounded-t-sm bg-brand-500 transition-all duration-300 hover:bg-brand-600"
                  style={{ height: `${Math.max(6, (count / byYear.max) * 100)}%` }}
                />
                <span className="text-theme-xs text-gray-500 dark:text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lesson time split */}
      <div className="col-span-12 rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 xl:col-span-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Lesson time split</h3>
        <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
          Average share of minutes per block type
        </p>

        <div className="mt-6 flex flex-col gap-5">
          {timeSplit.map((row) => (
            <div key={row.type}>
              <div className="mb-2 flex items-center justify-between text-theme-sm">
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {BLOCK_LABEL[row.type]}
                </span>
                <span className="text-gray-500 dark:text-gray-400">{row.pct}%</span>
              </div>
              <div className="relative block h-2 w-full rounded-sm bg-gray-200 dark:bg-gray-800">
                <div
                  className={`absolute top-0 left-0 flex h-full items-center justify-center rounded-sm text-xs font-medium text-white transition-all duration-300 ${
                    BLOCK_BAR[row.type]
                  }`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lesson library */}
      <div className="col-span-12 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">My Lesson Plans</h3>
          <div className="flex items-center gap-3">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className={selectClass}
            >
              <option value="all">All year levels</option>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className={selectClass}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="topic">Topic A–Z</option>
              <option value="duration">Longest duration</option>
            </select>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 border-t border-gray-100 px-5 py-16 text-center dark:border-gray-800">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
              <FileIcon className="size-6" />
            </span>
            <p className="mt-2 font-medium text-gray-800 dark:text-white/90">
              {search ? "No plans match your search" : "No lesson plans yet"}
            </p>
            <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">
              {search
                ? "Try a different topic or year level."
                : "Generate your first plan and save it to build your library."}
            </p>
            {!search && (
              <button
                type="button"
                onClick={onNew}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
              >
                <PlusIcon className="size-4 fill-current" />
                New Lesson Plan
              </button>
            )}
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-y border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.03]">
                <TableRow>
                  {["Topic", "Year level", "Duration", "Created"].map((heading) => (
                    <TableCell
                      key={heading}
                      isHeader
                      className="px-5 py-3 text-left text-theme-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400"
                    >
                      {heading}
                    </TableCell>
                  ))}
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-right text-theme-xs font-medium text-gray-500 sm:px-6 dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {rows.map((p) => (
                  <TableRow
                    key={p.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  >
                    <TableCell className="px-5 py-4 sm:px-6">
                      <button
                        type="button"
                        onClick={() => onOpen(p)}
                        className="text-left text-theme-sm font-medium text-gray-800 transition-colors hover:text-brand-500 dark:text-white/90"
                      >
                        {p.request.topic}
                      </button>
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <Badge size="sm" color="primary">
                        {getYearLabelForAge(p.request.age)} &middot; Age {p.request.age}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 sm:px-6 dark:text-gray-400">
                      {p.durationMinutes} min
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 sm:px-6 dark:text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 sm:px-6">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => onOpen(p)}
                          aria-label="Open"
                          className="text-gray-500 transition-colors hover:text-brand-500 dark:text-gray-400"
                        >
                          <PencilIcon className="size-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(p.id)}
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
    </div>
  );
}

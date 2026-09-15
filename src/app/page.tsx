"use client";

import { useEffect, useState } from "react";
import { BoltIcon, TaskIcon } from "@/icons";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AppLayout from "@/layout/AppLayout";
import { AppView } from "@/layout/AppSidebar";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CurriculumPage from "@/components/CurriculumPage";
import DashboardHome from "@/components/DashboardHome";
import LessonPlannerForm from "@/components/LessonPlannerForm";
import LessonPlanView from "@/components/LessonPlanView";
import { generateLessonPlan } from "@/lib/generateLessonPlan";
import {
  deleteCurriculumTopic,
  deleteLessonPlan,
  loadCurriculumTopics,
  loadLessonPlans,
  saveCurriculumTopic,
  saveLessonPlan,
} from "@/lib/storage";
import { CurriculumTopic, LessonPlan, LessonPlanRequest } from "@/lib/types";

function Workspace() {
  const [view, setView] = useState<AppView>("dashboard");
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<LessonPlan[]>([]);
  const [curriculumTopics, setCurriculumTopics] = useState<CurriculumTopic[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // One-time read from localStorage on mount; not derivable from render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedPlans(loadLessonPlans());
    setCurriculumTopics(loadCurriculumTopics());
  }, []);

  function handleSaveCurriculumTopic(topic: CurriculumTopic) {
    setCurriculumTopics(saveCurriculumTopic(topic));
  }

  function handleDeleteCurriculumTopic(id: string) {
    setCurriculumTopics(deleteCurriculumTopic(id));
  }

  async function handleGenerate(request: LessonPlanRequest) {
    setIsGenerating(true);
    setSaved(false);
    const generated = await generateLessonPlan(request);
    setPlan(generated);
    setIsGenerating(false);
  }

  function handleSave() {
    if (!plan) return;
    setSavedPlans(saveLessonPlan(plan));
    setSaved(true);
  }

  function handleOpen(selected: LessonPlan) {
    setPlan(selected);
    setSaved(true);
    setView("planner");
  }

  function handleDelete(id: string) {
    setSavedPlans(deleteLessonPlan(id));
    if (plan?.id === id) setPlan(null);
  }

  function handleNewPlan() {
    setPlan(null);
    setSaved(false);
    setView("planner");
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    if (value) setView("dashboard");
  }

  return (
    <AppLayout
      view={view}
      onNavigate={setView}
      onNewPlan={handleNewPlan}
      search={search}
      onSearchChange={handleSearchChange}
    >
      {view === "curriculum" && (
        <CurriculumPage
          topics={curriculumTopics}
          onSave={handleSaveCurriculumTopic}
          onDelete={handleDeleteCurriculumTopic}
        />
      )}

      {view === "dashboard" && (
        <DashboardHome
          plans={savedPlans}
          search={search}
          onOpen={handleOpen}
          onDelete={handleDelete}
          onNew={handleNewPlan}
        />
      )}

      {view === "planner" && (
        <>
          <PageBreadcrumb
            pageTitle="Lesson Planner"
            parent={{ label: "Dashboard", onClick: () => setView("dashboard") }}
          />

          <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-[400px_1fr]">
            <div className="print:hidden xl:sticky xl:top-24 xl:h-fit">
              <LessonPlannerForm onGenerate={handleGenerate} isGenerating={isGenerating} />
            </div>

            <div>
              {!plan && !isGenerating && (
                <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-800 dark:bg-white/[0.03]">
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
                    <TaskIcon className="size-6" />
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fill in the form and generate a lesson plan to see it here.
                  </p>
                </div>
              )}

              {isGenerating && !plan && (
                <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-white/[0.03]">
                  <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                    <BoltIcon className="size-6" />
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Drafting a lesson plan&hellip;
                  </p>
                </div>
              )}

              {plan && (
                <LessonPlanView
                  plan={plan}
                  onChange={(next) => {
                    setPlan(next);
                    setSaved(false);
                  }}
                  onSave={handleSave}
                  saved={saved}
                />
              )}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Workspace />
      </SidebarProvider>
    </ThemeProvider>
  );
}

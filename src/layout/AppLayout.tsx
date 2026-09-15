"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar, { AppView } from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";

interface Props {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onNewPlan: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  children: React.ReactNode;
}

// Cloned from TailAdmin src/layout/AppLayout.tsx
const AppLayout: React.FC<Props> = ({
  view,
  onNavigate,
  onNewPlan,
  search,
  onSearchChange,
  children,
}) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar view={view} onNavigate={onNavigate} onNewPlan={onNewPlan} />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-[margin] duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader search={search} onSearchChange={onSearchChange} />
        <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
};

export default AppLayout;

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BoltIcon,
  ChevronDownIcon,
  DocsIcon,
  GridIcon,
  HorizontalDots,
  ListIcon,
  TaskIcon,
} from "@/icons";
import { useSidebar } from "@/context/SidebarContext";
import { LogoMark, LogoWordmark } from "@/components/common/Logo";

export type AppView = "dashboard" | "planner" | "curriculum";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  view?: AppView;
  onSelect?: () => void;
  subItems?: { name: string; onSelect: () => void; badge?: string }[];
};

interface Props {
  view: AppView;
  onNavigate: (view: AppView) => void;
  onNewPlan: () => void;
}

// Structure cloned from TailAdmin src/layout/AppSidebar.tsx.
// Difference from upstream: the sidebar's content is a fixed 290px column that the
// animating <aside> clips, and labels fade rather than unmount. Upstream re-renders
// the labels into a 90px box, so every row wraps and reflows during the 300ms
// width transition; clipping keeps the collapse/expand perfectly steady.
const AppSidebar: React.FC<Props> = ({ view, onNavigate, onNewPlan }) => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();

  const showText = isExpanded || isHovered || isMobileOpen;

  const navItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      view: "dashboard",
      onSelect: () => onNavigate("dashboard"),
    },
    {
      icon: <ListIcon />,
      name: "Lesson Planner",
      subItems: [
        { name: "New Plan", onSelect: onNewPlan },
        { name: "My Lessons", onSelect: () => onNavigate("dashboard") },
      ],
    },
    {
      icon: <TaskIcon />,
      name: "Curriculum",
      view: "curriculum",
      onSelect: () => onNavigate("curriculum"),
    },
  ];

  const othersItems: NavItem[] = [
    { icon: <BoltIcon />, name: "Settings" },
    { icon: <DocsIcon />, name: "Help" },
  ];

  const [openSubmenu, setOpenSubmenu] = useState<{ type: "main" | "others"; index: number } | null>(
    null
  );
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev && prev.type === menuType && prev.index === index ? null : { type: menuType, index }
    );
  };

  const isActive = useCallback((item: NavItem) => item.view !== undefined && item.view === view, [view]);

  // Fades with the width transition instead of unmounting, so no row ever reflows.
  const textClass = `menu-item-text whitespace-nowrap transition-opacity duration-200 ${
    showText ? "opacity-100" : "opacity-0"
  }`;

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        // Derived, not stored: a collapsed sidebar reports every submenu closed, so no
        // panel is left open behind the clip (and it reopens when you expand again).
        const submenuOpen =
          showText && openSubmenu?.type === menuType && openSubmenu?.index === index;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                type="button"
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group cursor-pointer ${
                  submenuOpen ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    submenuOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                <span className={textClass}>{nav.name}</span>
                <ChevronDownIcon
                  className={`ml-auto h-5 w-5 transition-[transform,opacity] duration-200 ${
                    submenuOpen ? "rotate-180 text-brand-500" : ""
                  } ${showText ? "opacity-100" : "opacity-0"}`}
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  nav.onSelect?.();
                  if (isMobileOpen) toggleMobileSidebar();
                }}
                className={`menu-item group w-full ${
                  isActive(nav) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                <span className={textClass}>{nav.name}</span>
              </button>
            )}

            {nav.subItems && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: submenuOpen ? `${subMenuHeight[`${menuType}-${index}`]}px` : "0px",
                }}
              >
                <ul className="mt-2 ml-9 space-y-1">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <button
                        type="button"
                        onClick={() => {
                          subItem.onSelect();
                          if (isMobileOpen) toggleMobileSidebar();
                        }}
                        className="menu-dropdown-item menu-dropdown-item-inactive w-full whitespace-nowrap"
                      >
                        {subItem.name}
                        <span className="ml-auto flex items-center gap-1">
                          {subItem.badge && (
                            <span className="menu-dropdown-badge menu-dropdown-badge-inactive ml-auto">
                              {subItem.badge}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const sectionHeading = (label: string) => (
    <h2 className="relative mb-4 flex h-5 items-center text-xs leading-[20px] text-gray-400 uppercase">
      <span className={`transition-opacity duration-200 ${showText ? "opacity-100" : "opacity-0"}`}>
        {label}
      </span>
      <HorizontalDots
        className={`absolute left-3 size-6 transition-opacity duration-200 ${
          showText ? "opacity-0" : "opacity-100"
        }`}
      />
    </h2>
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col overflow-hidden border-r border-gray-200 bg-white text-gray-900 transition-[width,transform] duration-300 ease-in-out lg:mt-0 dark:border-gray-800 dark:bg-gray-900
        ${showText || isMobileOpen ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Fixed-width column: the aside clips it, so nothing inside reflows while the width animates. */}
      <div className="flex h-full w-[290px] shrink-0 flex-col px-5">
        <div className="flex py-8 pl-1">
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-3"
          >
            <LogoMark className="h-10 w-10 shrink-0" />
            <LogoWordmark
              className={`transition-opacity duration-200 ${showText ? "opacity-100" : "opacity-0"}`}
            />
          </button>
        </div>

        <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                {sectionHeading("Menu")}
                {renderMenuItems(navItems, "main")}
              </div>
              <div>
                {sectionHeading("Others")}
                {renderMenuItems(othersItems, "others")}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;

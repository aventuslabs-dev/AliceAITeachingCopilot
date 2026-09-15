"use client";

import { useState } from "react";
import { BellIcon, CloseLineIcon } from "@/icons";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";

// Cloned from TailAdmin src/components/header/NotificationDropdown.tsx
const notifications = [
  {
    initials: "S1",
    title: "Week 2 plans",
    detail: "for S1 are ready to review before Monday.",
    tag: "Lesson Planner",
    time: "Today",
  },
  {
    initials: "P4",
    title: "Curriculum",
    detail: "topics updated for P4\u2013P6.",
    tag: "Curriculum",
    time: "This week",
  },
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  function handleClick() {
    setIsOpen(!isOpen);
    setNotifying(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute top-0.5 right-0 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
        </span>
        <BellIcon className="h-5 w-5 fill-current" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="-right-[240px] flex h-[480px] w-[350px] flex-col p-3 sm:w-[361px] lg:right-0"
      >
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notification</h5>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close notifications"
            className="text-gray-500 transition dropdown-toggle hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <CloseLineIcon className="h-6 w-6 fill-current" />
          </button>
        </div>

        <ul className="custom-scrollbar flex h-auto flex-col overflow-y-auto">
          {notifications.map((item) => (
            <li key={item.title + item.time}>
              <button
                type="button"
                className="flex w-full gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 text-left hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
              >
                <span className="relative z-1 block h-10 w-full max-w-10 rounded-full bg-brand-50 text-center text-theme-xs leading-10 font-medium text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
                  {item.initials}
                  <span className="absolute right-0 bottom-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white bg-success-500 dark:border-gray-900" />
                </span>

                <span className="block">
                  <span className="mb-1.5 block space-x-1 text-theme-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-800 dark:text-white/90">{item.title}</span>
                    <span>{item.detail}</span>
                  </span>

                  <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                    <span>{item.tag}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-400" />
                    <span>{item.time}</span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Dropdown>
    </div>
  );
}

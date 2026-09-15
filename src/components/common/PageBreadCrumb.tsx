"use client";

// Cloned from TailAdmin src/components/common/PageBreadCrumb.tsx
interface BreadcrumbProps {
  pageTitle: string;
  parent?: { label: string; onClick: () => void };
  children?: React.ReactNode;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, parent, children }) => {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">{pageTitle}</h2>

      <div className="flex flex-wrap items-center gap-3">
        {children}
        <nav>
          <ol className="flex items-center gap-1.5">
            <li>
              <button
                type="button"
                onClick={parent?.onClick}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              >
                {parent?.label ?? "Home"}
                <svg
                  className="stroke-current"
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                    stroke=""
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </li>
            <li className="text-sm text-gray-800 dark:text-white/90">{pageTitle}</li>
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default PageBreadcrumb;

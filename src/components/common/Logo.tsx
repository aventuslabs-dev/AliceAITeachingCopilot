/**
 * Alice — AI Teaching Copilot.
 * The rounded brand tile from public/logo.png, cropped to a transparent
 * square so it reads the same on the light and dark sidebar.
 */
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo-mark.png" alt="Alice" className={`object-contain ${className}`} />;
}

export function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`text-left leading-tight whitespace-nowrap ${className}`}>
      <span className="block text-lg font-semibold text-gray-800 dark:text-white/90">Alice</span>
      <span className="flex items-center gap-1.5">
        <span className="text-theme-xs text-gray-500 dark:text-gray-400">AI Teaching Copilot</span>
        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] leading-none font-medium tracking-wide text-gray-500 uppercase dark:bg-white/5 dark:text-gray-400">
          Prototype
        </span>
      </span>
    </span>
  );
}

import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit-loaded",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alice — AI Teaching Copilot",
  description: "Alice, an AI teaching copilot for lesson planning at St Francis",
};

// Applies the stored theme before first paint so the dashboard never flashes light.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="dark:bg-gray-900">{children}</body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Lane — PR review inbox",
  description:
    "Triage pull requests across repositories, review diffs, and act without leaving the keyboard.",
};

// Set the theme class before paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('lane-theme')||'dark';if(t!=='light')document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

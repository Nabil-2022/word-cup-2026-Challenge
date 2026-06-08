import type { Metadata } from "next";
import { SiteComplianceFooter } from "@/components/ComplianceDisclaimers";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Cup 2026 Prediction Challenge",
  description: "A skill-based World Cup 2026 prediction competition with scoring, tie-breaks, and a public leaderboard."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
              <a className="text-sm font-bold uppercase tracking-wide text-night" href="/">
                World Cup 2026 Prediction Challenge
              </a>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <a href="/official-rules">Rules</a>
                <a href="/leaderboard">Leaderboard</a>
                <a href="/eligibility">Eligibility</a>
                <a href="/results">Results</a>
              </div>
            </nav>
          </header>
          <main>{children}</main>
          <SiteComplianceFooter />
        </div>
      </body>
    </html>
  );
}

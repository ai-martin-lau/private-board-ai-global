import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Disclaimer } from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: "私人董事会 — Private Board",
  description: "重大人生决策时，让 19 位思想家围桌为你辞论。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <ErrorBoundary>
          <ToastProvider>
            {children}
            <Disclaimer />
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

"use client";
import { Component, type ReactNode } from "react";
import { text } from "@/lib/i18n";
import { loadLanguage } from "@/lib/storage";

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error("Boundary caught:", error); }

  render() {
    if (this.state.error) {
      const t = text(loadLanguage());
      return (
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="card max-w-md text-center">
            <h2 className="text-lg font-semibold text-red-700">{t.errorTitle as string}</h2>
            <p className="mt-2 text-sm text-neutral-600">{this.state.error.message}</p>
            <button className="btn-primary mt-4" onClick={() => location.reload()}>
              {t.reload as string}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

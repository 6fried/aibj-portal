"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
  duration?: number; // ms
};

type ToastContextType = {
  toasts: Toast[];
  show: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const next: Toast = {
      id,
      duration: 3000,
      variant: "default",
      ...toast,
    };
    setToasts((prev) => [...prev, next]);
    if (next.duration && next.duration > 0) {
      setTimeout(() => dismiss(id), next.duration);
    }
  }, [dismiss]);

  const value = useMemo(() => ({ toasts, show, dismiss }), [toasts, show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[360px] max-w-[90vw] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            "rounded-md border px-3 py-2 shadow-sm text-sm bg-card text-foreground " +
            (t.variant === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-800 " : "") +
            (t.variant === "destructive" ? "border-destructive/40 bg-destructive/10 text-destructive " : "")
          }
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {t.title ? <div className="font-medium">{t.title}</div> : null}
              {t.description ? <div className="opacity-90">{t.description}</div> : null}
            </div>
            <button className="text-xs opacity-60 hover:opacity-100" onClick={() => onDismiss(t.id)}>Close</button>
          </div>
        </div>
      ))}
    </div>
  );
}

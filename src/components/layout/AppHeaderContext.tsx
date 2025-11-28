"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type HeaderState = {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode; // actions on the right (e.g., Dashboard button)
};

type HeaderContextType = {
  state: HeaderState;
  setHeader: (next: HeaderState) => void;
  clearHeader: () => void;
};

const AppHeaderContext = createContext<HeaderContextType | null>(null);

export function AppHeaderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HeaderState>({});
  const value = useMemo<HeaderContextType>(() => ({
    state,
    setHeader: (next) => setState(next),
    clearHeader: () => setState({}),
  }), [state]);
  return (
    <AppHeaderContext.Provider value={value}>{children}</AppHeaderContext.Provider>
  );
}

export function useAppHeader() {
  const ctx = useContext(AppHeaderContext);
  if (!ctx) throw new Error("useAppHeader must be used within AppHeaderProvider");
  return ctx;
}

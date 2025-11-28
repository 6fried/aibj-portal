"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Settings } from "lucide-react";
import { useAppHeader } from "./AppHeaderContext";
import { usePathname } from "next/navigation";

export default function AppHeader() {
  const { state } = useAppHeader();
  const pathname = usePathname();
  const isActive = (href: string) => pathname?.startsWith(href);
  const hasContext = !!state.title || !!state.subtitle || !!state.icon;
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-3">
          {hasContext ? (
            <div className="flex items-center gap-3">
              {state.icon ? (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  {state.icon}
                </span>
              ) : (
                <Link href="/dashboard" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Home className="h-4 w-4 text-primary" />
                </Link>
              )}
              <div className="min-w-0">
                <div className="truncate font-semibold text-foreground">{state.title || 'AIBJ Portal'}</div>
                {state.subtitle && (
                  <div className="truncate text-xs text-muted-foreground">{state.subtitle}</div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Home className="h-4 w-4 text-primary" />
              </span>
              <span className="font-semibold text-foreground">AIBJ Portal</span>
            </Link>
          )}
        </div>
        <nav className="flex items-center gap-1">
          <Button asChild variant={isActive("/dashboard") ? "secondary" : "ghost"} size="sm" className="gap-2 hover:bg-muted">
            <Link href="/dashboard">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button asChild variant={isActive("/apps/leads") ? "secondary" : "ghost"} size="sm" className="hover:bg-muted">
            <Link href="/apps/leads">Leads</Link>
          </Button>
          <Button asChild variant={isActive("/apps/recruitment") ? "secondary" : "ghost"} size="sm" className="hover:bg-muted">
            <Link href="/apps/recruitment">Recruitment</Link>
          </Button>
          <Button asChild variant={isActive("/apps/e2e-analytics") ? "secondary" : "ghost"} size="sm" className="hover:bg-muted">
            <Link href="/apps/e2e-analytics">Analytics</Link>
          </Button>
          <Button asChild variant={isActive("/apps/reports") ? "secondary" : "ghost"} size="sm" className="hover:bg-muted">
            <Link href="/apps/reports">Performance</Link>
          </Button>
          <span className="mx-1 h-5 w-px bg-border inline-block" />
          <Button asChild variant={isActive("/settings") ? "secondary" : "outline"} size="sm" className="gap-2 hover:bg-muted">
            <Link href="/settings/email">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

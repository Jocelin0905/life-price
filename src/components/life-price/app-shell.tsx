"use client";

import { Clock3, History, Settings, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export type AppView = "calculator" | "history" | "settings";

const navItems = [
  { id: "calculator" as const, label: "换算", icon: Clock3 },
  { id: "history" as const, label: "人生时间", icon: History },
  { id: "settings" as const, label: "设置", icon: Settings },
];

export function AppShell({
  children,
  view,
  onViewChange,
  warning,
  showNavigation = true,
}: {
  children: ReactNode;
  view: AppView;
  onViewChange: (view: AppView) => void;
  warning: string | null;
  showNavigation?: boolean;
}) {
  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => onViewChange("calculator")}>
          <span className="brand-mark"><Sparkles size={17} strokeWidth={2.2} /></span>
          <span>Life Price</span>
        </button>
        <span className="brand-cn">时间价格计算器</span>
      </header>

      {warning && <div className="storage-warning" role="status">{warning}</div>}
      <div className="page-frame">{children}</div>

      {showNavigation && (
        <nav className="bottom-nav" aria-label="主要导航">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={view === item.id ? "active" : ""}
                type="button"
                onClick={() => onViewChange(item.id)}
                aria-current={view === item.id ? "page" : undefined}
                aria-label={`前往${item.label}`}
              >
                <Icon size={20} strokeWidth={1.9} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </main>
  );
}

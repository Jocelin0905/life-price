"use client";

import { useState } from "react";
import { useLifePriceStore } from "../../hooks/use-life-price-store";
import { AppShell, type AppView } from "./app-shell";
import { Calculator } from "./calculator";
import { HistoryPage } from "./history-page";
import { Onboarding } from "./onboarding";
import { SettingsPage } from "./settings-page";

export function LifePriceApp() {
  const { store, persistence, ready, saveSettings, addDecision, deleteDecision, clearAll } = useLifePriceStore();
  const [view, setView] = useState<AppView>("calculator");

  if (!ready) return <main className="loading-screen" aria-label="正在载入" />;

  if (!store.settings) {
    return (
      <AppShell view="calculator" onViewChange={setView} warning={persistence.warning} showNavigation={false}>
        <Onboarding onSave={(settings) => { saveSettings(settings); setView("calculator"); }} />
      </AppShell>
    );
  }

  return (
    <AppShell view={view} onViewChange={setView} warning={persistence.warning}>
      {view === "calculator" && <Calculator settings={store.settings} onSkip={addDecision} />}
      {view === "history" && <HistoryPage decisions={store.decisions} onDelete={deleteDecision} />}
      {view === "settings" && <SettingsPage settings={store.settings} onSave={saveSettings} onClear={() => { clearAll(); setView("calculator"); }} />}
    </AppShell>
  );
}

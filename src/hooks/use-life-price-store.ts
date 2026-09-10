"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DecisionRecord, LifePriceStore, PersistenceState, UserSettings } from "../domain/types";
import { createLifePriceStorage } from "../storage/lifePriceStorage";

const emptyStore: LifePriceStore = { schemaVersion: 1, settings: null, decisions: [] };

export function useLifePriceStore() {
  const adapterRef = useRef<ReturnType<typeof createLifePriceStorage> | null>(null);
  const [store, setStore] = useState<LifePriceStore>(emptyStore);
  const [persistence, setPersistence] = useState<PersistenceState>({ status: "available", warning: null });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const adapter = createLifePriceStorage(window.localStorage);
    adapterRef.current = adapter;
    const loaded = adapter.load();
    queueMicrotask(() => {
      if (!active) return;
      setStore(loaded.data);
      setPersistence(loaded.persistence);
      setReady(true);
    });
    return () => { active = false; };
  }, []);

  const persist = useCallback((next: LifePriceStore) => {
    setStore(next);
    const adapter = adapterRef.current;
    if (adapter && !adapter.save(next)) setPersistence(adapter.load().persistence);
  }, []);

  const saveSettings = useCallback((settings: UserSettings) => {
    persist({ ...store, settings });
  }, [persist, store]);

  const addDecision = useCallback((record: DecisionRecord) => {
    persist({ ...store, decisions: [record, ...store.decisions] });
  }, [persist, store]);

  const deleteDecision = useCallback((id: string) => {
    persist({ ...store, decisions: store.decisions.filter((record) => record.id !== id) });
  }, [persist, store]);

  const clearAll = useCallback(() => {
    adapterRef.current?.clear();
    setStore(emptyStore);
    if (adapterRef.current) setPersistence(adapterRef.current.load().persistence);
  }, []);

  return { store, persistence, ready, saveSettings, addDecision, deleteDecision, clearAll };
}

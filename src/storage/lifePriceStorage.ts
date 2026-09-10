import type { LifePriceStore, LoadedStore } from "../domain/types";

export const STORAGE_KEY = "life-price:v1";
const WARNING = "数据保存暂时不可用。当前会话可以继续使用，但刷新后可能无法保留数据。";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const createEmptyStore = (): LifePriceStore => ({
  schemaVersion: 1,
  settings: null,
  decisions: [],
});

function isValidStore(value: unknown): value is LifePriceStore {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LifePriceStore>;
  return candidate.schemaVersion === 1 &&
    (candidate.settings === null || typeof candidate.settings === "object") &&
    Array.isArray(candidate.decisions);
}

export function createLifePriceStorage(browserStorage?: StorageLike) {
  let memory = createEmptyStore();
  let protectedMode = false;

  function enterProtectedMode(): LoadedStore {
    protectedMode = true;
    return {
      data: memory,
      persistence: { status: "protected-memory", warning: WARNING },
    };
  }

  return {
    load(): LoadedStore {
      if (!browserStorage) return enterProtectedMode();
      try {
        const raw = browserStorage.getItem(STORAGE_KEY);
        if (raw === null) {
          return {
            data: memory,
            persistence: { status: "available", warning: null },
          };
        }
        const parsed: unknown = JSON.parse(raw);
        if (!isValidStore(parsed)) return enterProtectedMode();
        memory = parsed;
        return {
          data: memory,
          persistence: { status: "available", warning: null },
        };
      } catch {
        return enterProtectedMode();
      }
    },

    save(next: LifePriceStore) {
      memory = next;
      if (protectedMode || !browserStorage) return false;
      try {
        browserStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return true;
      } catch {
        protectedMode = true;
        return false;
      }
    },

    clear() {
      memory = createEmptyStore();
      if (protectedMode || !browserStorage) return false;
      try {
        browserStorage.removeItem(STORAGE_KEY);
        return true;
      } catch {
        protectedMode = true;
        return false;
      }
    },
  };
}

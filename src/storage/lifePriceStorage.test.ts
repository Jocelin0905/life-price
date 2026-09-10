import { describe, expect, it } from "vitest";
import { createLifePriceStorage, STORAGE_KEY } from "./lifePriceStorage";

function createMemoryStorage(initial?: string) {
  let value = initial ?? null;
  return {
    getItem: () => value,
    setItem: (_key: string, next: string) => { value = next; },
    removeItem: () => { value = null; },
    inspect: () => value,
  };
}

describe("protected storage", () => {
  it("loads and saves a valid versioned store", () => {
    const browserStorage = createMemoryStorage();
    const storage = createLifePriceStorage(browserStorage);
    const state = storage.load();
    expect(state.persistence.status).toBe("available");
    storage.save({ ...state.data, settings: null });
    expect(JSON.parse(browserStorage.inspect() ?? "").schemaVersion).toBe(1);
  });

  it("does not overwrite damaged JSON", () => {
    const browserStorage = createMemoryStorage("{damaged");
    const storage = createLifePriceStorage(browserStorage);
    const loaded = storage.load();
    expect(loaded.persistence.status).toBe("protected-memory");
    expect(loaded.persistence.warning).toContain("刷新后可能无法保留");
    storage.save({ schemaVersion: 1, settings: null, decisions: [] });
    expect(browserStorage.inspect()).toBe("{damaged");
  });

  it("does not overwrite an unknown schema", () => {
    const original = JSON.stringify({ schemaVersion: 99, settings: null, decisions: [] });
    const browserStorage = createMemoryStorage(original);
    const storage = createLifePriceStorage(browserStorage);
    expect(storage.load().persistence.status).toBe("protected-memory");
    storage.save({ schemaVersion: 1, settings: null, decisions: [] });
    expect(browserStorage.inspect()).toBe(original);
  });

  it("falls back when browser storage access is denied", () => {
    const denied = {
      getItem: () => { throw new Error("denied"); },
      setItem: () => { throw new Error("denied"); },
      removeItem: () => { throw new Error("denied"); },
    };
    const storage = createLifePriceStorage(denied);
    expect(storage.load().persistence.status).toBe("protected-memory");
    expect(() => storage.save({ schemaVersion: 1, settings: null, decisions: [] })).not.toThrow();
  });

  it("uses the documented storage key", () => {
    expect(STORAGE_KEY).toBe("life-price:v1");
  });
});

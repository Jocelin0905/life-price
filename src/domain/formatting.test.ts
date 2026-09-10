import { describe, expect, it } from "vitest";
import { formatCurrency, formatWorkMinutes } from "./formatting";

describe("display formatting", () => {
  it("formats minute-only work time", () => {
    expect(formatWorkMinutes(32)).toBe("32分钟");
  });

  it("formats hours and padded minutes", () => {
    expect(formatWorkMinutes(909)).toBe("15小时09分钟");
    expect(formatWorkMinutes(180)).toBe("3小时");
  });

  it("formats currency without unnecessary decimals", () => {
    expect(formatCurrency(699)).toBe("¥699");
    expect(formatCurrency(34.95)).toBe("¥34.95");
  });
});

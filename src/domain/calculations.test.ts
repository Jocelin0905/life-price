import { describe, expect, it } from "vitest";
import {
  calculateHourlyIncome,
  calculateMonthlySummary,
  calculatePriceResult,
  calculateUsageCost,
  getLocalMonthKey,
} from "./calculations";

const settings = {
  monthlyIncome: 8000,
  workDaysPerWeek: 5,
  workHoursPerDay: 8,
};

describe("Life Price calculations", () => {
  it("calculates hourly income from current source settings", () => {
    expect(calculateHourlyIncome(settings)).toBeCloseTo(46.153846, 5);
  });

  it("converts 699 yuan to the PRD work-time example", () => {
    expect(calculatePriceResult(699, settings)).toEqual({
      price: 699,
      workMinutes: 909,
      workDays: 1.89,
      hourlyIncome: expect.closeTo(46.153846, 5),
    });
  });

  it("calculates optional per-use snapshots", () => {
    expect(calculateUsageCost(699, 909, 20)).toEqual({
      usageCount: 20,
      costPerUse: 34.95,
      minutesPerUse: 45,
    });
  });

  it("rejects invalid calculation inputs", () => {
    expect(() => calculatePriceResult(0, settings)).toThrow("有效金额");
    expect(() => calculateUsageCost(699, 909, 0)).toThrow("使用次数");
  });

  it("derives month keys from local date fields", () => {
    const date = new Date(2026, 8, 30, 23, 30);
    expect(getLocalMonthKey(date.toISOString())).toBe("2026-09");
  });

  it("aggregates immutable history snapshots", () => {
    const decisions = [
      {
        id: "a",
        name: "外套",
        price: 699,
        workMinutes: 909,
        workDays: 1.89,
        workHoursPerDay: 8,
        usageCount: null,
        costPerUse: null,
        minutesPerUse: null,
        decision: "skip" as const,
        createdAt: new Date(2026, 8, 10).toISOString(),
      },
      {
        id: "b",
        name: "香水",
        price: 899,
        workMinutes: 1169,
        workDays: 2.44,
        workHoursPerDay: 8,
        usageCount: null,
        costPerUse: null,
        minutesPerUse: null,
        decision: "skip" as const,
        createdAt: new Date(2026, 8, 3).toISOString(),
      },
    ];

    expect(calculateMonthlySummary(decisions, "2026-09")).toEqual({
      totalPrice: 1598,
      totalMinutes: 2078,
      totalWorkDays: 4.33,
      count: 2,
    });
  });
});

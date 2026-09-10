import type {
  DecisionRecord,
  IncomeInputs,
  MonthlySummary,
  PriceResult,
  UsageResult,
} from "./types";

const MONTHS_PER_YEAR = 12;
const WEEKS_PER_YEAR = 52;

function roundTo(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function assertPositive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`请输入有效${label}。`);
  }
}

export function calculateHourlyIncome(inputs: IncomeInputs) {
  assertPositive(inputs.monthlyIncome, "月收入");
  assertPositive(inputs.workDaysPerWeek, "工作天数");
  assertPositive(inputs.workHoursPerDay, "工作小时");
  if (inputs.workDaysPerWeek > 7) {
    throw new Error("每周工作天数应为 1–7 天。");
  }

  const monthlyWorkHours =
    inputs.workDaysPerWeek * inputs.workHoursPerDay * WEEKS_PER_YEAR / MONTHS_PER_YEAR;
  return inputs.monthlyIncome / monthlyWorkHours;
}

export function calculatePriceResult(price: number, inputs: IncomeInputs): PriceResult {
  assertPositive(price, "金额");
  const hourlyIncome = calculateHourlyIncome(inputs);
  const rawWorkMinutes = price / hourlyIncome * 60;

  return {
    price,
    workMinutes: Math.round(rawWorkMinutes),
    workDays: roundTo(rawWorkMinutes / 60 / inputs.workHoursPerDay, 2),
    hourlyIncome,
  };
}

export function calculateUsageCost(
  price: number,
  workMinutes: number,
  usageCount: number,
): UsageResult {
  assertPositive(price, "金额");
  assertPositive(workMinutes, "工作时间");
  if (!Number.isInteger(usageCount) || usageCount <= 0) {
    throw new Error("请输入有效使用次数。");
  }

  return {
    usageCount,
    costPerUse: roundTo(price / usageCount, 2),
    minutesPerUse: Math.round(workMinutes / usageCount),
  };
}

export function getLocalMonthKey(dateValue: string | Date) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export function calculateMonthlySummary(
  decisions: DecisionRecord[],
  monthKey: string,
): MonthlySummary {
  const records = decisions.filter((record) => getLocalMonthKey(record.createdAt) === monthKey);
  return {
    totalPrice: roundTo(records.reduce((sum, record) => sum + record.price, 0), 2),
    totalMinutes: records.reduce((sum, record) => sum + record.workMinutes, 0),
    totalWorkDays: roundTo(records.reduce((sum, record) => sum + record.workDays, 0), 2),
    count: records.length,
  };
}

export type IncomeInputs = {
  monthlyIncome: number;
  workDaysPerWeek: number;
  workHoursPerDay: number;
};

export type UserSettings = IncomeInputs & {
  hourlyIncome: number;
  updatedAt: string;
};

export type PriceResult = {
  price: number;
  workMinutes: number;
  workDays: number;
  hourlyIncome: number;
};

export type UsageResult = {
  usageCount: number;
  costPerUse: number;
  minutesPerUse: number;
};

export type DecisionRecord = {
  id: string;
  name: string;
  price: number;
  workMinutes: number;
  workDays: number;
  workHoursPerDay: number;
  usageCount: number | null;
  costPerUse: number | null;
  minutesPerUse: number | null;
  decision: "skip";
  createdAt: string;
};

export type LifePriceStore = {
  schemaVersion: 1;
  settings: UserSettings | null;
  decisions: DecisionRecord[];
};

export type PersistenceState = {
  status: "available" | "protected-memory";
  warning: string | null;
};

export type LoadedStore = {
  data: LifePriceStore;
  persistence: PersistenceState;
};

export type MonthlySummary = {
  totalPrice: number;
  totalMinutes: number;
  totalWorkDays: number;
  count: number;
};

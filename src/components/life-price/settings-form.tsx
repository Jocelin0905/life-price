"use client";

import { useMemo, useState } from "react";
import { calculateHourlyIncome } from "../../domain/calculations";
import { formatCurrency } from "../../domain/formatting";
import { isValidWorkDays, parsePositiveNumber } from "../../domain/validation";
import type { UserSettings } from "../../domain/types";

export function SettingsForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: UserSettings | null;
  submitLabel: string;
  onSubmit: (settings: UserSettings) => void;
}) {
  const [monthlyIncome, setMonthlyIncome] = useState(initial ? String(initial.monthlyIncome) : "");
  const [workDays, setWorkDays] = useState(initial ? String(initial.workDaysPerWeek) : "5");
  const [workHours, setWorkHours] = useState(initial ? String(initial.workHoursPerDay) : "8");
  const [error, setError] = useState("");

  const parsed = useMemo(() => {
    const income = parsePositiveNumber(monthlyIncome);
    const days = Number(workDays);
    const hours = parsePositiveNumber(workHours);
    if (!income || !hours || !isValidWorkDays(days)) return null;
    return { monthlyIncome: income, workDaysPerWeek: days, workHoursPerDay: hours };
  }, [monthlyIncome, workDays, workHours]);

  const hourlyIncome = parsed ? calculateHourlyIncome(parsed) : null;

  return (
    <form
      className="settings-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!parsed || hourlyIncome === null) {
          setError("请填写有效的收入和工作时间。");
          return;
        }
        setError("");
        onSubmit({ ...parsed, hourlyIncome, updatedAt: new Date().toISOString() });
      }}
    >
      <label className="field">
        <span>月收入</span>
        <span className="currency-field"><b>¥</b><input aria-label="月收入" inputMode="decimal" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder="8000" /></span>
        <small>建议填写每月实际到手收入。</small>
      </label>

      <div className="field-grid">
        <label className="field">
          <span>每周工作天数</span>
          <select aria-label="每周工作天数" value={workDays} onChange={(e) => setWorkDays(e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>{day} 天</option>)}
          </select>
        </label>
        <label className="field">
          <span>每天工作小时</span>
          <span className="unit-field"><input aria-label="每天工作小时" inputMode="decimal" value={workHours} onChange={(e) => setWorkHours(e.target.value)} /><b>小时</b></span>
        </label>
      </div>

      <div className="hourly-preview" aria-live="polite">
        <span>你的每小时收入</span>
        <strong>{hourlyIncome ? formatCurrency(hourlyIncome) : "待计算"}</strong>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit" disabled={!parsed}>{submitLabel}</button>
    </form>
  );
}

export function formatWorkMinutes(totalMinutes: number) {
  const safeMinutes = Math.max(0, Math.round(totalMinutes));
  if (safeMinutes < 60) return `${safeMinutes}分钟`;
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return minutes === 0 ? `${hours}小时` : `${hours}小时${String(minutes).padStart(2, "0")}分钟`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatLocalDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export function formatMonthLabel(monthKey: string, currentMonthKey: string) {
  if (monthKey === currentMonthKey) return "这个月";
  const [year, month] = monthKey.split("-").map(Number);
  return `${year}年${month}月`;
}

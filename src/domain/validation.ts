export function parsePositiveNumber(value: string) {
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function isValidWorkDays(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 7;
}

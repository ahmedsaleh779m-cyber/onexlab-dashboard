import { formatDistanceToNowStrict, parseISO } from "date-fns";

export function formatCurrency(
  amount: number | string | null | undefined,
  currency = "EGP"
): string {
  if (amount === null || amount === undefined || amount === "") return `0.00 ${currency}`;
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `0.00 ${currency}`;
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)} ${currency}`;
}

export function formatNumber(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined || value === "") return "0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatPercent(
  value: number | string | null | undefined,
  decimals = 1
): string {
  if (value === null || value === undefined || value === "") return "0.0%";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.0%";
  return `${num.toFixed(decimals)}%`;
}

export function formatRelativeTime(
  isoDate: string | Date | null | undefined
): string {
  if (!isoDate) return "never";
  try {
    const date = typeof isoDate === "string" ? parseISO(isoDate) : isoDate;
    if (isNaN(date.getTime())) return "unknown";
    return `${formatDistanceToNowStrict(date, { addSuffix: true })}`;
  } catch {
    return "unknown";
  }
}

export function truncate(
  str: string | null | undefined,
  length = 8
): string {
  if (!str) return "—";
  if (str.length <= length) return str;
  return `${str.slice(0, length)}…`;
}

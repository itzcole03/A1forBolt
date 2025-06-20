// betaTest4/src/utils/formatters.ts

export const formatDate = (
  date: string | Date,
  format: string = "yyyy-MM-dd HH:mm",
): string => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "Invalid Date";

  // Basic ISO-like format, can be expanded with a library like date-fns for complex needs
  if (format === "yyyy-MM-dd HH:mm") {
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Fallback to locale string for other/unspecified formats for now
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (
  amount: number,
  currency: string = "USD",
): string => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount,
  );
};

export const formatPercentage = (
  value: number,
  decimals: number = 2,
): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatOdds = (odds: number): string => {
  if (odds >= 2) {
    return `+${Math.round((odds - 1) * 100)}`;
  } else {
    return `-${Math.round(100 / (odds - 1))}`;
  }
};

export const formatDateTime = (date: string | Date): string => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "Invalid Date";

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ToastNotification type for use in notifications and toasts
export interface ToastNotification {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

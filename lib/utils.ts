import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Tailwind class merger ────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeTime(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

// ─── API response helpers ─────────────────────────────────────────────────────
export function apiSuccess<T>(data: T, message?: string) {
  return { success: true as const, data, ...(message && { message }) };
}

export function apiError(error: string) {
  return { success: false as const, error };
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "12"));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
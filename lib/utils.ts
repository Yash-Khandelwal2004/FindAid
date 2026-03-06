import {type ClassValue,clsx} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs:ClassValue[]){
  return twMerge(clsx(inputs))
}




export function apiSuccess<T>(data: T, message?: string) {
  return {
    success: true as const,
    data,
    ...(message && { message }),
  }
}

// Every error response looks like this:
// { success: false, error: "..." }
export function apiError(error: string) {
  return {
    success: false as const,
    error,
  }
}


export function getPagination(searchParams: URLSearchParams) {
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"))
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "12"))
  const skip  = (page - 1) * limit
  return { page, limit, skip }
}
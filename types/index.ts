// ── Aid categories ─────────────────────────────────────────────────────
export type AidCategory =
  | "blood"
  | "oxygen"
  | "wheelchair"
  | "medicine"
  | "equipment"
  | "other"

// ── Listing lifecycle ──────────────────────────────────────────────────
export type ListingStatus = "available" | "borrowed" | "unavailable"

// ── Borrow request lifecycle ───────────────────────────────────────────
export type RequestStatus =
  | "pending"    // submitted, waiting for owner response
  | "approved"   // owner said yes
  | "active"     // item physically handed over
  | "returned"   // item given back
  | "rejected"   // owner said no
  | "cancelled"  // requester withdrew

// ── Blood group ────────────────────────────────────────────────────────
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"

export type UrgencyLevel = "low" | "medium" | "critical"

export type PreferredContact = "phone" | "email" | "whatsapp"

// ── Every API route returns one of these two shapes ────────────────────
export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
}

// One type that covers both — useful on the frontend
export type ApiResponse<T> = ApiSuccess<T> | ApiError
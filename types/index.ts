export type AidCategory =
  | "blood"
  | "oxygen"
  | "wheelchair"
  | "medicine"
  | "equipment"
  | "other"

export type ListingStatus = "available" | "borrowed" | "unavailable"

export type RequestStatus =
  | "pending"   
  | "approved"  
  | "active"     
  | "returned"
  | "rejected"
  | "cancelled"

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"

export type UrgencyLevel = "low" | "medium" | "critical"

export type PreferredContact = "phone" | "email" | "whatsapp"

export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
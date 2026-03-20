/**
 * Consistent API response format
 * Following working agreement: Use consistent envelope for all API responses
 */

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    timestamp: string
  }
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T, meta?: Partial<PaginationMeta>): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Create an error API response
 */
export function createErrorResponse(error: string, meta?: Record<string, unknown>): ApiResponse<never> {
  return {
    success: false,
    error,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Standard error messages
 */
export const ErrorMessages = {
  VALIDATION_FAILED: "Input validation failed",
  UNAUTHORIZED: "Authentication required",
  FORBIDDEN: "Insufficient permissions",
  NOT_FOUND: "Resource not found",
  CONFLICT: "Resource already exists",
  RATE_LIMIT: "Too many requests, please try again later",
  INTERNAL_ERROR: "An unexpected error occurred",
  INVALID_CREDENTIALS: "Invalid email or password",
} as const

/**
 * Extract error message from unknown error
 * Following working agreement: Handle errors explicitly at every level
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return ErrorMessages.INTERNAL_ERROR
}

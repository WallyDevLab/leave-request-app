/**
 * Sanitize user input to prevent XSS and injection attacks
 */

/**
 * Sanitize text input by removing potentially dangerous characters
 */
export function sanitizeText(input: string): string {
  if (!input) return ""
  
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers like onclick=
    .substring(0, 1000) // Limit length
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ""
  
  const sanitized = email
    .trim()
    .toLowerCase()
    .replace(/[<>]/g, "")
    .substring(0, 254) // RFC 5321 email length limit
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(sanitized) ? sanitized : ""
}

/**
 * Sanitize name input (allows letters, spaces, hyphens, apostrophes)
 */
export function sanitizeName(name: string): string {
  if (!name) return ""
  
  return name
    .trim()
    .replace(/[^a-zA-Z\s\-']/g, "")
    .substring(0, 100)
}

/**
 * Validate and sanitize date
 */
export function sanitizeDate(date: Date | string): Date | null {
  if (!date) return null
  
  try {
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) return null
    
    // Ensure date is not too far in the past or future
    const now = new Date()
    const minDate = new Date(now.getFullYear() - 1, 0, 1)
    const maxDate = new Date(now.getFullYear() + 2, 11, 31)
    
    if (parsedDate < minDate || parsedDate > maxDate) return null
    
    return parsedDate
  } catch {
    return null
  }
}

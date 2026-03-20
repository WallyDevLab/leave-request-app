import { describe, it, expect } from "vitest"
import {
  EmailSchema,
  NameSchema,
  ReasonSchema,
  LeaveTypeSchema,
  ApproverEmailsSchema,
  LeaveRequestSubmissionSchema,
} from "./validation"

/**
 * Validation schema tests
 * Following working agreement TDD approach:
 * - Arrange, Act, Assert structure
 * - Test user-visible behavior
 * - Test edge cases: null, undefined, empty, large inputs, error paths
 */

describe("EmailSchema", () => {
  it("should accept valid email addresses", () => {
    // Arrange
    const validEmails = ["user@example.com", "test.user+tag@domain.co.uk", "name@subdomain.example.com"]

    // Act & Assert
    validEmails.forEach((email) => {
      const result = EmailSchema.safeParse(email)
      expect(result.success).toBe(true)
    })
  })

  it("should normalize email to lowercase and trim whitespace", () => {
    // Arrange
    const input = "  User@EXAMPLE.COM  "

    // Act
    const result = EmailSchema.parse(input)

    // Assert
    expect(result).toBe("user@example.com")
  })

  it("should reject invalid email formats", () => {
    // Arrange
    const invalidEmails = ["notanemail", "@example.com", "user@", "user @example.com"]

    // Act & Assert
    invalidEmails.forEach((email) => {
      const result = EmailSchema.safeParse(email)
      expect(result.success).toBe(false)
    })
  })

  it("should reject emails longer than 254 characters", () => {
    // Arrange
    const longEmail = "a".repeat(250) + "@example.com"

    // Act
    const result = EmailSchema.safeParse(longEmail)

    // Assert
    expect(result.success).toBe(false)
  })
})

describe("NameSchema", () => {
  it("should accept valid names", () => {
    // Arrange
    const validNames = ["John Doe", "Mary O'Brien", "Jean-Claude", "Anne-Marie"]

    // Act & Assert
    validNames.forEach((name) => {
      const result = NameSchema.safeParse(name)
      expect(result.success).toBe(true)
    })
  })

  it("should trim whitespace", () => {
    // Arrange
    const input = "  John Doe  "

    // Act
    const result = NameSchema.parse(input)

    // Assert
    expect(result).toBe("John Doe")
  })

  it("should reject names with numbers or special characters", () => {
    // Arrange
    const invalidNames = ["John123", "User@Example", "Test<script>"]

    // Act & Assert
    invalidNames.forEach((name) => {
      const result = NameSchema.safeParse(name)
      expect(result.success).toBe(false)
    })
  })

  it("should reject names shorter than 2 characters", () => {
    // Arrange
    const shortName = "A"

    // Act
    const result = NameSchema.safeParse(shortName)

    // Assert
    expect(result.success).toBe(false)
  })

  it("should reject names longer than 100 characters", () => {
    // Arrange
    const longName = "A".repeat(101)

    // Act
    const result = NameSchema.safeParse(longName)

    // Assert
    expect(result.success).toBe(false)
  })
})

describe("LeaveTypeSchema", () => {
  it("should accept valid leave types", () => {
    // Arrange
    const validTypes = ["Personal", "Family", "Sick"]

    // Act & Assert
    validTypes.forEach((type) => {
      const result = LeaveTypeSchema.safeParse(type)
      expect(result.success).toBe(true)
    })
  })

  it("should reject invalid leave types", () => {
    // Arrange
    const invalidTypes = ["Vacation", "Medical", "personal", "SICK"]

    // Act & Assert
    invalidTypes.forEach((type) => {
      const result = LeaveTypeSchema.safeParse(type)
      expect(result.success).toBe(false)
    })
  })
})

describe("ReasonSchema", () => {
  it("should accept reasons between 10 and 1000 characters", () => {
    // Arrange
    const validReason = "I need to attend a family event this weekend"

    // Act
    const result = ReasonSchema.safeParse(validReason)

    // Assert
    expect(result.success).toBe(true)
  })

  it("should reject reasons shorter than 10 characters", () => {
    // Arrange
    const shortReason = "Too short"

    // Act
    const result = ReasonSchema.safeParse(shortReason)

    // Assert
    expect(result.success).toBe(false)
  })

  it("should reject reasons longer than 1000 characters", () => {
    // Arrange
    const longReason = "A".repeat(1001)

    // Act
    const result = ReasonSchema.safeParse(longReason)

    // Assert
    expect(result.success).toBe(false)
  })

  it("should trim whitespace", () => {
    // Arrange
    const input = "  Valid reason for leave request  "

    // Act
    const result = ReasonSchema.parse(input)

    // Assert
    expect(result).toBe("Valid reason for leave request")
  })
})

describe("ApproverEmailsSchema", () => {
  it("should accept 2 to 6 valid unique emails", () => {
    // Arrange
    const validEmails = ["approver1@company.com", "approver2@company.com"]

    // Act
    const result = ApproverEmailsSchema.safeParse(validEmails)

    // Assert
    expect(result.success).toBe(true)
  })

  it("should reject less than 2 emails", () => {
    // Arrange
    const singleEmail = ["approver@company.com"]

    // Act
    const result = ApproverEmailsSchema.safeParse(singleEmail)

    // Assert
    expect(result.success).toBe(false)
  })

  it("should reject more than 6 emails", () => {
    // Arrange
    const tooManyEmails = Array.from({ length: 7 }, (_, i) => `approver${i}@company.com`)

    // Act
    const result = ApproverEmailsSchema.safeParse(tooManyEmails)

    // Assert
    expect(result.success).toBe(false)
  })

  it("should reject duplicate emails", () => {
    // Arrange
    const duplicateEmails = ["approver@company.com", "approver@company.com"]

    // Act
    const result = ApproverEmailsSchema.safeParse(duplicateEmails)

    // Assert
    expect(result.success).toBe(false)
  })
})

describe("LeaveRequestSubmissionSchema", () => {
  it("should accept valid leave request data", () => {
    // Arrange
    const validRequest = {
      name: "John Doe",
      email: "john@company.com",
      leaveType: "Personal",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-04-03"),
      reason: "Attending family wedding ceremony",
      approverEmails: ["manager@company.com", "hr@company.com"],
    }

    // Act
    const result = LeaveRequestSubmissionSchema.safeParse(validRequest)

    // Assert
    expect(result.success).toBe(true)
  })

  it("should reject when end date is before start date", () => {
    // Arrange
    const invalidRequest = {
      name: "John Doe",
      email: "john@company.com",
      leaveType: "Personal",
      startDate: new Date("2026-04-05"),
      endDate: new Date("2026-04-01"),
      reason: "Attending family wedding ceremony",
      approverEmails: ["manager@company.com", "hr@company.com"],
    }

    // Act
    const result = LeaveRequestSubmissionSchema.safeParse(invalidRequest)

    // Assert
    expect(result.success).toBe(false)
  })

  it("should reject missing required fields", () => {
    // Arrange
    const incompleteRequest = {
      name: "John Doe",
      email: "john@company.com",
      // Missing leaveType, dates, reason, approverEmails
    }

    // Act
    const result = LeaveRequestSubmissionSchema.safeParse(incompleteRequest)

    // Assert
    expect(result.success).toBe(false)
  })
})

import { z } from "zod"

/**
 * Validation schemas for leave tracker input
 * Following working agreement: schema-based validation at system boundaries
 */

// Leave type validation
export const LeaveTypeSchema = z.enum(["Personal", "Family", "Sick"], {
  errorMap: () => ({ message: "Leave type must be Personal, Family, or Sick" }),
})

// Email validation
export const EmailSchema = z
  .string()
  .email("Invalid email format")
  .max(254, "Email too long")
  .transform((email) => email.toLowerCase().trim())

// Name validation
export const NameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name too long")
  .regex(/^[a-zA-Z\s\-']+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
  .transform((name) => name.trim())

// Reason validation
export const ReasonSchema = z
  .string()
  .min(10, "Please provide a more detailed reason (at least 10 characters)")
  .max(1000, "Reason is too long (max 1000 characters)")
  .transform((reason) => reason.trim())

// Date validation
export const DateSchema = z.coerce
  .date()
  .refine((date) => {
    const now = new Date()
    const minDate = new Date(now.getFullYear() - 1, 0, 1)
    const maxDate = new Date(now.getFullYear() + 2, 11, 31)
    return date >= minDate && date <= maxDate
  }, "Date must be within reasonable range (past year to 2 years in future)")

// Approver email list validation
export const ApproverEmailsSchema = z
  .array(EmailSchema)
  .min(2, "At least 2 approvers are required")
  .max(6, "Maximum 6 approvers allowed")
  .refine((emails) => {
    const uniqueEmails = new Set(emails)
    return uniqueEmails.size === emails.length
  }, "Approver emails must be unique")

// Leave request submission schema
export const LeaveRequestSubmissionSchema = z
  .object({
    name: NameSchema,
    email: EmailSchema,
    leaveType: LeaveTypeSchema,
    startDate: DateSchema,
    endDate: DateSchema,
    reason: ReasonSchema,
    approverEmails: ApproverEmailsSchema,
  })
  .refine(
    (data) => {
      return data.endDate >= data.startDate
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  )

// Login credentials schema
export const LoginCredentialsSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Password is required"),
})

// Approval status update schema
export const ApprovalStatusSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  approverEmail: EmailSchema,
  status: z.enum(["approved", "rejected"]),
})

// Type exports for use throughout the app
export type LeaveRequestSubmission = z.infer<typeof LeaveRequestSubmissionSchema>
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>
export type LeaveTypeValue = z.infer<typeof LeaveTypeSchema>

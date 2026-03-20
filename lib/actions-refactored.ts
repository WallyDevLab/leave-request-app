"use server"

import { revalidatePath } from "next/cache"
import type { LeaveRequest, LeaveType, Approver } from "./types"
import { differenceInBusinessDays } from "date-fns"
import { LeaveRequestSubmissionSchema, ApprovalStatusSchema } from "./validation"
import { sendLeaveRequestEmail, sendApprovalConfirmationEmail, sendPartialApprovalEmail } from "./email"
import { log } from "./logger"
import { createSuccessResponse, createErrorResponse, getErrorMessage, ErrorMessages } from "./api-response"
import type { ApiResponse } from "./api-response"

/**
 * Leave tracker data layer
 * Following working agreement:
 * - Immutability: all updates create new objects
 * - Input validation: Zod schemas at system boundaries
 * - Error handling: explicit at every level
 * - Logging: Winston instead of console.log
 */

// Mock database (in production, use a real database)
let leaveRequests: readonly LeaveRequest[] = [
  {
    id: "1",
    name: "John Intern",
    email: "intern@company.com",
    leaveType: "Personal",
    startDate: new Date("2024-04-10"),
    endDate: new Date("2024-04-12"),
    reason: "Family vacation",
    status: "approved",
    daysRequested: 3,
    createdAt: new Date("2024-03-15"),
    approvers: [
      { email: "admin@company.com", name: "Admin User", status: "approved", approvedAt: new Date() },
      { email: "manager@company.com", name: "Manager", status: "approved", approvedAt: new Date() },
    ],
  },
]

/**
 * Submit a new leave request
 * Validates input, creates request, sends notifications
 */
export async function submitLeaveRequest(
  rawData: unknown
): Promise<ApiResponse<LeaveRequest>> {
  try {
    // Validate input at system boundary
    const validatedData = LeaveRequestSubmissionSchema.parse(rawData)

    log.info("Submitting leave request", { email: validatedData.email })

    // Calculate business days
    const daysRequested = differenceInBusinessDays(validatedData.endDate, validatedData.startDate) + 1

    if (daysRequested <= 0) {
      log.warn("Invalid date range", { startDate: validatedData.startDate, endDate: validatedData.endDate })
      return createErrorResponse("End date must be on or after start date")
    }

    // Create approvers (immutable)
    const approvers: readonly Approver[] = validatedData.approverEmails.map(
      (email): Approver => ({
        email,
        name: getApproverName(email),
        status: "pending",
      })
    )

    // Create new leave request (immutable)
    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      name: validatedData.name,
      email: validatedData.email,
      leaveType: validatedData.leaveType,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate,
      reason: validatedData.reason,
      status: "pending",
      daysRequested,
      createdAt: new Date(),
      approvers: [...approvers],
    }

    // Update database (immutable update)
    leaveRequests = [newRequest, ...leaveRequests]

    // Send email notifications (fire and forget, log errors)
    Promise.all(
      approvers.map((approver) =>
        sendLeaveRequestEmail(newRequest, approver.email, approver.name, newRequest.id).catch((error) => {
          log.error("Failed to send leave request email", {
            requestId: newRequest.id,
            approverEmail: approver.email,
            error: getErrorMessage(error),
          })
        })
      )
    )

    // Revalidate pages
    revalidatePath("/dashboard")
    revalidatePath("/admin")

    log.info("Leave request submitted successfully", { requestId: newRequest.id })

    return createSuccessResponse(newRequest)
  } catch (error) {
    log.error("Failed to submit leave request", { error: getErrorMessage(error) })

    if (error instanceof Error && error.name === "ZodError") {
      return createErrorResponse(ErrorMessages.VALIDATION_FAILED)
    }

    return createErrorResponse(getErrorMessage(error))
  }
}

/**
 * Get all leave requests
 */
export async function getLeaveRequests(): Promise<ApiResponse<readonly LeaveRequest[]>> {
  try {
    log.debug("Fetching all leave requests", { count: leaveRequests.length })
    return createSuccessResponse(leaveRequests)
  } catch (error) {
    log.error("Failed to fetch leave requests", { error: getErrorMessage(error) })
    return createErrorResponse(getErrorMessage(error))
  }
}

/**
 * Update leave request status
 * Handles approval/rejection workflow with email notifications
 */
export async function updateLeaveRequestStatus(
  requestId: string,
  approverEmail: string,
  newStatus: "approved" | "rejected"
): Promise<ApiResponse<LeaveRequest>> {
  try {
    // Validate inputs
    const validated = ApprovalStatusSchema.parse({
      requestId,
      approverEmail,
      status: newStatus,
    })

    log.info("Updating leave request status", {
      requestId: validated.requestId,
      approverEmail: validated.approverEmail,
      status: validated.status,
    })

    // Find request (immutable)
    const requestIndex = leaveRequests.findIndex((req) => req.id === validated.requestId)

    if (requestIndex === -1) {
      log.warn("Leave request not found", { requestId: validated.requestId })
      return createErrorResponse(ErrorMessages.NOT_FOUND)
    }

    const request = leaveRequests[requestIndex]

    // Find approver
    const approverIndex = request.approvers.findIndex((a) => a.email === validated.approverEmail)

    if (approverIndex === -1) {
      log.warn("Approver not found", { requestId: validated.requestId, approverEmail: validated.approverEmail })
      return createErrorResponse("Approver not authorized for this request")
    }

    // Update approver status (immutable)
    const updatedApprovers = request.approvers.map((approver, idx) =>
      idx === approverIndex
        ? { ...approver, status: validated.status, approvedAt: new Date() }
        : approver
    )

    // Count approvals and rejections
    const approvedCount = updatedApprovers.filter((a) => a.status === "approved").length
    const rejectedCount = updatedApprovers.filter((a) => a.status === "rejected").length

    // Determine overall status
    let overallStatus: LeaveRequest["status"] = "pending"
    let shouldSendEmail = false
    let emailType: "approved" | "partial" | null = null

    if (approvedCount >= 2) {
      overallStatus = "approved"
      shouldSendEmail = true
      emailType = "approved"
    } else if (rejectedCount >= 1 && approvedCount >= 1) {
      overallStatus = "partial"
      shouldSendEmail = true
      emailType = "partial"
    } else if (rejectedCount >= 2) {
      overallStatus = "rejected"
    }

    // Create updated request (immutable)
    const updatedRequest: LeaveRequest = {
      ...request,
      status: overallStatus,
      approvers: updatedApprovers,
    }

    // Update database (immutable)
    leaveRequests = leaveRequests.map((req, idx) => (idx === requestIndex ? updatedRequest : req))

    // Send appropriate email notification
    if (shouldSendEmail && emailType) {
      if (emailType === "approved") {
        sendApprovalConfirmationEmail(updatedRequest).catch((error) => {
          log.error("Failed to send approval confirmation email", {
            requestId: updatedRequest.id,
            error: getErrorMessage(error),
          })
        })
      } else if (emailType === "partial") {
        sendPartialApprovalEmail(updatedRequest).catch((error) => {
          log.error("Failed to send partial approval email", {
            requestId: updatedRequest.id,
            error: getErrorMessage(error),
          })
        })
      }
    }

    // Revalidate pages
    revalidatePath("/dashboard")
    revalidatePath("/admin")

    log.info("Leave request status updated", {
      requestId: updatedRequest.id,
      newStatus: overallStatus,
      approvedCount,
      rejectedCount,
    })

    return createSuccessResponse(updatedRequest)
  } catch (error) {
    log.error("Failed to update leave request status", {
      requestId,
      error: getErrorMessage(error),
    })

    if (error instanceof Error && error.name === "ZodError") {
      return createErrorResponse(ErrorMessages.VALIDATION_FAILED)
    }

    return createErrorResponse(getErrorMessage(error))
  }
}

/**
 * Get approver name from email
 * In production, this would query a user database
 */
function getApproverName(email: string): string {
  const users: Readonly<Record<string, string>> = {
    "admin@company.com": "Admin User",
    "manager@company.com": "Line Manager",
    "techlead@company.com": "Tech Lead",
    "hr@company.com": "HR Manager",
  }

  return users[email] || email.split("@")[0]
}

"use server"

import { revalidatePath } from "next/cache"
import type { LeaveRequest, LeaveType, Approver } from "./types"
import { differenceInBusinessDays } from "date-fns"
import { sanitizeText, sanitizeEmail, sanitizeName, sanitizeDate } from "./sanitize"
import { sendLeaveRequestEmail, sendApprovalConfirmationEmail, sendPartialApprovalEmail } from "./email"

// This is a mock database for demonstration purposes
// In a real application, you would use a database like Supabase, MongoDB, etc.
let leaveRequests: LeaveRequest[] = [
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

interface SubmitLeaveRequestData {
  name: string
  email: string
  leaveType: LeaveType
  startDate: Date
  endDate: Date
  reason: string
  approverEmails: string[]
}

export async function submitLeaveRequest(data: SubmitLeaveRequestData) {
  // Sanitize all inputs
  const sanitizedData = {
    name: sanitizeName(data.name),
    email: sanitizeEmail(data.email),
    leaveType: data.leaveType,
    reason: sanitizeText(data.reason),
    startDate: sanitizeDate(data.startDate),
    endDate: sanitizeDate(data.endDate),
    approverEmails: data.approverEmails
      .map(email => sanitizeEmail(email))
      .filter(email => email !== ""),
  }

  // Validate sanitized data
  if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.reason) {
    throw new Error("Invalid input data")
  }

  if (!sanitizedData.startDate || !sanitizedData.endDate) {
    throw new Error("Invalid dates")
  }

  if (sanitizedData.approverEmails.length < 2) {
    throw new Error("At least 2 approvers are required")
  }

  // Calculate business days between start and end date
  const daysRequested = differenceInBusinessDays(sanitizedData.endDate, sanitizedData.startDate) + 1

  // Create approvers array
  const approvers: Approver[] = sanitizedData.approverEmails.map(email => ({
    email,
    name: getApproverName(email),
    status: "pending" as const,
  }))

  // Create a new leave request
  const newRequest: LeaveRequest = {
    id: Date.now().toString(),
    name: sanitizedData.name,
    email: sanitizedData.email,
    leaveType: sanitizedData.leaveType,
    startDate: sanitizedData.startDate,
    endDate: sanitizedData.endDate,
    reason: sanitizedData.reason,
    status: "pending",
    daysRequested,
    createdAt: new Date(),
    approvers,
  }

  // Add to our mock database
  leaveRequests.unshift(newRequest)

  // Send email notifications to all approvers
  try {
    for (const approver of approvers) {
      await sendLeaveRequestEmail(newRequest, approver.email, approver.name, newRequest.id)
    }
  } catch (error) {
    console.error("Failed to send email notifications:", error)
  }

  // Revalidate the dashboard page to show the new request
  revalidatePath("/dashboard")
  revalidatePath("/admin")

  return newRequest
}

export async function getLeaveRequests(): Promise<LeaveRequest[]> {
  // In a real application, you would fetch from a database
  return leaveRequests
}

export async function updateLeaveRequestStatus(
  id: string,
  approverEmail: string,
  status: "approved" | "rejected"
) {
  // Find the request
  const request = leaveRequests.find(req => req.id === id)

  if (!request) {
    throw new Error("Leave request not found")
  }

  // Find the approver
  const approver = request.approvers.find(a => a.email === approverEmail)

  if (!approver) {
    throw new Error("Approver not found")
  }

  // Update the approver status
  approver.status = status
  approver.approvedAt = new Date()

  // Count approvals and rejections
  const approvedCount = request.approvers.filter(a => a.status === "approved").length
  const rejectedCount = request.approvers.filter(a => a.status === "rejected").length

  // Update overall request status based on approvals
  if (approvedCount >= 2) {
    request.status = "approved"
    // Send approval confirmation email
    try {
      await sendApprovalConfirmationEmail(request)
    } catch (error) {
      console.error("Failed to send approval confirmation email:", error)
    }
  } else if (rejectedCount >= 1 && approvedCount >= 1) {
    request.status = "partial"
    // Send partial approval email
    try {
      await sendPartialApprovalEmail(request)
    } catch (error) {
      console.error("Failed to send partial approval email:", error)
    }
  } else if (rejectedCount >= 2) {
    request.status = "rejected"
  }

  // Update in the array
  leaveRequests = leaveRequests.map(req => (req.id === id ? request : req))

  // Revalidate the pages
  revalidatePath("/dashboard")
  revalidatePath("/admin")

  return request
}

// Helper function to get approver name (in real app, this would query a user database)
function getApproverName(email: string): string {
  const users: { [key: string]: string } = {
    "admin@company.com": "Admin User",
    "manager@company.com": "Line Manager",
    "techlead@company.com": "Tech Lead",
    "hr@company.com": "HR Manager",
  }
  return users[email] || email.split("@")[0]
}



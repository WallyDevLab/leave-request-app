export type LeaveType = "Personal" | "Family" | "Sick"

export interface Approver {
  email: string
  name: string
  status: "pending" | "approved" | "rejected"
  approvedAt?: Date
}

export interface LeaveRequest {
  id: string
  name: string
  email: string
  leaveType: LeaveType
  startDate: Date
  endDate: Date
  reason: string
  status: "pending" | "approved" | "rejected" | "partial"
  createdAt?: Date
  daysRequested: number
  approvers: Approver[]
}

export interface User {
  email: string
  name: string
  totalLeaveDays: number
  usedLeaveDays: number
  remainingLeaveDays: number
}


"use client"

import { format } from "date-fns"
import { Calendar, Clock, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LeaveRequest } from "@/lib/types"

interface LeaveRequestCardProps {
  request: LeaveRequest
}

export function LeaveRequestCard({ request }: LeaveRequestCardProps) {
  const getStatusColor = (status: LeaveRequest["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "partial":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-primary/20 text-primary border-primary/30"
    }
  }

  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType) {
      case "Personal":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Family":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "Sick":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getApproverStatusIcon = (status: string) => {
    if (status === "approved") return "✓"
    if (status === "rejected") return "✗"
    return "⏳"
  }

  const approvedCount = request.approvers.filter(a => a.status === "approved").length
  const rejectedCount = request.approvers.filter(a => a.status === "rejected").length

  return (
    <Card className="border-border hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-primary">Leave Request</CardTitle>
            <CardDescription>
              Submitted {format(new Date(request.createdAt || new Date()), "MMM d, yyyy")}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={getLeaveTypeColor(request.leaveType)}>{request.leaveType}</Badge>
          <span className="text-sm text-muted-foreground">
            {request.daysRequested} business day{request.daysRequested !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm">
              {format(new Date(request.startDate), "MMM d, yyyy")} to {format(new Date(request.endDate), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Reason:</p>
          <p className="text-sm bg-muted/50 p-3 rounded-md">{request.reason}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary">Approval Progress:</p>
            <span className="text-xs text-muted-foreground">
              {approvedCount} of 2 required approvals
            </span>
          </div>
          <div className="space-y-2">
            {request.approvers.map((approver, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/30 border">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{approver.name}</p>
                    <p className="text-xs text-muted-foreground">{approver.email}</p>
                  </div>
                </div>
                <span className="text-sm">
                  {getApproverStatusIcon(approver.status)} {approver.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {request.status === "pending" && (
          <div className="bg-primary/10 border border-primary/30 rounded-md p-3">
            <p className="text-sm text-primary">
              ⏳ Your request is pending approval. Emails have been sent to all approvers.
            </p>
          </div>
        )}

        {request.status === "partial" && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3">
            <p className="text-sm text-yellow-400">
              ⚠️ Mixed responses: Your request has {approvedCount} approval(s) and {rejectedCount} rejection(s). Please
              contact the approver(s) who rejected to discuss next steps.
            </p>
          </div>
        )}

        {request.status === "approved" && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3">
            <p className="text-sm text-green-400">
              ✓ Your leave request has been approved! You have received {approvedCount} approvals. Enjoy your time off!
            </p>
          </div>
        )}

        {request.status === "rejected" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3">
            <p className="text-sm text-red-400">
              ✗ Your leave request has been rejected. Please contact your approvers for more information.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

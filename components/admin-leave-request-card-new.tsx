"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Check, X, Clock, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { updateLeaveRequestStatus } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import type { LeaveRequest, Approver } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"

interface AdminLeaveRequestCardProps {
  request: LeaveRequest
  onUpdate?: () => void
}

export function AdminLeaveRequestCard({ request, onUpdate }: AdminLeaveRequestCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const currentUser = getCurrentUser()

  const handleApproval = async (status: "approved" | "rejected") => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to approve requests",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      await updateLeaveRequestStatus(request.id, currentUser.email, status)

      toast({
        title: "Success",
        description: `Leave request ${status}`,
      })

      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} request`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

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

  const getApproverStatus = (approver: Approver) => {
    if (approver.status === "approved") {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">✓ Approved</Badge>
    } else if (approver.status === "rejected") {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">✗ Rejected</Badge>
    } else {
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">⏳ Pending</Badge>
    }
  }

  const currentApprover = request.approvers.find(a => a.email === currentUser?.email)
  const canApprove = currentApprover && currentApprover.status === "pending"

  const approvedCount = request.approvers.filter(a => a.status === "approved").length
  const rejectedCount = request.approvers.filter(a => a.status === "rejected").length

  return (
    <Card className="border-border hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-primary">{request.name}</CardTitle>
            <CardDescription>{request.email}</CardDescription>
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
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Submitted {format(new Date(request.createdAt || new Date()), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Reason:</p>
          <p className="text-sm bg-muted/50 p-3 rounded-md">{request.reason}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary">Approval Status:</p>
            <span className="text-xs text-muted-foreground">
              {approvedCount} of 2 required approvals
            </span>
          </div>
          <div className="space-y-2">
            {request.approvers.map((approver, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md border",
                  approver.email === currentUser?.email ? "bg-primary/5 border-primary/30" : "bg-muted/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{approver.name}</p>
                    <p className="text-xs text-muted-foreground">{approver.email}</p>
                  </div>
                </div>
                {getApproverStatus(approver)}
              </div>
            ))}
          </div>
        </div>

        {request.status === "partial" && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3">
            <p className="text-sm text-yellow-400">
              ⚠️ Mixed responses: This request has {approvedCount} approval(s) and {rejectedCount} rejection(s). The
              intern has been notified to follow up.
            </p>
          </div>
        )}

        {request.status === "approved" && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3">
            <p className="text-sm text-green-400">
              ✓ This request has been approved with {approvedCount} approvals. Confirmation email sent to intern.
            </p>
          </div>
        )}
      </CardContent>

      {canApprove && (
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-green-500/30 hover:bg-green-500/20 hover:text-green-400"
            onClick={() => handleApproval("approved")}
            disabled={isProcessing}
          >
            <Check className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-500/30 hover:bg-red-500/20 hover:text-red-400"
            onClick={() => handleApproval("rejected")}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </CardFooter>
      )}

      {!canApprove && currentApprover && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            You have already {currentApprover.status} this request
            {currentApprover.approvedAt && ` on ${format(new Date(currentApprover.approvedAt), "MMM d, yyyy")}`}
          </p>
        </CardFooter>
      )}
    </Card>
  )
}

// Helper function for cn
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

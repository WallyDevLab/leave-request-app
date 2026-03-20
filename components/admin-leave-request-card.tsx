"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import type { LeaveRequest } from "@/lib/types"
import { updateLeaveRequestStatus } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"

interface AdminLeaveRequestCardProps {
  request: LeaveRequest
}

export function AdminLeaveRequestCard({ request }: AdminLeaveRequestCardProps) {
  const { id, name, email, startDate, endDate, reason, status, daysRequested } = request
  const [isUpdating, setIsUpdating] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const handleApprove = async () => {
    setIsUpdating(true)
    try {
      await updateLeaveRequestStatus(id, "approved")
      toast({
        title: "Request Approved",
        description: `Leave request for ${name} has been approved.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReject = async () => {
    setIsUpdating(true)
    try {
      await updateLeaveRequestStatus(id, "rejected")
      toast({
        title: "Request Rejected",
        description: `Leave request for ${name} has been rejected.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{name}</CardTitle>
          <Badge className={getStatusColor(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{email}</p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Start Date:</span>
            <span>{format(new Date(startDate), "PPP")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">End Date:</span>
            <span>{format(new Date(endDate), "PPP")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Days Requested:</span>
            <span>
              {daysRequested} day{daysRequested !== 1 && "s"}
            </span>
          </div>
          <div className="pt-2">
            <p className="text-sm font-medium">Reason:</p>
            <p className="text-sm mt-1">{reason}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex flex-col gap-2">
        <p className="text-xs text-muted-foreground w-full">Submitted on {format(new Date(), "PPP")}</p>

        {status === "pending" && (
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
              onClick={handleReject}
              disabled={isUpdating}
            >
              <X className="w-4 h-4 mr-1" /> Reject
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
              onClick={handleApprove}
              disabled={isUpdating}
            >
              <Check className="w-4 h-4 mr-1" /> Approve
            </Button>
          </div>
        )}

        {status !== "pending" && (
          <div className="w-full text-center text-sm text-muted-foreground">
            {status === "approved" ? "This request has been approved" : "This request has been rejected"}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}


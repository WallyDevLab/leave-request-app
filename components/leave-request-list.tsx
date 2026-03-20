import { LeaveRequestCard } from "@/components/leave-request-card-new"
import type { LeaveRequest } from "@/lib/types"

interface LeaveRequestListProps {
  leaveRequests: LeaveRequest[]
}

export function LeaveRequestList({ leaveRequests }: LeaveRequestListProps) {
  if (leaveRequests.length === 0) {
    return (
      <div className="text-center p-10 border rounded-lg">
        <p className="text-muted-foreground">No leave requests found</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {leaveRequests.map((request) => (
        <LeaveRequestCard key={request.id} request={request} />
      ))}
    </div>
  )
}


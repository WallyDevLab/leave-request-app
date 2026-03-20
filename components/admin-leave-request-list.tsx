import { AdminLeaveRequestCard } from "@/components/admin-leave-request-card-new"
import type { LeaveRequest } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdminLeaveRequestListProps {
  leaveRequests: LeaveRequest[]
}

export function AdminLeaveRequestList({ leaveRequests }: AdminLeaveRequestListProps) {
  const pendingRequests = leaveRequests.filter((request) => request.status === "pending")
  const partialRequests = leaveRequests.filter((request) => request.status === "partial")
  const approvedRequests = leaveRequests.filter((request) => request.status === "approved")
  const rejectedRequests = leaveRequests.filter((request) => request.status === "rejected")

  if (leaveRequests.length === 0) {
    return (
      <div className="text-center p-10 border rounded-lg">
        <p className="text-muted-foreground">No leave requests found</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
        <TabsTrigger value="partial">Partial ({partialRequests.length})</TabsTrigger>
        <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
        <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-0">
        {pendingRequests.length === 0 ? (
          <div className="text-center p-10 border rounded-lg">
            <p className="text-muted-foreground">No pending requests</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingRequests.map((request) => (
              <AdminLeaveRequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="partial" className="mt-0">
        {partialRequests.length === 0 ? (
          <div className="text-center p-10 border rounded-lg">
            <p className="text-muted-foreground">No partially approved requests</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {partialRequests.map((request) => (
              <AdminLeaveRequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="approved" className="mt-0">
        {approvedRequests.length === 0 ? (
          <div className="text-center p-10 border rounded-lg">
            <p className="text-muted-foreground">No approved requests</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {approvedRequests.map((request) => (
              <AdminLeaveRequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="rejected" className="mt-0">
        {rejectedRequests.length === 0 ? (
          <div className="text-center p-10 border rounded-lg">
            <p className="text-muted-foreground">No rejected requests</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rejectedRequests.map((request) => (
              <AdminLeaveRequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}


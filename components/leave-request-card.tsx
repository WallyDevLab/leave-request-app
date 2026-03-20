import { format } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LeaveRequest } from "@/lib/types"

interface LeaveRequestCardProps {
  request: LeaveRequest
}

export function LeaveRequestCard({ request }: LeaveRequestCardProps) {
  const { name, email, startDate, endDate, reason, status, daysRequested } = request

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
      <CardFooter className="pt-2">
        <p className="text-xs text-muted-foreground">Submitted on {format(new Date(), "PPP")}</p>
      </CardFooter>
    </Card>
  )
}


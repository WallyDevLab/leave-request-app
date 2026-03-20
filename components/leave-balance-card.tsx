import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { User } from "@/lib/types"

interface LeaveBalanceCardProps {
  user: User
}

export function LeaveBalanceCard({ user }: LeaveBalanceCardProps) {
  const { totalLeaveDays, usedLeaveDays, remainingLeaveDays } = user
  const percentageUsed = (usedLeaveDays / totalLeaveDays) * 100

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Leave Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Remaining Leave Days:</span>
            <span className="text-xl font-bold">{remainingLeaveDays}</span>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Used: {usedLeaveDays} days</span>
              <span>Total: {totalLeaveDays} days</span>
            </div>
            <Progress value={percentageUsed} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


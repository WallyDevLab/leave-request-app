"use client"

import { useEffect, useState } from "react"
import { LeaveRequestList } from "@/components/leave-request-list"
import { LeaveBalanceCard } from "@/components/leave-balance-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getLeaveRequests } from "@/lib/actions"
import { getCurrentUser, type AuthUser } from "@/lib/auth"
import type { LeaveRequest } from "@/lib/types"

export default function Dashboard() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = getCurrentUser()
        setUser(currentUser)

        if (currentUser) {
          const requests = await getLeaveRequests()
          // Filter requests to only show the current user's requests
          const userRequests = requests.filter((req) => req.email === currentUser.email)
          setLeaveRequests(userRequests)
        }
      } catch (error) {
        console.error("Failed to load data", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return <div className="container mx-auto py-10 px-4 text-center">Loading...</div>
  }

  if (!user) {
    return <div className="container mx-auto py-10 px-4 text-center">Please log in to view your dashboard</div>
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Leave Requests</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/request">New Request</Link>
          </Button>
        </div>
      </div>

      <LeaveBalanceCard user={user} />

      <LeaveRequestList leaveRequests={leaveRequests} />
    </main>
  )
}


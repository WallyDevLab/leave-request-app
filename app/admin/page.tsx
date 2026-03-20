"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLeaveRequestList } from "@/components/admin-leave-request-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getLeaveRequests } from "@/lib/actions"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import type { LeaveRequest } from "@/lib/types"

export default function AdminDashboard() {
  const router = useRouter()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = getCurrentUser()

        // Check if user is admin
        if (!currentUser || !isAdmin(currentUser)) {
          router.push("/dashboard")
          return
        }

        const requests = await getLeaveRequests()
        setLeaveRequests(requests)
      } catch (error) {
        console.error("Failed to load data", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  if (isLoading) {
    return <div className="container mx-auto py-10 px-4 text-center">Loading...</div>
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">View My Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Leave Requests Management</h2>
        <p className="text-muted-foreground">Review and manage leave requests from all interns.</p>
      </div>

      <AdminLeaveRequestList leaveRequests={leaveRequests} />
    </main>
  )
}


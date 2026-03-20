"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LeaveRequestForm } from "@/components/leave-request-form-new"
import { getCurrentUser, type AuthUser } from "@/lib/auth"

export default function RequestPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser()
      setUser(currentUser)
      setIsLoading(false)

      if (!currentUser) {
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return <div className="container mx-auto py-10 px-4 text-center">Loading...</div>
  }

  if (!user) {
    return <div className="container mx-auto py-10 px-4 text-center">Please log in to submit a request</div>
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">Submit Leave Request</h1>
      <div className="max-w-3xl mx-auto">
        <LeaveRequestForm user={user} />
      </div>
    </main>
  )
}


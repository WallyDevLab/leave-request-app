"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon } from "lucide-react"
import { format, differenceInBusinessDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { submitLeaveRequest } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import type { AuthUser } from "@/lib/auth"

interface LeaveRequestFormProps {
  user: AuthUser
}

export function LeaveRequestForm({ user }: LeaveRequestFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [reason, setReason] = useState("")
  const [daysRequested, setDaysRequested] = useState(0)

  // Calculate business days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const days = differenceInBusinessDays(endDate, startDate) + 1 // Include start day
      setDaysRequested(days > 0 ? days : 0)
    } else {
      setDaysRequested(0)
    }
  }, [startDate, endDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startDate || !endDate || !reason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (daysRequested > user.remainingLeaveDays) {
      toast({
        title: "Error",
        description: "You don't have enough leave days remaining",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await submitLeaveRequest({
        name: user.name,
        email: user.email,
        startDate,
        endDate,
        reason,
        status: "pending",
      })

      toast({
        title: "Success",
        description: "Your leave request has been submitted",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Leave</CardTitle>
        <CardDescription>Submit your leave request for approval</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              You have <span className="font-bold">{user.remainingLeaveDays}</span> leave days remaining out of{" "}
              {user.totalLeaveDays} total days.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Employee</Label>
            <div className="p-2 border rounded-md bg-muted">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {daysRequested > 0 && (
            <Alert
              className={cn(
                daysRequested > user.remainingLeaveDays
                  ? "bg-red-100 text-red-800 border-red-200"
                  : "bg-green-100 text-green-800 border-green-200",
              )}
            >
              <AlertDescription>
                This request will use <span className="font-bold">{daysRequested}</span> business day
                {daysRequested !== 1 && "s"}.
                {daysRequested > user.remainingLeaveDays && (
                  <span className="block mt-1 font-semibold">Warning: You don't have enough leave days remaining.</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave</Label>
            <Textarea
              id="reason"
              placeholder="Please provide details about your leave request"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting || daysRequested > user.remainingLeaveDays}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}


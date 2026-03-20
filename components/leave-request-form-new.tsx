"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Plus, X } from "lucide-react"
import { format, differenceInBusinessDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { submitLeaveRequest } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import type { AuthUser } from "@/lib/auth"
import type { LeaveType } from "@/lib/types"

interface LeaveRequestFormProps {
  user: AuthUser
}

export function LeaveRequestForm({ user }: LeaveRequestFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [leaveType, setLeaveType] = useState<LeaveType>("Personal")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [reason, setReason] = useState("")
  const [daysRequested, setDaysRequested] = useState(0)
  const [approverEmails, setApproverEmails] = useState<string[]>(["", ""])

  // Calculate business days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const days = differenceInBusinessDays(endDate, startDate) + 1 // Include start day
      setDaysRequested(days > 0 ? days : 0)
    } else {
      setDaysRequested(0)
    }
  }, [startDate, endDate])

  const addApprover = () => {
    if (approverEmails.length < 6) {
      setApproverEmails([...approverEmails, ""])
    }
  }

  const removeApprover = (index: number) => {
    if (approverEmails.length > 2) {
      setApproverEmails(approverEmails.filter((_, i) => i !== index))
    }
  }

  const updateApprover = (index: number, value: string) => {
    const newApprovers = [...approverEmails]
    newApprovers[index] = value
    setApproverEmails(newApprovers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startDate || !endDate || !reason || !leaveType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate approvers
    const validApprovers = approverEmails.filter(email => email.trim() !== "")
    if (validApprovers.length < 2) {
      toast({
        title: "Error",
        description: "Please add at least 2 approvers",
        variant: "destructive",
      })
      return
    }

    // Check for valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = validApprovers.filter(email => !emailRegex.test(email))
    if (invalidEmails.length > 0) {
      toast({
        title: "Error",
        description: "Please enter valid email addresses for all approvers",
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
        leaveType,
        startDate,
        endDate,
        reason,
        approverEmails: validApprovers,
      })

      toast({
        title: "Success",
        description: "Your leave request has been submitted and emails sent to approvers",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit leave request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-primary">Request Leave</CardTitle>
        <CardDescription>Submit your leave request for approval</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Alert className="border-primary/20 bg-card">
            <AlertDescription>
              You have <span className="font-bold text-primary">{user.remainingLeaveDays}</span> leave days remaining
              out of {user.totalLeaveDays} total days.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Employee</Label>
            <div className="p-3 border rounded-md bg-muted/50">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type *</Label>
            <Select value={leaveType} onValueChange={(value: LeaveType) => setLeaveType(value)}>
              <SelectTrigger id="leaveType">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Personal">Personal Leave</SelectItem>
                <SelectItem value="Family">Family Leave</SelectItem>
                <SelectItem value="Sick">Sick Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
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
              <Label>End Date *</Label>
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
                "border-l-4",
                daysRequested > user.remainingLeaveDays
                  ? "bg-destructive/10 text-destructive border-destructive"
                  : "bg-primary/10 text-primary border-primary"
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
            <Label htmlFor="reason">Reason for Leave *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide details about your leave request"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Approvers * (Minimum 2 required)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addApprover} disabled={approverEmails.length >= 6}>
                <Plus className="h-4 w-4 mr-1" />
                Add Approver
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Add email addresses of your line manager, tech lead, senior, and HR
            </p>
            <div className="space-y-2">
              {approverEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder={`Approver ${index + 1} email`}
                    value={email}
                    onChange={e => updateApprover(index, e.target.value)}
                    className="flex-1"
                  />
                  {approverEmails.length > 2 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => removeApprover(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
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

"use server"

import type { LeaveRequest } from "./types"

/**
 * Email service for sending leave request notifications
 * In production, this would integrate with services like Resend, SendGrid, etc.
 */

interface EmailOptions {
  to: string
  subject: string
  html: string
}

/**
 * Mock email sender (replace with actual email service in production)
 */
async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  // In production, integrate with an email service:
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({ from: 'noreply@mtn.com', to, subject, html })
  
  console.log(`
    ===== EMAIL SENT =====
    To: ${to}
    Subject: ${subject}
    Body: ${html}
    ======================
  `)
  
  return true
}

/**
 * Send leave request notification to approvers
 */
export async function sendLeaveRequestEmail(
  request: LeaveRequest,
  approverEmail: string,
  approverName: string,
  requestId: string
): Promise<boolean> {
  const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin?requestId=${requestId}`
  
  const subject = `Leave Request from ${request.name}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1e1e1e; border-radius: 8px; padding: 30px; }
        .header { background-color: #ffcc00; color: #121212; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px 0; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: #2a2a2a; border-radius: 4px; }
        .label { font-weight: bold; color: #ffcc00; }
        .button { background-color: #ffcc00; color: #121212; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #2a2a2a; font-size: 12px; color: #888888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Leave Request Approval Needed</h1>
        </div>
        <div class="content">
          <p>Dear ${approverName},</p>
          <p>You have received a new leave request that requires your approval:</p>
          
          <div class="detail-row">
            <span class="label">Employee:</span> ${request.name}
          </div>
          <div class="detail-row">
            <span class="label">Email:</span> ${request.email}
          </div>
          <div class="detail-row">
            <span class="label">Leave Type:</span> ${request.leaveType}
          </div>
          <div class="detail-row">
            <span class="label">Start Date:</span> ${new Date(request.startDate).toLocaleDateString()}
          </div>
          <div class="detail-row">
            <span class="label">End Date:</span> ${new Date(request.endDate).toLocaleDateString()}
          </div>
          <div class="detail-row">
            <span class="label">Days Requested:</span> ${request.daysRequested} business day(s)
          </div>
          <div class="detail-row">
            <span class="label">Reason:</span> ${request.reason}
          </div>
          
          <p style="margin-top: 20px;">Please review and approve or reject this request by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${approvalUrl}" class="button">Review Leave Request</a>
          </div>
          
          <p style="margin-top: 20px; font-size: 14px; color: #888888;">
            Note: This request requires 2 approvals before the intern receives confirmation.
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message from the MTN Intern Leave Tracker. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  return await sendEmail({ to: approverEmail, subject, html })
}

/**
 * Send approval confirmation email to intern
 */
export async function sendApprovalConfirmationEmail(request: LeaveRequest): Promise<boolean> {
  const subject = `Leave Request Approved`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1e1e1e; border-radius: 8px; padding: 30px; }
        .header { background-color: #00cc00; color: #ffffff; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px 0; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: #2a2a2a; border-radius: 4px; }
        .label { font-weight: bold; color: #ffcc00; }
        .approvers { margin-top: 20px; }
        .approver { padding: 8px; background-color: #2a2a2a; margin: 5px 0; border-radius: 4px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #2a2a2a; font-size: 12px; color: #888888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Leave Request Approved</h1>
        </div>
        <div class="content">
          <p>Dear ${request.name},</p>
          <p>Great news! Your leave request has been approved with the required 2 approvals.</p>
          
          <div class="detail-row">
            <span class="label">Leave Type:</span> ${request.leaveType}
          </div>
          <div class="detail-row">
            <span class="label">Start Date:</span> ${new Date(request.startDate).toLocaleDateString()}
          </div>
          <div class="detail-row">
            <span class="label">End Date:</span> ${new Date(request.endDate).toLocaleDateString()}
          </div>
          <div class="detail-row">
            <span class="label">Days:</span> ${request.daysRequested} business day(s)
          </div>
          
          <div class="approvers">
            <p><span class="label">Approved by:</span></p>
            ${request.approvers
              .filter(a => a.status === "approved")
              .map(a => `<div class="approver">✓ ${a.name} (${a.email})</div>`)
              .join("")}
          </div>
          
          <p style="margin-top: 20px;">You can now proceed with your leave plans. Enjoy your time off!</p>
        </div>
        <div class="footer">
          <p>This is an automated message from the MTN Intern Leave Tracker.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  return await sendEmail({ to: request.email, subject, html })
}

/**
 * Send partial approval notification (1 approval, 1 rejection)
 */
export async function sendPartialApprovalEmail(request: LeaveRequest): Promise<boolean> {
  const approved = request.approvers.filter(a => a.status === "approved")
  const rejected = request.approvers.filter(a => a.status === "rejected")
  
  const subject = `Leave Request Requires Follow Up`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #1e1e1e; border-radius: 8px; padding: 30px; }
        .header { background-color: #ff9900; color: #121212; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { padding: 20px 0; }
        .detail-row { margin: 10px 0; padding: 10px; background-color: #2a2a2a; border-radius: 4px; }
        .label { font-weight: bold; color: #ffcc00; }
        .status-section { margin: 15px 0; }
        .approved { color: #00cc00; }
        .rejected { color: #ff0000; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #2a2a2a; font-size: 12px; color: #888888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Leave Request Status Update</h1>
        </div>
        <div class="content">
          <p>Dear ${request.name},</p>
          <p>Your leave request has received mixed responses and requires follow up.</p>
          
          <div class="detail-row">
            <span class="label">Leave Type:</span> ${request.leaveType}
          </div>
          <div class="detail-row">
            <span class="label">Dates:</span> ${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()}
          </div>
          
          <div class="status-section">
            <p class="approved"><strong>✓ Approved by:</strong></p>
            ${approved.map(a => `<div>${a.name} (${a.email})</div>`).join("")}
          </div>
          
          <div class="status-section">
            <p class="rejected"><strong>✗ Rejected by:</strong></p>
            ${rejected.map(a => `<div>${a.name} (${a.email})</div>`).join("")}
          </div>
          
          <p style="margin-top: 20px; padding: 15px; background-color: #2a2a2a; border-left: 4px solid #ff9900; border-radius: 4px;">
            <strong>Action Required:</strong> Please contact ${rejected[0].name} (${rejected[0].email}) to discuss the rejection and determine next steps.
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message from the MTN Intern Leave Tracker.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  return await sendEmail({ to: request.email, subject, html })
}

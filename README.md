# MTN Intern Leave Tracker

A modern, full featured leave management system for MTN interns with email notifications, multi-approver workflow, and comprehensive tracking.

## ✨ Features

### Core Functionality
- **Leave Request Submission**: Interns can submit leave requests with dates, type, and reason
- **Multi-Approver System**: Requires 2 approvals before leave is confirmed
- **Leave Types**: Personal Leave, Family Leave, and Sick Leave
- **Email Notifications**: Automated emails sent to approvers with approval links
- **Approval Tracking**: Real time tracking of who has approved/rejected
- **Status Management**: Pending, Approved, Rejected, and Partial statuses
- **Business Day Calculation**: Automatically calculates business days for leave requests

### Security
- **Input Sanitization**: All user inputs are sanitized to prevent XSS and injection attacks
- **Email Validation**: Strict email format validation for approvers
- **Date Validation**: Ensures dates are within reasonable ranges
- **Length Limits**: Enforced character limits on all text inputs

### User Experience
- **MTN Theme**: Professional black, yellow, and white color scheme (60:30:10 ratio)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real Time Updates**: Status updates reflect immediately
- **Intuitive Dashboard**: Separate views for interns and approvers
- **Progress Tracking**: Visual indicators for approval progress

### Workflow
1. Intern logs in and submits a leave request
2. Intern adds 2+ approver emails (line manager, tech lead, senior, HR)
3. Automated emails sent to all approvers with review links
4. Approvers log in and approve/reject the request
5. After 2 approvals: Confirmation email sent to intern
6. If 1 approval + 1 rejection: Partial status email sent with follow up instructions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A modern web browser

### Installation

1. **Clone or extract the project**
   ```bash
   cd intern-leave-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and configure:
   - `NEXT_PUBLIC_APP_URL`: Your application URL
   - Email service credentials (see Email Setup below)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Users

For testing, the following users are available:

**Admin/Approver:**
- Email: `admin@company.com`
- Password: `password`

**Intern 1:**
- Email: `intern@company.com`
- Password: `password`

**Intern 2:**
- Email: `intern2@company.com`
- Password: `password`

## 📧 Email Setup

### Development (Mock Emails)
By default, emails are logged to the console. Check your terminal to see email content.

### Production Email Services

#### Option 1: Resend (Recommended)
1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```
4. Update `lib/email.ts` to use Resend SDK

#### Option 2: SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Add to `.env.local`:
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   ```
4. Update `lib/email.ts` to use SendGrid SDK

#### Option 3: AWS SES
1. Set up AWS SES and verify your domain
2. Add AWS credentials to `.env.local`
3. Update `lib/email.ts` to use AWS SDK

## 🗄️ Database Setup

### Current Implementation
The app uses an in-memory mock database for demonstration. Data resets on server restart.

### Production Database Options

#### Option 1: Supabase (Recommended)
1. Create a project at [supabase.com](https://supabase.com)
2. Create tables:
   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     password_hash TEXT NOT NULL,
     role TEXT NOT NULL,
     total_leave_days INTEGER DEFAULT 20,
     used_leave_days INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Leave requests table
   CREATE TABLE leave_requests (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id),
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     leave_type TEXT NOT NULL,
     start_date DATE NOT NULL,
     end_date DATE NOT NULL,
     reason TEXT NOT NULL,
     status TEXT NOT NULL,
     days_requested INTEGER NOT NULL,
     approvers JSONB NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```
3. Update `lib/actions.ts` and `lib/auth.ts` to use Supabase client

#### Option 2: MongoDB
1. Set up MongoDB Atlas or local instance
2. Create collections for users and leave_requests
3. Install MongoDB driver: `npm install mongodb`
4. Update data access layer

## 🎨 Customization

### Theme Colors
The MTN theme uses a 60:30:10 ratio (Black:Yellow:White).

To customize, edit `app/globals.css`:
```css
--background: 0 0% 7%;        /* Black (60%) */
--primary: 45 100% 51%;       /* Yellow (30%) */
--card-foreground: 0 0% 98%;  /* White (10%) */
```

### Leave Days Configuration
Update default leave days in `lib/auth.ts`:
```typescript
totalLeaveDays: 20,  // Change this value
```

### Approval Requirements
To change the number of required approvals, update `lib/actions.ts`:
```typescript
if (approvedCount >= 2) {  // Change from 2 to your desired number
  request.status = "approved"
}
```

## 🔒 Security Best Practices

### Before Production Deployment

1. **Replace Mock Authentication**
   - Implement proper authentication (NextAuth.js, Clerk, Auth0)
   - Hash passwords with bcrypt
   - Add session management

2. **Database Security**
   - Use environment variables for credentials
   - Enable row-level security (RLS) in Supabase
   - Implement proper access controls

3. **Email Security**
   - Use verified sender domains
   - Implement rate limiting
   - Add DMARC/SPF records

4. **Application Security**
   - Enable HTTPS in production
   - Add CSRF protection
   - Implement rate limiting for API routes
   - Add logging and monitoring

5. **Environment Variables**
   - Never commit `.env.local` to git
   - Use different keys for development/production
   - Rotate secrets regularly

## 📱 Production Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Railway/Render
1. Connect your repository
2. Configure build command: `npm run build`
3. Configure start command: `npm start`
4. Add environment variables
5. Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📂 Project Structure

```
intern-leave-tracker/
├── app/                      # Next.js app directory
│   ├── admin/               # Admin dashboard
│   ├── dashboard/           # Intern dashboard
│   ├── login/               # Login page
│   ├── request/             # Leave request form
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── leave-request-form-new.tsx
│   ├── leave-request-card-new.tsx
│   ├── admin-leave-request-card-new.tsx
│   └── ...
├── lib/                     # Utilities and logic
│   ├── actions.ts           # Server actions
│   ├── auth.ts              # Authentication
│   ├── email.ts             # Email service
│   ├── sanitize.ts          # Input sanitization
│   └── types.ts             # TypeScript types
└── public/                  # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Date Handling**: date-fns
- **Icons**: Lucide React

## 🐛 Troubleshooting

### Emails not sending
- Check console for email output (development mode)
- Verify email service credentials in `.env.local`
- Check spam folder
- Ensure sender email is verified

### Approvals not working
- Verify approver is logged in with correct email
- Check that approver email matches one in the request
- Ensure request hasn't already been fully approved/rejected

### Styles not loading
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `npm install`
- Restart dev server

## 📝 Future Enhancements

- [ ] Calendar integration
- [ ] Leave balance auto-deduction
- [ ] Holiday calendar integration
- [ ] Bulk approval for managers
- [ ] Analytics dashboard
- [ ] Export to PDF/Excel
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Leave request templates
- [ ] Delegation for approvers

## 📄 License

This project is for internal MTN use.

## 🤝 Support

For issues or questions, contact your technical lead or HR department.

---

Built with ❤️ for MTN Interns

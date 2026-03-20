# Quick Setup Guide

## 5 Minute Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Login**
   - Go to http://localhost:3000
   - Use `intern@company.com` / `password` for intern view
   - Use `admin@company.com` / `password` for approver view

4. **Test the Flow**
   - As intern: Submit a leave request with 2 approver emails
   - Check console for email output
   - As admin: Approve the request
   - See the status update

## Production Deployment Checklist

### Before Going Live

- [ ] Replace mock authentication with real auth system
- [ ] Set up production database (Supabase/MongoDB)
- [ ] Configure email service (Resend/SendGrid)
- [ ] Set environment variables in hosting platform
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Set up monitoring and logging
- [ ] Test email delivery
- [ ] Test all approval workflows
- [ ] Update default user accounts
- [ ] Add password reset functionality
- [ ] Configure CORS settings
- [ ] Set up backup strategy
- [ ] Add error tracking (Sentry)
- [ ] Review security headers
- [ ] Test on multiple devices/browsers

### Environment Variables to Set

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
RESEND_API_KEY=your_api_key
# Add your database credentials
# Add your auth provider credentials
```

### Build and Deploy

```bash
npm run build
npm start
```

## Common Tasks

### Add a New User
Update `lib/auth.ts` and add to the users array (or use your database)

### Change Theme Colors
Edit `app/globals.css` CSS variables

### Modify Email Templates
Edit functions in `lib/email.ts`

### Change Approval Requirements
Update logic in `lib/actions.ts` `updateLeaveRequestStatus`

### Add New Leave Type
1. Add to `LeaveType` in `lib/types.ts`
2. Update select options in `leave-request-form-new.tsx`
3. Update color mapping in card components

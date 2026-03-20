# Vercel Deployment Checklist

Quick reference for deploying MTN Leave Tracker to Vercel.

## ✅ Pre-Deployment

- [ ] Extract `mtn-leave-tracker-enhanced.zip`
- [ ] `npm install` succeeds locally
- [ ] `npm run build` succeeds
- [ ] `npm test` passes
- [ ] Code committed to GitHub

## ✅ Vercel Setup

- [ ] Vercel account created at [vercel.com](https://vercel.com)
- [ ] GitHub connected to Vercel
- [ ] Repository imported to Vercel
- [ ] Framework auto-detected as Next.js

## ✅ Environment Variables

### Required
- [ ] `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`
- [ ] `NODE_ENV` = `production`

### Optional (Email)
- [ ] `RESEND_API_KEY` = `re_...` (if using Resend)
- [ ] `SENDGRID_API_KEY` = `SG....` (if using SendGrid)

## ✅ First Deployment

- [ ] Click "Deploy" button
- [ ] Build completes successfully
- [ ] Deployment URL copied
- [ ] `NEXT_PUBLIC_APP_URL` updated with actual URL
- [ ] Redeployed after URL update

## ✅ Post-Deployment Testing

- [ ] Site loads at deployment URL
- [ ] Login works (`intern@company.com` / `password`)
- [ ] Dashboard displays correctly
- [ ] Can submit leave request
- [ ] Can approve request (`admin@company.com` / `password`)
- [ ] No console errors
- [ ] Mobile layout works

## 🔄 Optional Enhancements

### Custom Domain
- [ ] Domain purchased
- [ ] Domain added in Vercel
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] URL updated in environment variables

### Email Service
- [ ] Resend or SendGrid account created
- [ ] API key added to Vercel
- [ ] Sender domain verified
- [ ] Test email sent successfully

## 📊 Production Ready (Future)

### Authentication
- [ ] NextAuth.js configured
- [ ] OAuth providers set up
- [ ] Mock auth replaced

### Database
- [ ] Supabase/PlanetScale configured
- [ ] Schema created
- [ ] Mock data migrated
- [ ] Backups enabled

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Sentry error tracking added
- [ ] Uptime monitoring configured

---

**Quick Deploy:** Push to GitHub → Vercel auto-deploys! 🚀

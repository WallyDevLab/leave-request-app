# Deploying MTN Leave Tracker to Vercel

Complete step-by-step guide for deploying the MTN Leave Tracker to Vercel.

## Prerequisites

✅ **GitHub Account** - To host your repository  
✅ **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)  
✅ **Code Ready** - Extract `mtn-leave-tracker-enhanced.zip`

## Quick Start (5 Minutes)

### Step 1: Push to GitHub

```bash
# Navigate to extracted folder
cd mtn-leave-tracker-enhanced

# Initialize git
git init
git add .
git commit -m "feat: initial commit - MTN Leave Tracker"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/mtn-leave-tracker.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your `mtn-leave-tracker` repository
4. Vercel auto-detects Next.js settings
5. Click **"Deploy"** (no config needed yet!)

### Step 3: Add Environment Variables

After first deployment:

1. Go to **Settings** → **Environment Variables**
2. Add this required variable:

```
Name: NEXT_PUBLIC_APP_URL
Value: https://your-project-name.vercel.app
Environment: Production, Preview, Development
```

3. Click **Save**
4. Go to **Deployments** → Redeploy latest

**Done!** Your app is live at `https://your-project-name.vercel.app` 🎉

## Default Test Accounts

After deployment, test with these accounts:

**Intern:**
- Email: `intern@company.com`
- Password: `password`

**Approver/Admin:**
- Email: `admin@company.com`
- Password: `password`

## Environment Variables (Complete List)

### Required for Basic Functionality

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL | Email links, redirects |
| `NODE_ENV` | `production` | Production mode |

### Optional (Email Functionality)

Choose ONE email provider:

**Resend (Recommended):**
```
RESEND_API_KEY = re_your_api_key_here
```

**SendGrid:**
```
SENDGRID_API_KEY = SG.your_api_key_here
```

### Future (Database & Auth)

```
DATABASE_URL = your_postgresql_connection_string
JWT_SECRET = random_secret_string_here
SESSION_SECRET = another_random_secret_here
```

## Detailed Deployment Methods

### Method A: Vercel Dashboard (Recommended)

**Advantages:** Visual interface, easy for beginners, automatic HTTPS

1. **Import Project**
   - Click "Add New Project"
   - Select your GitHub repository
   - Vercel detects Next.js automatically

2. **Configure (Optional)**
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

3. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your live URL

4. **Post-Deployment**
   - Add environment variables
   - Redeploy

### Method B: Vercel CLI

**Advantages:** Automation, CI/CD integration, scripting

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Navigate to project
cd mtn-leave-tracker-enhanced

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Set environment variables:**
```bash
vercel env add NEXT_PUBLIC_APP_URL production
# Enter your URL when prompted

vercel env add NODE_ENV production
# Enter "production" when prompted
```

### Method C: GitHub Integration (Auto-Deploy)

**Advantages:** Automatic deployments on push, preview deployments for PRs

1. **Connect GitHub**
   - Vercel auto-connects when importing from GitHub
   - Every push to `main` triggers production deployment
   - Every PR creates a preview deployment

2. **Configure Branch Settings**
   - Settings → Git
   - Production Branch: `main`
   - Enable Preview Deployments: ON

3. **Workflow**
   ```bash
   # Make changes
   git add .
   git commit -m "feat: add new feature"
   git push
   
   # Vercel automatically deploys!
   ```

## Setting Up Email Service

### Option 1: Resend (Easiest)

1. **Sign up** at [resend.com](https://resend.com)
2. **Get API key** from dashboard
3. **Add to Vercel:**
   ```
   RESEND_API_KEY = re_...
   ```
4. **Install package:**
   ```bash
   npm install resend
   ```
5. **Update** `lib/email.ts`:
   ```typescript
   import { Resend } from 'resend'
   import { config } from './config'
   
   const resend = new Resend(config.resendApiKey)
   
   // In sendEmail function:
   await resend.emails.send({
     from: 'MTN Leave Tracker <noreply@yourdomain.com>',
     to: to,
     subject: subject,
     html: html
   })
   ```

### Option 2: SendGrid

1. **Sign up** at [sendgrid.com](https://sendgrid.com)
2. **Create API key**
3. **Add to Vercel:**
   ```
   SENDGRID_API_KEY = SG.your_key
   ```
4. **Install:**
   ```bash
   npm install @sendgrid/mail
   ```

## Custom Domain Setup

### Add Your Domain

1. Go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `leave.mtn.com`)
4. Follow DNS configuration instructions

### DNS Configuration

Add these records to your DNS provider:

**A Record:**
```
Type: A
Name: @ (or leave)
Value: 76.76.21.21
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL Certificate

- Vercel automatically provisions SSL certificates
- HTTPS enabled immediately after DNS propagation
- Certificates auto-renew

## Production Readiness Checklist

Before launching to real users:

### Essential

- [ ] Set `NEXT_PUBLIC_APP_URL` to actual deployment URL
- [ ] Configure email service (Resend or SendGrid)
- [ ] Test all functionality on live site
- [ ] Replace mock authentication
- [ ] Set up production database

### Security

- [ ] Review all environment variables
- [ ] Enable authentication (NextAuth.js recommended)
- [ ] Add rate limiting
- [ ] Configure CORS if needed
- [ ] Rotate default passwords

### Monitoring

- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation

### Performance

- [ ] Test page load times
- [ ] Enable image optimization
- [ ] Configure caching headers
- [ ] Monitor function execution times

## Monitoring & Debugging

### View Deployment Logs

1. Go to **Deployments** tab
2. Click on a deployment
3. View:
   - **Build Logs** - Build process output
   - **Function Logs** - Runtime logs from your API routes

### Real-Time Analytics

1. Go to **Analytics** tab
2. Monitor:
   - Page views
   - Web Vitals
   - Visitor data

### Function Logs

```bash
# View real-time logs
vercel logs

# View logs for specific deployment
vercel logs [deployment-url]
```

## Common Issues & Solutions

### Build Fails

**Error:** `Module not found: Can't resolve...`

**Solution:**
```bash
# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Commit the new package-lock.json
git add package-lock.json
git commit -m "fix: update dependencies"
git push
```

### Environment Variables Not Working

**Issue:** Variables don't appear in app

**Solutions:**
1. Verify variables are set for correct environment (Production/Preview/Development)
2. Click "Redeploy" after adding variables
3. Check variable names match exactly (case-sensitive)

### Email Links Wrong URL

**Issue:** Emails contain localhost or wrong URL

**Solution:**
```bash
# Update environment variable
NEXT_PUBLIC_APP_URL = https://your-actual-domain.vercel.app

# Redeploy
```

### App Shows Build Error

**Issue:** "This Serverless Function has crashed"

**Solution:**
1. Check Function Logs in Vercel dashboard
2. Look for runtime errors
3. Test locally with `npm run build && npm start`
4. Fix errors and redeploy

## Vercel CLI Commands

```bash
# Deploy to preview
vercel

# Deploy to production  
vercel --prod

# List deployments
vercel ls

# View logs
vercel logs

# Inspect deployment
vercel inspect [deployment-url]

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Add environment variable
vercel env add [name]

# Remove environment variable
vercel env rm [name]

# Open project in browser
vercel open
```

## Cost & Limits

### Vercel Free Tier

✅ **Included:**
- Unlimited deployments
- 100GB bandwidth/month
- 100GB-hours serverless execution/month
- Automatic HTTPS
- Preview deployments
- Analytics (basic)

⚠️ **Limits:**
- 6,000 build minutes/month
- 100 domains
- 12 serverless functions max size (4.5MB)

### When to Upgrade

Upgrade to Pro ($20/month) when you need:
- More bandwidth (1TB/month)
- Password protection
- Team collaboration
- Advanced analytics
- Priority support

## Next Steps After Deployment

1. **Test Everything**
   - Login as intern and admin
   - Submit leave request
   - Approve requests
   - Check email notifications (if configured)

2. **Configure Production Services**
   - Set up Resend or SendGrid for emails
   - Configure production database
   - Add real authentication

3. **Share Your App**
   - Give URL to team members
   - Share default login credentials
   - Collect feedback

4. **Monitor Performance**
   - Check Vercel Analytics
   - Review function logs
   - Monitor error rates

## Getting Help

**Vercel Documentation:**
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/projects/domains)

**Community Support:**
- [Vercel Discord](https://vercel.com/discord)
- [GitHub Discussions](https://github.com/vercel/vercel/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/vercel)

## Deploy Button

Add one-click deploy to your README:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/mtn-leave-tracker&env=NEXT_PUBLIC_APP_URL&envDescription=Required%20environment%20variables&envLink=https://github.com/YOUR_USERNAME/mtn-leave-tracker%23environment-variables)
```

---

**🎉 Congratulations! Your MTN Leave Tracker is now live on Vercel!**

Visit: `https://your-project-name.vercel.app`

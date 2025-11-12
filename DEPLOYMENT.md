# Semly Admin - Deployment Guide

## 🚀 Quick Deployment to Vercel

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd /Users/anilvarma/semly-admin
   vercel
   ```
   
4. **Configure Environment Variables:**
   When prompted, add your environment variables or add them later in the Vercel dashboard.

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Method 2: GitHub Integration

1. **Create GitHub Repository:**
   ```bash
   # Create a new repository on GitHub (e.g., semly-admin)
   # Then push your code:
   
   cd /Users/anilvarma/semly-admin
   git remote add origin https://github.com/YOUR_USERNAME/semly-admin.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your `semly-admin` repository
   - Configure project settings
   - Add environment variables (see below)
   - Click "Deploy"

---

## 🔐 Required Environment Variables

Add these in Vercel project settings (Settings → Environment Variables):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin Users (CRITICAL - comma-separated Clerk user IDs)
ADMIN_USER_IDS=user_2abc123xyz,user_2def456uvw

# Node Environment
NODE_ENV=production
```

**Important:** Make sure to use the **same** Clerk and Supabase credentials as your main Semly Pro app, as they share the same database.

---

## 📋 Pre-Deployment Checklist

- [ ] Created GitHub repository
- [ ] Pushed code to GitHub  
- [ ] Created Vercel account
- [ ] Connected GitHub to Vercel
- [ ] Copied all environment variables from main app
- [ ] Added ADMIN_USER_IDS with your Clerk user ID
- [ ] Verified Supabase connection works
- [ ] Verified Clerk authentication works
- [ ] Tested admin access locally

---

## 🎯 Post-Deployment Steps

### 1. Get Your Clerk User ID

**Option A: From Clerk Dashboard**
1. Go to https://dashboard.clerk.com
2. Navigate to Users
3. Find your account
4. Copy the User ID (starts with `user_`)

**Option B: From Your App**
1. Sign in to main Semly Pro app
2. Open browser console
3. Run: `window.Clerk?.user?.id`
4. Copy the ID

### 2. Add Yourself as Admin

1. Go to Vercel project settings
2. Navigate to Environment Variables
3. Add/update `ADMIN_USER_IDS` with your user ID
4. Redeploy the application

### 3. Test Admin Access

1. Visit your deployed admin URL (e.g., `https://semly-admin.vercel.app`)
2. Sign in with your Clerk account
3. You should see the admin dashboard

If you get redirected to `/dashboard` instead:
- Your user ID is not in `ADMIN_USER_IDS`
- Double-check the environment variable in Vercel
- Redeploy after updating

---

## 🔧 Troubleshooting

### Issue: "Unauthorized" or Redirected to Dashboard

**Solution:** 
1. Verify your Clerk user ID is correct
2. Check `ADMIN_USER_IDS` environment variable in Vercel
3. Ensure there are no spaces in the comma-separated list
4. Redeploy after making changes

### Issue: Database Connection Errors

**Solution:**
1. Verify Supabase environment variables are correct
2. Check Supabase project is accessible
3. Ensure RLS policies allow admin access
4. Test connection locally first

### Issue: Clerk Authentication Not Working

**Solution:**
1. Verify Clerk keys match your main app
2. Check Clerk dashboard for API errors
3. Ensure Clerk URLs are set correctly
4. Test locally with same env vars

---

## 📊 Monitoring & Maintenance

### Check Deployment Status

```bash
vercel ls
```

### View Logs

```bash
vercel logs [deployment-url]
```

### Redeploy

```bash
cd /Users/anilvarma/semly-admin
vercel --prod
```

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Clerk Dashboard:** https://dashboard.clerk.com
- **Supabase Dashboard:** https://app.supabase.com
- **GitHub Repo:** (add your repo URL here)

---

## 🎉 Success Checklist

- [ ] Admin panel is deployed and accessible
- [ ] You can sign in with Clerk
- [ ] Admin dashboard loads correctly
- [ ] Users page shows data from Supabase
- [ ] Projects page shows data
- [ ] Subscriptions page shows data
- [ ] Prompts page shows data
- [ ] All API routes work
- [ ] No console errors

---

## 📝 Notes

- The admin panel shares the same database as the main Semly Pro app
- Changes to users/projects/subscriptions affect both apps
- Keep environment variables in sync between both deployments
- Only users in `ADMIN_USER_IDS` can access the admin panel

---

**Need help?** Check the README.md or contact the development team.

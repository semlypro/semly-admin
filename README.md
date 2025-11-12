# Semly Admin Panel

Standalone admin panel for Semly Pro, extracted from the main application.

## Features

- User Management
- Project Oversight  
- Subscription Tracking
- Prompt Monitoring

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key
- `CLERK_SECRET_KEY` - Your Clerk secret key
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `ADMIN_USER_IDS` - Comma-separated list of Clerk user IDs who can access admin

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Deployment on Vercel

### Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Via GitHub Integration

1. Push this repository to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables in Vercel project settings
6. Deploy!

## Environment Variables for Vercel

Add these in your Vercel project settings:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_USER_IDS=...
```

## Admin Access

To give someone admin access:
1. Get their Clerk user ID (starts with `user_`)
2. Add it to the `ADMIN_USER_IDS` environment variable (comma-separated)
3. Redeploy the application

## Tech Stack

- **Framework:** Next.js 16
- **Authentication:** Clerk
- **Database:** Supabase (PostgreSQL)
- **UI:** Radix UI + Tailwind CSS
- **Language:** TypeScript

## Project Structure

```
semly-admin/
├── app/                    # Next.js app router
│   ├── page.tsx           # Admin dashboard (root)
│   ├── users/             # User management
│   ├── projects/          # Project oversight
│   ├── subscriptions/     # Subscription tracking
│   ├── prompts/           # Prompt monitoring
│   └── api/admin/         # Admin API routes
├── components/
│   ├── AdminGuard.tsx     # Auth protection
│   ├── ui/                # Reusable UI components
│   └── semly-logo.tsx     # Logo component
└── lib/
    ├── admin-utils.ts     # Admin utilities
    ├── supabase-server.ts # Supabase client
    └── utils.ts           # General utilities
```

## Security

- All routes are protected by `AdminGuard` component
- Only users listed in `ADMIN_USER_IDS` can access the admin panel
- Database access uses Supabase RLS policies
- Authentication handled by Clerk

## License

Private - Semly Pro

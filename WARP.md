# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

---

## Project Overview

**Looplly.me** is a modern web application built with React, TypeScript, Vite, and Supabase. It features:
- Dual authentication systems (Custom JWT for users, Supabase Auth for admins)
- Complex user profiling with dynamic question system
- Badge and rewards system with reputation tracking
- Admin portal for platform management
- Testing simulator for isolated feature testing
- Integration with external APIs (Google Places, AI providers)

**Tech Stack:**
- Frontend: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- Backend: Supabase (PostgreSQL, Edge Functions, Storage)
- Testing: Jest, React Testing Library
- Deployment: Netlify

---

## Essential Commands

### Development
```bash
# Start development server (port 8080)
npm run dev

# Build for production
npm run build

# Build for development (includes source maps)
npm run build:dev

# Preview production build
npm run preview
```

### Environment Setup
```bash
# Create .env from template
npm run env:setup

# Validate environment variables
npm run env:validate

# Initialize Supabase config system
npm run config:init

# View configuration documentation
npm run config:docs
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Run tests (Jest)
npm test
```

### Supabase Operations
```bash
# Link to Supabase project
supabase link --project-ref chlqpvzreztzxmjjdjpk

# Pull database types
supabase gen types typescript --linked > src/integrations/supabase/types.ts

# Run migrations locally
supabase db push

# Deploy edge function
supabase functions deploy <function-name>

# List edge functions
supabase functions list

# View function logs
supabase functions logs <function-name>
```

---

## Architecture & Key Patterns

### Dual Authentication System

This project uses **TWO separate authentication systems**:

1. **User Portal (Custom JWT)**
   - Storage key: `'auth'` (localStorage)
   - Managed by: `src/components/auth/AuthProvider.tsx`
   - Edge Functions: `mock-looplly-login`, `mock-looplly-register`, `mock-looplly-verify-otp`
   - JWT Secret: `LOOPLLY_JWT_SECRET` environment variable
   - Token stored in: `localStorage.getItem('looplly_auth_token')`

2. **Admin Portal (Supabase Auth)**
   - Storage key: `'admin_auth'` (localStorage)
   - Managed by: `src/integrations/supabase/adminClient.ts`
   - Uses standard Supabase auth methods
   - Separate session isolation prevents cross-contamination

**CRITICAL:** When working with authentication:
- Always use the correct client (`supabase` for users, `adminClient` for admins)
- Never mix JWT tokens between systems
- Admin routes are prefixed with `/admin/`
- User routes use root paths (`/earn`, `/wallet`, `/profile`, etc.)

### Dual-Table Role Management

The platform uses a **dual-table role system** for separation of concerns:

1. **Staff Roles** (`user_roles` table)
   - Values: `super_admin`, `admin`, `user`
   - Controls admin portal access
   - Managed via `useRole()` hook

2. **User Types** (`user_types` table)
   - Values: `office_user`, `looplly_user`
   - Distinguishes B2B office users from platform users
   - Managed via `useUserType()` hook

**When implementing features:**
- Check staff roles for admin permissions
- Check user types for feature access (office vs looplly users)
- RLS policies enforce both role and type restrictions

### Hybrid Environment Configuration

Configuration is managed through `src/config/hybridEnv.ts`:
- **Public config**: Netlify environment variables (VITE_* prefix)
- **Private secrets**: Supabase Vault (accessed server-side only)
- **Core bootstrap**: Synchronous initialization for Supabase client
- **Extended config**: Async initialization with feature flags

**Required environment variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

**Optional environment variables:**
- `VITE_GOOGLE_PLACES_API_KEY` (can use mock mode)
- `VITE_AI_PROVIDER_API_KEY` (can use mock mode)
- `VITE_ENABLE_ANALYTICS` (default: false)
- `VITE_ENABLE_DEBUG` (default: false)

### Component Organization

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (67 files)
│   ├── auth/            # Authentication components (both portals)
│   ├── admin/           # Admin portal components
│   ├── dashboard/       # User dashboard components
│   ├── layout/          # Shared layout components
│   └── legal/           # Cookie consent, privacy policy
├── pages/               # Route-level components
│   ├── Admin*.tsx       # Admin portal pages (lazy loaded)
│   ├── Simulator*.tsx   # Testing simulator pages
│   └── User pages       # Earn, Wallet, Profile, etc.
├── hooks/               # Custom React hooks (53 files)
├── services/            # API service layers
├── integrations/
│   └── supabase/        # Supabase client, types, queries
├── config/              # Environment and session configuration
└── utils/               # Utility functions
```

### Lazy Loading Strategy

All admin pages and secondary user pages use React lazy loading:
```typescript
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
```

**Rationale:** 
- Reduces initial bundle size
- Admin features don't impact user-facing performance
- Suspense boundaries provide consistent loading states

### Supabase Edge Functions

Located in `supabase/functions/`, organized by purpose:

**Authentication:**
- `mock-looplly-login` - User authentication with Custom JWT
- `mock-looplly-register` - User registration
- `mock-looplly-verify-otp` - Mobile verification
- `reset-team-member-password` - Admin password resets

**AI-Powered:**
- `generate-question-text` - AI question generation
- `generate-question-options` - AI option generation
- `generate-badge-image` - Badge image creation
- `test-ai-provider` - AI provider testing

**External APIs:**
- `google-places` - Google Places API integration
- `knowledge-chat` - Knowledge base chat

**Testing:**
- `simulator-get-profile` - Simulator profile fetching
- `create-simulator-session` - Session creation
- `seed-test-users` - Test data generation

**Data Management:**
- `seed-badges` - Badge initialization
- `seed-documentation` - Docs initialization
- `delete-user` / `delete-account` - User deletion
- `undo-team-dual-accounts` - B2B cleanup

**JWT Configuration** (in `supabase/config.toml`):
- Public functions: `verify_jwt = false`
- Protected functions: `verify_jwt = true`

---

## Development Workflows

### Adding a New Admin Page

1. Create page component in `src/pages/Admin*.tsx`
2. Add lazy import in `src/App.tsx`:
   ```typescript
   const AdminNewPage = lazy(() => import("./pages/AdminNewPage"));
   ```
3. Add route in admin section:
   ```typescript
   <Route path="/admin/new-page" element={<AdminNewPage />} />
   ```
4. Update admin navigation in `src/components/admin/AdminNav.tsx`
5. Ensure admin auth is checked (uses `adminClient`)

### Adding a New Edge Function

1. Create function directory: `supabase/functions/<function-name>/`
2. Create `index.ts` with Deno/TypeScript code
3. Add configuration to `supabase/config.toml`:
   ```toml
   [functions.<function-name>]
   verify_jwt = true  # or false for public endpoints
   ```
4. Deploy: `supabase functions deploy <function-name>`
5. Test with function logs: `supabase functions logs <function-name>`

### Working with Custom Hooks

Common patterns in hooks:
- **`useAuth()`** - User authentication state (Custom JWT)
- **`useRole()`** - Staff role checking (admin portal)
- **`useUserType()`** - User type checking (office vs looplly)
- **`useProfile()`** - User profile data
- **`useProfileQuestions()`** - Dynamic question system
- **`useUserStreaks()`** - Streak tracking
- **`useUserReputation()`** - Reputation calculation
- **`useTransactions()`** - Points/rewards transactions

All hooks use `@tanstack/react-query` for caching and state management.

### Testing Simulator Usage

The simulator allows isolated testing without affecting production data:

1. Access via `/admin/simulator` or `/simulator/session`
2. Select test stage (e.g., `stage_2_registered`, `stage_3_verified`)
3. Simulator creates temporary sessions with mock data
4. Test features in isolation (profile questions, badges, etc.)
5. Sessions auto-expire; no production impact

**Key simulator components:**
- `SimulatorApp.tsx` - Main simulator interface
- `SimulatorSession.tsx` - Session management
- `SimulatorContext.tsx` - Shared simulator state

### Working with Profile Questions

Dynamic profiling system with categories and questions:

**Tables:**
- `profile_categories` - Question categories (order, display name)
- `profile_questions` - Questions (type, category, validation)
- `profile_answers` - User responses
- `profile_question_options` - Multiple choice options

**Admin Interface:**
- View: `/admin/profile-questions`
- Build: `/admin/question-builder`
- Manage: Uses SurveyJS library for question creation

**Key hooks:**
- `useProfileQuestions()` - Fetch questions with pagination
- `useProfileAnswers()` - User responses with caching
- `useStaleProfileCheck()` - Detect outdated profiles

### Badge System Architecture

**Tables:**
- `badges` - Badge definitions
- `user_badges` - User badge awards
- `badge_redemptions` - Redemption tracking

**Edge Functions:**
- `badge-service-api` - Badge award logic
- `generate-badge-image` - AI-powered image generation
- `seed-badges` - Initialize badge library

**Admin Pages:**
- `/admin/badges` - Manage badges
- `/admin/redemptions` - Track redemptions

---

## Critical Rules & Constraints

### Authentication Session Isolation

**NEVER mix authentication contexts:**
```typescript
// ✅ CORRECT - User portal
import { supabase } from "@/integrations/supabase/client";
const { data } = await supabase.from('profiles').select('*');

// ✅ CORRECT - Admin portal
import { adminClient } from "@/integrations/supabase/adminClient";
const { data } = await adminClient.from('profiles').select('*');

// ❌ WRONG - Mixing clients
import { supabase } from "@/integrations/supabase/client";
const { data: adminData } = await supabase.from('user_roles').select('*');
```

### Environment Variable Prefixing

**Frontend-accessible variables MUST use `VITE_` prefix:**
```bash
# ✅ CORRECT - Exposed to frontend
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# ❌ WRONG - Not accessible in frontend
SUPABASE_URL=https://project.supabase.co

# ✅ CORRECT - Server-side only (Edge Functions)
LOOPLLY_JWT_SECRET=secret-key-here
SUPABASE_SERVICE_ROLE_KEY=service-role-key
```

### Database Migration Safety

**Always check RLS policies when modifying tables:**
1. Create migration: Add to `supabase/migrations/`
2. Test locally: `supabase db push`
3. Verify RLS: Check security advisories with `get_advisors` MCP tool
4. Document changes: Update relevant docs
5. Deploy cautiously: Test on preview branch first

**Key RLS patterns:**
- User data: Filter by `auth.uid()` or `get_jwt_claim('userId')`
- Admin data: Check `user_roles.role = 'admin'`
- Public data: `true` for SELECT policies

### Performance Optimization

**Bundle splitting strategy (vite.config.ts):**
- Vendor chunk: React, React DOM
- UI chunk: Radix UI components
- Router chunk: React Router
- Query chunk: TanStack Query
- Utils chunk: clsx, tailwind-merge
- SurveyJS chunk: Survey libraries (large dependency)

**Optimization checklist:**
- Use lazy loading for non-critical routes
- Implement proper Suspense boundaries
- Leverage React Query caching
- Minimize re-renders with memo/useMemo
- Code-split large dependencies

### TypeScript Configuration

**Relaxed strictness for rapid development:**
- `noImplicitAny: false` - Allows implicit any
- `strictNullChecks: false` - Null safety disabled
- `skipLibCheck: true` - Skip lib type checking

**Path alias:** Use `@/` for `src/` imports
```typescript
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
```

### Supabase Type Generation

**Always regenerate types after schema changes:**
```bash
supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

**Type location:** `src/integrations/supabase/types.ts`

**Usage:**
```typescript
import type { Database } from '@/integrations/supabase/types';
type Profile = Database['public']['Tables']['profiles']['Row'];
```

---

## Deployment Notes

### Netlify Configuration

**Build command:** `npm ci --include=dev && npm run build`
**Publish directory:** `dist`
**Node version:** 22

**Environment variables required:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `NODE_ENV=production`

**Security headers configured:**
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Cache-Control: Varies by file type

**SPA routing:** All routes redirect to `/index.html` (status 200, force=false)

### Edge Function Deployment

**Per-function deployment:**
```bash
supabase functions deploy <function-name>
```

**Deploy all functions:**
```bash
for func in supabase/functions/*/; do
  supabase functions deploy $(basename $func)
done
```

**Secrets management:**
Set secrets via Supabase dashboard or CLI:
```bash
supabase secrets set LOOPLLY_JWT_SECRET="your-secret"
```

---

## Documentation References

**Project Documentation:**
- `README.md` - Quick start guide
- `docs/EDGE_FUNCTIONS_GUIDE.md` - Edge function documentation
- `docs/admin/` - Admin portal guides
- `docs/DOCUMENTATION_INDEX.md` - Full doc catalog

**External Documentation:**
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev/)
- [React Router v6](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)

---

## Troubleshooting Common Issues

### "Missing Supabase environment variables"
- Run `npm run env:setup` to create `.env` from template
- Verify `.env` contains all required `VITE_SUPABASE_*` variables
- Check environment is loaded: `console.log(import.meta.env)`

### "Authentication errors" / "Session expired"
- Check which auth system is active (JWT vs Supabase Auth)
- Verify correct client is being used (`supabase` vs `adminClient`)
- Clear localStorage: `localStorage.clear()` and re-login
- Check JWT secret matches between frontend and edge functions

### "Type errors" after database changes
- Regenerate types: `supabase gen types typescript --linked > src/integrations/supabase/types.ts`
- Restart TypeScript server in editor
- Check for schema conflicts in migrations

### "Edge function fails to deploy"
- Verify function syntax: Deno requires TypeScript/ES modules
- Check `config.toml` for function configuration
- Ensure secrets are set: `supabase secrets list`
- View logs: `supabase functions logs <function-name>`

### "Build fails on Netlify"
- Check Node version (must be 22)
- Verify environment variables are set in Netlify dashboard
- Test build locally: `npm run build`
- Review build logs for specific errors

---

## Project-Specific Gotchas

1. **Two separate auth systems** - Never assume one auth mechanism; always check portal context
2. **Lazy loading everywhere** - Admin pages load on-demand; ensure proper Suspense boundaries
3. **Simulator isolation** - Test data doesn't pollute production; use simulator for safe testing
4. **RLS complexity** - Dual-table role system requires careful policy design
5. **Environment validation** - `validate-env.js` script enforces security best practices
6. **JWT secret management** - Custom JWT requires `LOOPLLY_JWT_SECRET` in both frontend and edge functions
7. **Profile question system** - Dynamic, category-based with SurveyJS integration; complex to modify
8. **Badge generation** - Uses AI edge functions; requires API keys for production
9. **Mobile verification** - Uses OTP system via edge functions, not Supabase Auth
10. **Netlify deployment** - Uses hybrid env system; some vars in Netlify, secrets in Supabase Vault

---

## Code Style & Conventions

### Component Patterns
- Use functional components with hooks
- Lazy load non-critical components
- Implement proper error boundaries
- Use Suspense for async operations

### State Management
- TanStack Query for server state
- React Context for auth state
- Local state with useState/useReducer
- Avoid prop drilling with context

### File Naming
- Components: PascalCase (e.g., `AdminDashboard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`)
- Utils: camelCase (e.g., `emailValidation.ts`)
- Types: camelCase (e.g., `auth.ts`)

### Import Order
1. External dependencies (React, libraries)
2. Internal dependencies (components, hooks)
3. Types/interfaces
4. Styles/assets

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-16  
**Maintained by:** Looplly Development Team

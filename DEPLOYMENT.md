# Deployment Guide - Amateur Cycling Stats

This guide covers the automated deployment setup for the Amateur Cycling Stats application using Coolify with integrated database migrations.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Deployment Workflow](#deployment-workflow)
- [Manual Operations](#manual-operations)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Deployment Flow

```
Git Push (develop branch)
    ↓
Coolify Detects Change
    ↓
Nixpacks Build
    ├─ Install Node.js 22
    ├─ Install Supabase CLI
    └─ Build SvelteKit App
    ↓
Deploy Container (Rolling Update)
    ↓
Post-Deployment Hook
    ├─ Run Database Migrations
    └─ Seed Test Data
    ↓
Application Running ✓
```

### Key Features

- ✅ **Fully Automated** - Migrations run automatically on deployment
- ✅ **Zero Downtime** - Rolling updates with health checks
- ✅ **Internal Network** - Database never exposed to internet
- ✅ **Atomic Operations** - Migrations succeed or deployment fails
- ✅ **Manual Control** - Trigger deployments/migrations via Coolify UI

### Infrastructure

| Service                 | URL                                   | Managed By |
| ----------------------- | ------------------------------------- | ---------- |
| **Dev Application**     | https://dev.amateurcyclingstats.com   | Coolify    |
| **Coolify Admin**       | https://admin.amateurcyclingstats.com | Coolify    |
| **Supabase Instance**   | Self-hosted via Coolify               | Coolify    |
| **PostgreSQL Database** | Internal Docker network (supabase-db) | Coolify    |

---

## Quick Start

### For First-Time Setup

**See detailed guide:** [COOLIFY.md](./COOLIFY.md)

**Quick checklist:**

1. ✅ Configure environment variables in Coolify
2. ✅ Set DATABASE_URL with internal hostname (`supabase-db`)
3. ✅ Configure post-deployment command
4. ✅ Push to `develop` branch
5. ✅ Monitor deployment in Coolify

### Essential Environment Variables

**Required in Coolify:**

```bash
# Database & Supabase API
DATABASE_URL=postgresql://postgres:PASSWORD@supabase-db:5432/postgres
SUPABASE_URL=https://your-instance.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Application
SITE_URL=https://dev.amateurcyclingstats.com/

# Email
MAILERSEND_API_KEY=mlsn.your-key
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=Amateur Cycling Stats

# Supabase CLI Port Configuration (REQUIRED)
SUPABASE_ID_PROJECT=coolify-dev
SUPABASE_API_PORT=54321
SUPABASE_DB_PORT=54322
SUPABASE_DB_SHADOW_PORT=54320
SUPABASE_STUDIO_PORT=54323
SUPABASE_INBUCKET_PORT=54324
SUPABASE_POOLER_PORT=54329
SUPABASE_ANALYTICS_PORT=54327
```

**See full configuration:** [COOLIFY.md - Environment Variables](./COOLIFY.md#environment-variables-configuration)

---

## Deployment Workflow

### Automatic Deployment

**Trigger:** Push to `develop` branch

```bash
git add .
git commit -m "feat: add new feature"
git push origin develop
```

**What happens:**

1. Coolify detects push
2. Clones repository
3. Nixpacks builds app with Supabase CLI
4. Deploys new container (zero downtime)
5. Runs post-deployment: `npx supabase db reset --yes && npm run seed:users`
6. Application live with updated database

**Duration:** ~3-5 minutes

### Manual Deployment

**Coolify → Application → General → Deploy**

Click "Deploy" to trigger deployment without pushing code.

**Use cases:**

- Redeploy after environment variable changes
- Retry failed deployment
- Force rebuild

---

## Manual Operations

### Run Migrations Only

**Coolify → Application → Execute Command**

```bash
npx supabase db push
```

### Reset Database

**⚠️ WARNING: Destructive - deletes all data**

```bash
npx supabase db reset --yes
```

### Seed Test Data

```bash
npm run seed:users
```

### View Database Schema

```bash
npx supabase db dump --schema public
```

### Check Migration Status

```bash
npx supabase migration list
```

---

## Troubleshooting

### Common Issues

#### Deployment Failed

**Check:**

1. Coolify deployment logs for errors
2. Build succeeded but post-deployment failed?
3. Environment variables correct?

**Solution:**

```bash
# In Coolify Execute Command
echo $DATABASE_URL  # Verify it shows internal hostname
```

#### Database Connection Failed

**Symptoms:**

```
Error: failed to connect to postgres
```

**Solution:**

1. Verify DATABASE_URL uses `supabase-db` (internal hostname)
2. Check Supabase service is running
3. Verify password is correct

**See:** [COOLIFY.md - Troubleshooting](./COOLIFY.md#troubleshooting)

#### Migration Syntax Error

**Symptoms:**

```
Error: migration xyz.sql failed at line 42
```

**Solution:**

1. Test migration locally: `supabase db reset`
2. Fix syntax error in `supabase/migrations/xyz.sql`
3. Redeploy

#### Seeding Failed

**Symptoms:**

```
Error: User already exists
```

**Solution:**

- Run fresh reset: `npx supabase db reset --yes`
- Or update seed script to handle existing data

---

## Development Workflow

### Local Development

**Start local Supabase:**

```bash
npm run supabase:start  # Starts local Supabase
npm run dev             # Starts SvelteKit dev server
# OR combined:
npm run dev:full
```

**Access points:**

- App: http://localhost:5175 (worktree-two)
- Supabase Studio: http://localhost:56323

### Testing Migrations Locally

**Before deploying:**

```bash
# Edit migration file
vim supabase/migrations/20250115000001_core_foundation.sql

# Test locally
npm run supabase:reset

# Verify it works
npm run seed:users

# Regenerate types
npm run supabase:types

# Commit and push
git add .
git commit -m "chore: update migration"
git push origin develop
```

### Creating New Migrations

**During active development (recommended):**

```bash
# Edit existing migration file directly
vim supabase/migrations/20250115000001_core_foundation.sql

# Reset to apply changes
npm run supabase:reset
```

**When ready for production:**

```bash
# Create new migration
npx supabase migration new add_feature_x

# Edit the generated file
vim supabase/migrations/20250115XXXXXX_add_feature_x.sql

# Test locally
npm run supabase:reset

# Deploy
git push origin develop
```

---

## Environment Management

### Development Environment

**Post-Deployment Command:**

```bash
npx supabase db reset --yes && npm run seed:users
```

- Full database reset on every deploy
- Auto-seed test data
- Fast iteration

### Staging/Production (Future)

**Post-Deployment Command:**

```bash
npx supabase db push
```

- Incremental migrations only
- No auto-seeding
- Preserve existing data
- Manual data migration as needed

---

## Best Practices

### 1. Always Test Locally First

```bash
npm run supabase:reset  # Test migration
npm run seed:users      # Test seeding
npm run dev             # Test app
```

### 2. Use Descriptive Commit Messages

```bash
git commit -m "feat: add user profile page"
git commit -m "fix: resolve authentication redirect loop"
git commit -m "chore: update database schema for organizations"
```

### 3. Monitor Deployments

- Watch Coolify deployment logs
- Check post-deployment command output
- Verify application is accessible
- Test key functionality after deployment

### 4. Keep Migrations Reversible

- Add new columns as nullable first
- Provide default values for existing rows
- Test rollback scenarios
- Avoid destructive changes in production

### 5. Backup Before Major Changes

```bash
# In Coolify Execute Command
npx supabase db dump > backup-$(date +%Y%m%d).sql
```

---

## Migration to Production

When ready for production deployment:

1. **Create production environment in Coolify**
2. **Set environment variables** with production values
3. **Update post-deployment command:**
   ```bash
   npx supabase db push  # Incremental only
   ```
4. **Set up database backups**
5. **Configure deployment protection:**
   - Manual approval required
   - Health checks enabled
   - Rollback plan documented

---

## Additional Resources

- **Detailed Coolify Guide:** [COOLIFY.md](./COOLIFY.md)
- **Project Setup:** [README.md](./README.md)
- **Development Guide:** [CLAUDE.md](./CLAUDE.md)
- **Coolify Documentation:** https://coolify.io/docs
- **Supabase CLI:** https://supabase.com/docs/guides/cli
- **Nixpacks:** https://nixpacks.com/docs

---

## Changelog

| Date       | Change                                                  | Author      |
| ---------- | ------------------------------------------------------- | ----------- |
| 2025-01-19 | Migrated from GitHub Actions to Coolify post-deployment | Claude Code |
| 2025-01-19 | Initial CI/CD setup for dev environment                 | Claude Code |

---

**Questions or Issues?**

1. Check [COOLIFY.md](./COOLIFY.md) for detailed troubleshooting
2. Review Coolify deployment logs
3. Test migrations locally first
4. Create an issue in the GitHub repository

**Happy Deploying! 🚀**

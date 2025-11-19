# Deployment Guide - Amateur Cycling Stats

This guide covers the automated deployment and database migration setup for the Amateur Cycling Stats application.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [CI/CD Pipeline](#cicd-pipeline)
- [Initial Setup](#initial-setup)
- [Deployment Workflow](#deployment-workflow)
- [Manual Operations](#manual-operations)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The project uses a **two-stage deployment** approach:

1. **Stage 1: Database Migration & Seeding** (GitHub Actions)
   - Runs automatically on push to `develop` branch
   - Applies database migrations
   - Seeds data to Supabase dev instance
   - Triggers: `https://db-dev.amateurcyclingstats.com`

2. **Stage 2: Application Deployment** (Coolify)
   - Coolify detects push to `develop` branch
   - Builds and deploys SvelteKit application
   - Deploys to: `https://dev.amateurcyclingstats.com`

### Infrastructure

| Service | URL | Managed By |
|---------|-----|------------|
| **Dev Application** | https://dev.amateurcyclingstats.com | Coolify |
| **Admin Board** | https://admin.amateurcyclingstats.com | Coolify |
| **Dev Database (Supabase)** | https://db-dev.amateurcyclingstats.com | Supabase Cloud |

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Automatic Dev Deployment (`.github/workflows/deploy-dev.yml`)

**Triggers:**
- Push to `develop` branch
- Manual trigger via GitHub UI (Actions tab)

**What it does:**
1. Installs Node.js and dependencies
2. Installs Supabase CLI
3. Links to Supabase dev project
4. Runs `supabase db reset --linked` (migrations + seed.sql)
5. Runs `npm run seed:users` (user-dependent data)
6. Coolify automatically deploys the app after workflow completes

**Duration:** ~2-3 minutes

#### 2. Manual Migration (`.github/workflows/manual-migration.yml`)

**Triggers:**
- Manual trigger only (Actions tab)

**Options:**
- **Reset Database**: Full reset with migrations and seed.sql (destructive)
- **Include Seeding**: Whether to run user-dependent seeding

**Use cases:**
- Run migrations without deploying code
- Refresh seed data without code changes
- Quick database reset during development

---

## Initial Setup

### Prerequisites

1. ✅ GitHub repository access
2. ✅ Supabase project created (dev environment)
3. ✅ Coolify configured and listening to repository
4. ✅ MailerSend account with verified sender

### Step 1: Configure GitHub Secrets

Navigate to your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

Add the following secrets:

#### `SUPABASE_ACCESS_TOKEN`
- **What**: Your personal Supabase access token
- **Where to get it**: https://supabase.com/dashboard/account/tokens
- **How to create**:
  1. Go to Supabase Dashboard
  2. Click your profile → Account Settings
  3. Navigate to "Access Tokens"
  4. Click "Generate new token"
  5. Name it "GitHub Actions - Dev" and copy the token

#### `SUPABASE_DB_PASSWORD`
- **What**: Database password for your Supabase dev project
- **Where to get it**: Supabase Dashboard → Project Settings → Database
- **Note**: This is the database password, not your account password

#### `SUPABASE_SERVICE_ROLE_KEY`
- **What**: Service role key with admin privileges
- **Where to get it**: Supabase Dashboard → Project Settings → API
- **Location**: Under "Project API keys" section, copy the `service_role` key
- **⚠️ Warning**: Keep this secret! It bypasses Row Level Security

### Step 2: Verify Supabase Project Configuration

Update the workflow files if your project ID is different:

```yaml
# .github/workflows/deploy-dev.yml
env:
  SUPABASE_PROJECT_ID: 'huqhstmwvqoefcojaflg'  # Update if needed
```

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment-specific values:
   ```env
   SITE_URL=https://dev.amateurcyclingstats.com
   SUPABASE_URL=https://huqhstmwvqoefcojaflg.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   MAILERSEND_API_KEY=mlsn.your-key
   MAILERSEND_FROM_EMAIL=noreply@dev.amateurcyclingstats.com
   MAILERSEND_FROM_NAME=Amateur Cycling Stats
   ```

3. **⚠️ Important**: Add `.env` to `.gitignore` (already configured)

### Step 4: Test the Setup

Trigger a manual workflow run:

1. Go to GitHub → Actions tab
2. Select "Manual Database Migration"
3. Click "Run workflow"
4. Check both options:
   - ✅ Reset Database
   - ✅ Include Seeding
5. Click "Run workflow"

Monitor the logs to ensure everything runs successfully.

---

## Deployment Workflow

### Standard Development Flow

```mermaid
graph LR
    A[Developer pushes to develop] --> B[GitHub Actions runs]
    B --> C[Migrations applied]
    C --> D[Database seeded]
    D --> E[Coolify deploys app]
    E --> F[App live at dev.amateurcyclingstats.com]
```

### Step-by-Step Process

1. **Developer makes changes**
   ```bash
   git checkout develop
   git pull origin develop
   # Make changes to code or migrations
   git add .
   git commit -m "feat: add new feature"
   git push origin develop
   ```

2. **GitHub Actions automatically runs** (2-3 minutes)
   - You'll see the workflow run in the Actions tab
   - Watch logs in real-time if needed

3. **Coolify detects push and deploys** (3-5 minutes)
   - Coolify monitors the `develop` branch
   - Builds Docker container
   - Deploys to dev environment

4. **Verify deployment**
   - Check https://dev.amateurcyclingstats.com
   - Test new features or database changes

### Database Migration Changes

When you add or modify migrations:

1. **Edit existing migration** (recommended for active development):
   ```bash
   # Edit the migration file
   vim supabase/migrations/20250115000001_core_foundation.sql

   # Test locally first
   supabase db reset
   npm run seed:users

   # Commit and push
   git add supabase/migrations/
   git commit -m "fix: update user table schema"
   git push origin develop
   ```

2. **Create new migration** (when ready for production):
   ```bash
   supabase migration new add_feature_x
   # Edit the generated file
   supabase db reset
   npm run seed:users

   git add supabase/migrations/
   git commit -m "feat: add feature X schema"
   git push origin develop
   ```

---

## Manual Operations

### Running Migrations Without Code Deployment

Use the manual migration workflow when you need to:
- Fix database issues quickly
- Refresh seed data
- Test migrations without deploying code

**Steps:**

1. Go to **GitHub → Actions → Manual Database Migration**
2. Click **"Run workflow"**
3. Select options:
   - **Reset Database**: Yes (if you want full reset) or No (for incremental migrations)
   - **Include Seeding**: Yes (to refresh data) or No (migrations only)
4. Click **"Run workflow"**
5. Monitor the progress in the Actions tab

### Connecting to Production Supabase

**⚠️ Warning**: Production operations should be carefully planned and tested in dev first.

To run migrations against production (future use):

1. Create a separate workflow file or use environment-specific secrets
2. Update the project ID and environment variables
3. Require manual approval for production deployments
4. Consider using `supabase db push` instead of `supabase db reset` in production

---

## Troubleshooting

### Common Issues

#### ❌ **"Supabase link failed"**

**Symptoms:**
```
Error: Failed to link project
```

**Solutions:**
1. Verify `SUPABASE_ACCESS_TOKEN` is correct and not expired
2. Check that the project ID matches your Supabase project
3. Ensure the token has sufficient permissions

**How to fix:**
- Regenerate access token in Supabase Dashboard
- Update the GitHub secret
- Re-run the workflow

---

#### ❌ **"Database reset failed"**

**Symptoms:**
```
Error: Failed to run migrations
Error: PGRST301
```

**Solutions:**
1. Check `SUPABASE_DB_PASSWORD` is correct
2. Verify migration files have no syntax errors
3. Check for conflicts with existing data

**How to fix:**
```bash
# Test migrations locally first
supabase db reset

# If it works locally, check GitHub secrets
# If it fails locally, fix the migration file
```

---

#### ❌ **"User seeding failed"**

**Symptoms:**
```
Error: Failed to create user
Error: User already exists
```

**Solutions:**
1. Check if users already exist in the database
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Ensure the seed script handles existing users gracefully

**How to fix:**
- Use `supabase db reset` for clean slate
- Or modify `seed-users.ts` to check for existing users before creating

---

#### ❌ **"Coolify not deploying after successful migration"**

**Symptoms:**
- GitHub Actions workflow succeeds
- But Coolify doesn't deploy the app

**Solutions:**
1. Check Coolify dashboard for deployment logs
2. Verify Coolify is watching the correct branch (`develop`)
3. Check if Coolify has access to the repository

**How to fix:**
- Log into Coolify admin at https://admin.amateurcyclingstats.com
- Check deployment settings and logs
- Manually trigger deployment if needed

---

### Viewing Logs

**GitHub Actions Logs:**
1. Go to GitHub → Actions tab
2. Click on the workflow run
3. Click on the job name to see detailed logs
4. Expand each step to see full output

**Coolify Logs:**
1. Log into https://admin.amateurcyclingstats.com
2. Navigate to your project
3. Click on "Deployments" tab
4. View real-time logs for current deployment

**Supabase Logs:**
1. Go to Supabase Dashboard
2. Select your project
3. Navigate to "Logs" section
4. Filter by query type (SQL, Auth, etc.)

---

### Getting Help

**Documentation:**
- Supabase CLI: https://supabase.com/docs/guides/cli
- GitHub Actions: https://docs.github.com/en/actions
- Coolify: https://coolify.io/docs
- SvelteKit: https://kit.svelte.dev/docs

**Project-Specific:**
- `CLAUDE.md` - Project architecture and patterns
- `README.md` - Quick start guide
- `documentation/` - Detailed implementation guides

**Contact:**
- Create an issue in the GitHub repository
- Check Coolify dashboard status
- Review Supabase project health

---

## Best Practices

### Development

1. **Always test locally first**
   ```bash
   supabase db reset
   npm run seed:users
   npm run dev
   ```

2. **Use descriptive commit messages**
   ```bash
   git commit -m "feat: add user profile page"
   git commit -m "fix: resolve authentication redirect loop"
   git commit -m "refactor: simplify cyclist data fetching"
   ```

3. **Review migration changes carefully**
   - Migrations are irreversible in production
   - Test with seed data to catch issues early
   - Consider data migration scripts for existing data

### Database Migrations

1. **Edit mode during active development** (default)
   - Keeps migration history clean
   - Easier to review changes
   - Recommended until feature is stable

2. **Add mode for production-ready changes**
   - Create new migration files
   - Preserve history for rollback
   - Required for production deployments

3. **Always regenerate types after schema changes**
   ```bash
   supabase gen types typescript --local > src/lib/types/database.types.ts
   ```

### Security

1. **Never commit secrets to version control**
   - Use `.env` for local development
   - Use GitHub Secrets for CI/CD
   - Use Coolify environment variables for production

2. **Rotate credentials regularly**
   - Update Supabase access tokens every 90 days
   - Rotate API keys if compromised
   - Review access logs periodically

3. **Use appropriate secret scope**
   - `SUPABASE_ANON_KEY`: Client-side safe
   - `SUPABASE_SERVICE_ROLE_KEY`: Server-side only, bypasses RLS

---

## Production Deployment (Future)

When ready for production:

1. **Create production workflow** (`.github/workflows/deploy-prod.yml`)
2. **Add manual approval step**
3. **Use `supabase db push` instead of `supabase db reset`**
4. **Add health checks and rollback mechanisms**
5. **Configure production environment variables**
6. **Set up monitoring and alerting**
7. **Document production deployment procedures**

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-01-19 | Initial CI/CD setup for dev environment | Claude Code |

---

**Last Updated:** January 2025
**Maintained By:** Development Team

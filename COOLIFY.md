# Coolify Deployment Guide

This guide covers deploying the Amateur Cycling Stats UI application to Coolify with automatic database migrations using Nixpacks and Supabase CLI.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Variables Configuration](#environment-variables-configuration)
4. [Post-Deployment Command](#post-deployment-command)
5. [Deployment Flow](#deployment-flow)
6. [Manual Operations](#manual-operations)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring](#monitoring)

---

## Overview

### Deployment Architecture

```
Git Push → Coolify
           ↓
    Nixpacks Build (with Supabase CLI)
           ↓
    SvelteKit Build
           ↓
    Deploy Container
           ↓
    Post-Deployment: Run Migrations + Seeding
           ↓
    Application Running
```

### Key Features

- ✅ **Automatic migrations** - Runs on every deployment
- ✅ **Internal network access** - Database never exposed to internet
- ✅ **Nixpacks** - Automated buildpack detection with Supabase CLI
- ✅ **Zero downtime** - Rolling updates
- ✅ **Environment-based config** - Dev/staging/production via environment variables

---

## Prerequisites

Before configuring Coolify, ensure you have:

1. **Coolify instance** running and accessible
2. **Supabase service** deployed in Coolify with:
   - PostgreSQL database (accessible via internal Docker network)
   - Kong API Gateway
   - Supabase Studio (optional)
3. **Application repository** connected to Coolify
4. **MailerSend account** (for email notifications)

---

## Environment Variables Configuration

### Navigate to Environment Variables

**Coolify → Your Application → Environment**

### Required Environment Variables

#### 1. Database Connection (CRITICAL)

```bash
DATABASE_URL=postgresql://postgres:JCTKNAxr7EXGCyhs6zrJSHHlE2RZ8VC5@supabase-db:5432/postgres
```

**Important Notes:**

- Uses `supabase-db` (internal Docker hostname), NOT external domain
- Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- Find values in Coolify → Supabase Service → Environment:
  - `POSTGRES_HOSTNAME` → supabase-db
  - `POSTGRES_PASSWORD` → your database password
  - `POSTGRES_DB` → postgres (or your database name)

#### 2. Supabase API Configuration

```bash
SUPABASE_URL=https://huqhstmwvqoefcojaflg.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-service-role-key...
```

**Where to find:**

- Coolify → Supabase Service → Environment:
  - `SUPABASE_URL` → `${SERVICE_URL_SUPABASEKONG}` or public URL
  - `SUPABASE_ANON_KEY` → `${SERVICE_SUPABASEANON_KEY}`
  - `SUPABASE_SERVICE_ROLE_KEY` → `${SERVICE_SUPABASESERVICE_KEY}`

#### 3. Application Settings

```bash
SITE_URL=https://dev.amateurcyclingstats.com/
ORIGIN=https://dev.amateurcyclingstats.com
NODE_ENV=production
```

#### 4. MailerSend Configuration

```bash
MAILERSEND_API_KEY=mlsn.your-api-key-here
MAILERSEND_FROM_EMAIL=noreply@dev.amateurcyclingstats.com
MAILERSEND_FROM_NAME=Amateur Cycling Stats
```

**Where to find:**

- Sign up at [MailerSend](https://www.mailersend.com/)
- API Keys → Create API Token
- Verify your sending domain in MailerSend dashboard

### Required Supabase Port Configuration

These environment variables are REQUIRED for Supabase CLI to function correctly:

```bash
# Project identifier - use descriptive name for your environment
SUPABASE_ID_PROJECT=coolify-dev

# Supabase service ports (use standard defaults unless you have conflicts)
SUPABASE_API_PORT=54321
SUPABASE_DB_PORT=54322
SUPABASE_DB_SHADOW_PORT=54320
SUPABASE_STUDIO_PORT=54323
SUPABASE_INBUCKET_PORT=54324
SUPABASE_POOLER_PORT=54329
SUPABASE_ANALYTICS_PORT=54327
```

**Note:** These values configure the `supabase/config.toml` file via `env()` function calls. If not set, the Supabase CLI will fail to parse the configuration.

---

## Post-Deployment Command

### Navigate to Post-Deployment Settings

**Coolify → Your Application → General → Post Deployment Command**

### Recommended Command

```bash
npx supabase db reset --yes && npm run seed:users
```

**What this does:**

1. Resets database (drops all tables)
2. Runs all migrations from `supabase/migrations/`
3. Runs `supabase/seed.sql` (user-independent seed data)
4. Runs `npm run seed:users` (user-dependent seed data via Supabase Admin API)

### Alternative Commands

**Incremental migrations (safer for production):**

```bash
npx supabase db push && npm run seed:users
```

**Migrations only (no seeding):**

```bash
npx supabase db push
```

**Full reset only (no seeding):**

```bash
npx supabase db reset --yes
```

---

## Deployment Flow

### Automatic Deployment Trigger

Coolify automatically deploys when you push to the configured branch (e.g., `develop`):

```bash
git push origin develop
```

### Deployment Steps

1. **Coolify detects push** → Starts deployment
2. **Clone repository** → Fetch latest code
3. **Nixpacks plan generation** → Detect Node.js + install Supabase CLI
4. **Install dependencies** → `npm ci`
5. **Build application** → `npm run build`
6. **Create Docker image** → Package application
7. **Deploy container** → Rolling update (zero downtime)
8. **Post-deployment** → Run migrations + seeding
9. **Application running** → Accessible via SITE_URL

### Monitoring Deployment

**Navigate to:** Coolify → Your Application → Deployments

- View real-time logs
- Check build progress
- Monitor post-deployment command output
- Verify migrations succeeded

---

## Manual Operations

### Trigger Manual Deployment

**Coolify → Your Application → General → Deploy**

Click "Deploy" button to manually trigger deployment without pushing code.

### Execute Commands in Running Container

**Coolify → Your Application → Execute Command**

**Useful commands:**

**Run migrations only:**

```bash
npx supabase db push
```

**Reset database:**

```bash
npx supabase db reset --yes
```

**Seed users:**

```bash
npm run seed:users
```

**Check migration status:**

```bash
npx supabase db diff
```

**View database schema:**

```bash
npx supabase db dump
```

**Regenerate types:**

```bash
npx supabase gen types typescript --db-url "$DATABASE_URL" > src/lib/types/database.types.ts
```

### View Application Logs

**Coolify → Your Application → Logs**

Filter by:

- Application logs
- Build logs
- All logs

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Database connection failed" Error

**Symptoms:**

```
Error: failed to connect to postgres
dial tcp: connect: connection refused
```

**Solutions:**

1. Verify `DATABASE_URL` uses internal hostname (`supabase-db`), not external domain
2. Check database password is correct (from Supabase service env vars)
3. Ensure Supabase service is running in Coolify
4. Verify both services are on the same Docker network

**How to check:**

```bash
# In Execute Command
echo $DATABASE_URL
# Should show: postgresql://postgres:PASSWORD@supabase-db:5432/postgres
```

#### 2. "Supabase CLI not found" Error

**Symptoms:**

```
bash: supabase: command not found
```

**Solutions:**

1. Verify `.nixpacks.toml` exists in repository root
2. Check `supabase-cli` is listed in `nixPkgs` array
3. Trigger new deployment to rebuild with updated Nixpacks config

**Check Nixpacks configuration:**

```bash
# In repository
cat .nixpacks.toml
# Should show: nixPkgs = ['nodejs_22', 'npm-9_x', 'supabase-cli']
```

#### 3. "Migration failed" Error

**Symptoms:**

```
Error: migration 20250115000001_core_foundation.sql failed
syntax error at line 42
```

**Solutions:**

1. Check migration file syntax in `supabase/migrations/`
2. Test migration locally first: `supabase db reset`
3. Review migration logs in Coolify deployment output
4. Fix syntax error and redeploy

#### 4. "Seeding failed" Error

**Symptoms:**

```
Error: User already exists
Error: Failed to create cyclist
```

**Solutions:**

1. Run `npx supabase db reset --yes` to start fresh
2. Update seed scripts to handle existing data gracefully
3. Check `SUPABASE_SERVICE_ROLE_KEY` is correct (has admin privileges)

#### 5. Post-Deployment Command Timeout

**Symptoms:**

```
Post-deployment command timed out after 300s
```

**Solutions:**

1. Simplify post-deployment command (remove seeding temporarily)
2. Check database performance (large migrations may take time)
3. Increase timeout in Coolify settings (if available)
4. Run seeding separately after deployment

---

## Monitoring

### Health Checks

**Application Health:**

```bash
curl https://dev.amateurcyclingstats.com
# Should return 200 OK with HTML
```

**Database Connection:**

```bash
# In Execute Command
npx supabase db dump --schema public --data-only | head -n 50
# Should show database tables and data
```

### Performance Monitoring

**Coolify → Your Application → Resources**

Monitor:

- CPU usage
- Memory usage
- Disk usage
- Network traffic

### Database Monitoring

**Supabase Studio:** (if enabled)

```
https://db-dev.amateurcyclingstats.com/project/default
```

- View tables and data
- Run SQL queries
- Monitor connections
- Check RLS policies

---

## Best Practices

### 1. Environment-Specific Configuration

**Development:**

- Use `npx supabase db reset --yes && npm run seed:users` (full reset + seed)
- Faster iterations, less concern about data

**Staging:**

- Use `npx supabase db push && npm run seed:users` (incremental + seed)
- Test migrations before production

**Production:**

- Use `npx supabase db push` (incremental only, no auto-seeding)
- Manual seeding if needed
- Always test in staging first

### 2. Database Backups

**Before major migrations:**

1. Export current database state: `npx supabase db dump > backup.sql`
2. Store backup safely (version control, cloud storage)
3. Run migration
4. Verify success
5. Keep backup for rollback

### 3. Migration Safety

**DO:**

- Test migrations locally before deploying
- Use incremental migrations (`db push`) in production
- Add new columns as nullable first, then make NOT NULL later
- Use database transactions where possible

**DON'T:**

- Run `db reset` in production (data loss!)
- Skip migration testing
- Make breaking schema changes without data migration plan

### 4. Secrets Management

**DO:**

- Use Coolify environment variables for all secrets
- Never commit secrets to git (`.env` is gitignored)
- Rotate secrets periodically (passwords, API keys)
- Use different credentials for dev/staging/production

**DON'T:**

- Hardcode secrets in code
- Share production credentials
- Commit `.env` files to version control

---

## Quick Reference

### Essential Commands

| Task               | Command                                     |
| ------------------ | ------------------------------------------- |
| Deploy application | Push to branch or click "Deploy" in Coolify |
| Run migrations     | `npx supabase db push`                      |
| Reset database     | `npx supabase db reset --yes`               |
| Seed users         | `npm run seed:users`                        |
| View logs          | Coolify → Logs                              |
| Execute command    | Coolify → Execute Command                   |
| Check env vars     | Coolify → Environment                       |

### Essential URLs

| Service         | URL                                                 |
| --------------- | --------------------------------------------------- |
| Application     | https://dev.amateurcyclingstats.com                 |
| Coolify Admin   | https://admin.amateurcyclingstats.com               |
| Supabase Studio | https://db-dev.amateurcyclingstats.com (if enabled) |

### Support Resources

- **Project Documentation:** `README.md`, `CLAUDE.md`, `DEPLOYMENT.md`
- **Coolify Docs:** https://coolify.io/docs
- **Supabase CLI Docs:** https://supabase.com/docs/guides/cli
- **Nixpacks Docs:** https://nixpacks.com/docs

---

## Changelog

| Date       | Change                                                        | Author      |
| ---------- | ------------------------------------------------------------- | ----------- |
| 2025-01-19 | Initial Coolify deployment guide with Nixpacks + Supabase CLI | Claude Code |

---

**Need Help?**

If you encounter issues not covered in this guide:

1. Check Coolify deployment logs
2. Review Supabase service status
3. Verify environment variables are correct
4. Test migrations locally first
5. Create an issue in the GitHub repository

# 🔧 Railway Database Error - Fix Guide

## Problem Identified

Your deployment is failing with this error:
```
WARNING:root:No DATABASE_URL environment variable set, and so no databases setup
django.core.exceptions.ImproperlyConfigured: settings.DATABASES is improperly configured.
```

**Root Cause**: PostgreSQL database has not been added to your Railway project.

## Solution: Add PostgreSQL Database

### Step 1: Add PostgreSQL to Railway Project

1. **Go to your Railway project dashboard**
   - Visit https://railway.app/dashboard
   - Click on your project (comedores-cali or similar)

2. **Add PostgreSQL Database**
   - Click the "**+ New**" button (top right)
   - Select "**Database**"
   - Choose "**Add PostgreSQL**"
   - Railway will automatically provision a PostgreSQL database

3. **Verify DATABASE_URL Variable**
   - After adding PostgreSQL, Railway automatically creates the `DATABASE_URL` variable
   - Go to your **Web Service** (not the database)
   - Click on "**Variables**" tab
   - You should see `DATABASE_URL` listed (it will be long, starting with `postgresql://`)

### Step 2: Link Database to Your Service

Railway should automatically link the database to your web service. To verify:

1. In your project, you should now see **two services**:
   - Your web app (Django)
   - PostgreSQL database

2. They should be connected with a line/arrow showing the relationship

### Step 3: Redeploy

Once PostgreSQL is added:

1. **Trigger a redeploy**:
   - Go to your web service
   - Click "**Deployments**" tab
   - Click "**Redeploy**" on the latest deployment

   OR just push a small change to GitHub:
   ```bash
   git add .
   git commit -m "Add PostgreSQL database"
   git push
   ```

2. **Watch the logs**:
   - Go to "**Deployments**" → Latest deployment
   - You should now see migrations running successfully
   - Look for: `Running migrations... OK`

### Step 4: Verify Database Connection

After successful deployment, test the database:

```bash
# Install Railway CLI if you haven't
npm install -g @railway/cli

# Login and link
railway login
railway link

# Test database connection
railway run python manage.py dbshell
```

Or check in the shell:
```bash
railway run python manage.py shell -c "from django.db import connection; connection.ensure_connection(); print('Database connected!')"
```

## Expected Success Logs

After adding PostgreSQL, your deployment logs should show:

```
[info] Starting Container
[info] Running migrations...
Operations to perform:
  Apply all migrations: admin, auth, comedores, contenttypes, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  [more migrations...]

[info] Collecting static files...
[info] Post-deploy verification...
[info] Starting gunicorn...
[info] Deployment successful
```

## Alternative: Manual DATABASE_URL (Not Recommended)

If you want to use an external PostgreSQL database:

1. Get your PostgreSQL connection string in this format:
   ```
   postgresql://username:password@host:port/database
   ```

2. Add it as a variable in Railway:
   - Go to your service → Variables
   - Add: `DATABASE_URL=postgresql://...`

3. Redeploy

**Note**: This is not recommended. Using Railway's built-in PostgreSQL is easier and includes automatic backups.

## Troubleshooting

### Issue: "DATABASE_URL not found" even after adding PostgreSQL

**Solution**:
1. Check that you added PostgreSQL to the **project**, not just viewed it
2. Verify the database service and web service are in the **same project**
3. Check Variables tab in **web service** (not database service)
4. Restart the web service: `railway restart`

### Issue: "Connection refused" or "Could not connect to server"

**Solution**:
1. Verify PostgreSQL service is running (green indicator)
2. Check that the `DATABASE_URL` format is correct
3. Ensure `psycopg2-binary` is in `requirements.txt` (it already is)

### Issue: Migrations fail with "relation already exists"

**Solution**:
```bash
# Reset migrations (CAREFUL - this deletes data)
railway run python manage.py migrate --fake

# Or drop and recreate database (in Railway dashboard)
# Delete PostgreSQL service
# Add new PostgreSQL service
# Redeploy
```

## Current Status

After you add PostgreSQL:
- ✅ Database configuration is ready in `settings/base.py`
- ✅ `psycopg2-binary` is installed
- ✅ Migrations are defined
- ✅ `Procfile` includes migration command
- ⏳ **YOU NEED TO**: Add PostgreSQL service in Railway

## Quick Command Reference

```bash
# After adding PostgreSQL to Railway:

# 1. Import comedores data
railway run python importar_comedores.py

# 2. Create superuser
railway run python manage.py createsuperuser

# 3. Verify data
railway run python manage.py shell -c "from apps.comedores.models import Comedor; print(f'Total: {Comedor.objects.count()}')"

# 4. Check migrations
railway run python manage.py showmigrations

# 5. View logs
railway logs --follow
```

## Summary

**What to do RIGHT NOW**:

1. ✅ Go to Railway dashboard
2. ✅ Click "+ New" → "Database" → "Add PostgreSQL"
3. ✅ Wait 30 seconds for provisioning
4. ✅ Redeploy your web service
5. ✅ Watch logs - should now work!

**Time needed**: ~2 minutes

---

**After PostgreSQL is added, your app will deploy successfully!**

The code is ready - you just need to add the database service in Railway.

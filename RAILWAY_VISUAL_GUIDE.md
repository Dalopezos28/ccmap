# 📸 Railway PostgreSQL Setup - Visual Step-by-Step Guide

## Current Error

Your deployment is crashing with:
```
⚠️ No DATABASE_URL environment variable set
❌ Django cannot start without a database
```

## Why This Happens

Railway deployed your code, but there's **no database connected**. It's like having a restaurant (your app) but no kitchen (database).

---

## 🎯 The Fix (5 Simple Clicks)

### Step 1: Open Your Railway Project

1. Go to https://railway.app/dashboard
2. You should see your project (probably named after your GitHub repo)
3. Click on it to open the project view

**What you'll see**:
- One purple/blue box (your Django web service)
- Logs showing the database error

---

### Step 2: Click "+ New"

Look for the "+ New" button in the top-right area of your project dashboard.

**Location**: Top right of the project canvas

---

### Step 3: Select "Database"

After clicking "+ New", a menu will appear with options:
- Empty Service
- GitHub Repo
- **Database** ← Click this one
- Template

---

### Step 4: Choose "Add PostgreSQL"

You'll see database options:
- Add PostgreSQL ← **Click this**
- Add MySQL
- Add Redis
- Add MongoDB

Railway will now:
1. Provision a PostgreSQL database (takes ~30 seconds)
2. Automatically create the `DATABASE_URL` variable
3. Link it to your web service

**What you'll see**:
- A new box appears labeled "PostgreSQL"
- A line connecting PostgreSQL to your web service
- The database box will show "Provisioning..." then "Active"

---

### Step 5: Redeploy Your Web Service

Now that the database exists, restart your app:

**Option A - Automatic** (Recommended):
1. Click on your **web service** box (not the database)
2. Go to "**Settings**" tab
3. Scroll down to "**Service**" section
4. Click "**Restart**" button

**Option B - Trigger from Git**:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## ✅ Success Indicators

After redeploying with PostgreSQL:

### In the Logs Tab:
```
✓ Starting Container
✓ Running migrations...
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying comedores.0001_initial... OK
  [14 migrations applied]
✓ Collecting static files...
✓ Post-deploy completed
✓ Starting gunicorn server on port 8000
✓ Deployment successful
```

### In the Variables Tab:
You should now see:
- `DATABASE_URL` = `postgresql://postgres:xxxxx@...`
- `DJANGO_SETTINGS_MODULE` = `comedores_cali.settings.production`
- `SECRET_KEY` = `your-secret-key`

### In Your Project Canvas:
```
┌─────────────────┐         ┌──────────────┐
│  PostgreSQL     │◄────────┤  Web Service │
│  (Active)       │         │  (Active)    │
└─────────────────┘         └──────────────┘
```

---

## 🎉 After Success

Once your app is running, complete the setup:

### 1. Import the 265 Comedores

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Import data
railway run python importar_comedores.py
```

Expected output:
```
Importando comedores desde comedores_data.csv...
✓ Procesados: 265
✓ Exitosos: 265
✓ Total en base de datos: 265
```

### 2. Create Admin User

```bash
railway run python manage.py createsuperuser
```

Follow the prompts to create your admin account.

### 3. Open Your App

```bash
railway open
```

Your browser will open showing your live app with:
- 265 comedores on the map
- Working network graph
- Functioning API

---

## 📋 Quick Checklist

Before adding PostgreSQL:
- [ ] I can see my project in Railway dashboard
- [ ] My web service is deployed (but crashing)
- [ ] I see database errors in the logs

Adding PostgreSQL:
- [ ] Click "+ New" button
- [ ] Select "Database"
- [ ] Choose "Add PostgreSQL"
- [ ] Wait for provisioning (~30 seconds)
- [ ] PostgreSQL box appears and shows "Active"

After adding PostgreSQL:
- [ ] Click web service → Settings → Restart
- [ ] Check logs - migrations should run successfully
- [ ] No more database errors
- [ ] App is accessible via Railway URL

Final setup:
- [ ] Run `railway run python importar_comedores.py`
- [ ] Run `railway run python manage.py createsuperuser`
- [ ] Open app and verify 265 markers on map

---

## 🆘 Common Issues

### "I don't see the + New button"

**Solution**: You're probably in the service view, not the project view.
- Look for a "back" arrow or breadcrumb
- Click on the project name to go to project level
- The "+ New" button only appears at project level

### "PostgreSQL is stuck on Provisioning"

**Solution**: Usually takes 10-60 seconds.
- Wait a bit longer
- Refresh the page
- If stuck >5 minutes, delete it and add again

### "My app redeployed but still showing database error"

**Solution**: Check variables
- Click web service → "Variables" tab
- Verify `DATABASE_URL` exists
- If not, you may need to manually reference the database:
  - Go to PostgreSQL service
  - Copy the connection string
  - Add as `DATABASE_URL` variable to web service

### "After adding database, got 'no such table' error"

**Solution**: Migrations didn't run
```bash
railway run python manage.py migrate
```

---

## 🎓 Understanding Railway Services

**Your Project** (container for everything)
├── **Web Service** (your Django app)
│   ├── Code from GitHub
│   ├── Environment variables
│   └── Runs on a server
└── **PostgreSQL** (your database)
    ├── Tables and data
    ├── Automatic backups
    └── Connection string (DATABASE_URL)

The services need to be **in the same project** to talk to each other.

---

## 📞 Next Steps After Database is Added

1. **Verify deployment succeeded**:
   ```bash
   railway logs --lines 50
   ```

2. **Import comedores**:
   ```bash
   railway run python importar_comedores.py
   ```

3. **Create admin**:
   ```bash
   railway run python manage.py createsuperuser
   ```

4. **Test your app**:
   - Visit your Railway URL
   - Check `/admin/`
   - View the map at `/`
   - View network graph at `/network/`
   - Test API at `/api/comedores/`

---

## 💡 Pro Tips

1. **Keep Railway tab open** while deploying to watch progress
2. **Use railway logs** command to debug issues
3. **PostgreSQL is free** on Railway's Hobby plan up to 1GB
4. **Automatic backups** are included with Railway PostgreSQL
5. **DATABASE_URL changes** if you recreate the database

---

**That's it! Adding PostgreSQL should take 2-3 minutes and fix the deployment error.**

Your app is fully configured and ready - it just needs the database!

# 🚀 Quick Start - Deploy to Railway in 5 Minutes

## ⚡ Super Fast Deployment

### 1. Push to GitHub (2 min)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/comedores-cali.git
git push -u origin main
```

### 2. Deploy on Railway (2 min)
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Click "Add PostgreSQL" database
5. Wait for deploy to complete

### 3. Set Environment Variables (1 min)
In Railway dashboard, add these variables:
```env
DJANGO_SETTINGS_MODULE=comedores_cali.settings.production
SECRET_KEY=<run command below to generate>
DEBUG=False
```

Generate SECRET_KEY:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 4. Import Data (1 min)
```bash
npm install -g @railway/cli
railway login
railway link
railway run python importar_comedores.py
```

### 5. Create Admin User (1 min)
```bash
railway run python manage.py createsuperuser
```

### 6. Open Your App! 🎉
```bash
railway open
```

---

## ✅ What You Get

- **265 comedores** comunitarios de Cali
- **Interactive map** with search and filters
- **Network graph** visualization (WEF-style)
- **REST API** with GeoJSON support
- **Admin panel** for management
- **21,525 cupos** across 25 comunas

---

## 🔗 Your URLs

After deployment:
```
https://your-project.up.railway.app/          → Map
https://your-project.up.railway.app/network/  → Network Graph
https://your-project.up.railway.app/admin/    → Admin Panel
https://your-project.up.railway.app/api/      → REST API
```

---

## 🆘 Problems?

**Build fails?**
```bash
railway logs
```

**Database empty?**
```bash
railway run python importar_comedores.py
```

**500 error?**
Check SECRET_KEY is set in Railway variables

---

## 📚 Full Documentation

- **Detailed deployment**: `DEPLOY_RAILWAY.md`
- **All Railway commands**: `COMANDOS_RAILWAY.md`
- **Complete checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Project summary**: `RESUMEN_DEPLOY.md`

---

**That's it! Your app should be live in ~5 minutes.** 🚀

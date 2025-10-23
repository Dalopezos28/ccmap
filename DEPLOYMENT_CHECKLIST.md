# ✅ Deployment Checklist - Comedores Comunitarios Cali

## 📋 Pre-Deployment Verification

### Local Files Ready
- [x] `requirements.txt` - Updated with Pillow 11.0.0 (Python 3.11/3.13 compatible)
- [x] `runtime.txt` - Python 3.11.9 specified
- [x] `Procfile` - Railway startup commands configured
- [x] `railway.json` - Railway build/deploy configuration
- [x] `post_deploy.py` - Post-deployment verification script
- [x] `importar_comedores.py` - 265 comedores import script
- [x] `comedores_data.csv` - Real data from Cali
- [x] `settings/production.py` - Optimized for Railway
- [x] `.gitignore` - Sensitive files excluded

### Features Implemented
- [x] PostgreSQL database configuration with fallback
- [x] 265 comedores comunitarios imported
- [x] Interactive Leaflet map with search/filters
- [x] WEF-style D3.js network graph visualization
- [x] REST API with DRF
- [x] Admin panel with custom views
- [x] Static files handling with WhiteNoise
- [x] CORS configured
- [x] GeoJSON endpoints

## 🚀 Deployment Steps

### Step 1: Git Repository
```bash
# If first time
git init
git add .
git commit -m "Initial commit - Ready for Railway deployment"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/comedores-cali.git
git branch -M main
git push -u origin main
```

**Status**: ⏳ Pending

### Step 2: Railway Project Setup
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway auto-detects Django project

**Status**: ⏳ Pending

### Step 3: Add PostgreSQL Database
1. In Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway automatically creates `DATABASE_URL` variable

**Status**: ⏳ Pending

### Step 4: Configure Environment Variables

Required variables in Railway:
```env
DJANGO_SETTINGS_MODULE=comedores_cali.settings.production
SECRET_KEY=<generate-secure-key-here>
DEBUG=False
ALLOWED_HOSTS=.railway.app,.up.railway.app
```

Optional variables:
```env
CORS_ALLOWED_ORIGINS=*
```

**Generate SECRET_KEY**:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Status**: ⏳ Pending

### Step 5: Deploy and Verify
Railway will automatically:
1. Install dependencies from `requirements.txt`
2. Run migrations
3. Collect static files
4. Run `post_deploy.py`
5. Start gunicorn server

Check logs:
```bash
railway logs
```

**Status**: ⏳ Pending

### Step 6: Import Comedores Data

Install Railway CLI:
```bash
npm install -g @railway/cli
```

Login and link:
```bash
railway login
railway link
```

Import comedores:
```bash
railway run python importar_comedores.py
```

Verify:
```bash
railway run python manage.py shell -c "from apps.comedores.models import Comedor; print(f'Total: {Comedor.objects.count()}')"
```

**Expected output**: Total: 265

**Status**: ⏳ Pending

### Step 7: Create Superuser

```bash
railway run python manage.py createsuperuser
```

Or create programmatically:
```bash
railway run python manage.py shell -c "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@example.com', 'YOUR_SECURE_PASSWORD')"
```

**Status**: ⏳ Pending

### Step 8: Test Application

Open your app:
```bash
railway open
```

Test these URLs:
- [ ] `https://your-app.up.railway.app/` - Main map with 265 markers
- [ ] `https://your-app.up.railway.app/network/` - Network graph
- [ ] `https://your-app.up.railway.app/admin/` - Admin login
- [ ] `https://your-app.up.railway.app/api/comedores/` - API endpoint
- [ ] `https://your-app.up.railway.app/api/comedores/geojson/` - GeoJSON data

**Status**: ⏳ Pending

## 🔍 Post-Deployment Verification

### Database
```bash
# Check migrations
railway run python manage.py showmigrations

# Check comedores count
railway run python manage.py shell -c "from apps.comedores.models import Comedor; print(Comedor.objects.count())"

# Check by comuna
railway run python manage.py shell -c "from apps.comedores.models import Comedor; from django.db.models import Count; print(list(Comedor.objects.values('comuna').annotate(total=Count('id')).order_by('comuna')))"
```

### Static Files
- [ ] CSS loads correctly
- [ ] JavaScript loads (Leaflet, D3.js)
- [ ] Images display (favicon, icons)
- [ ] Map tiles load

### API Endpoints
```bash
# Test API
curl https://your-app.up.railway.app/api/comedores/

# Test GeoJSON
curl https://your-app.up.railway.app/api/comedores/geojson/

# Test network graph data
curl https://your-app.up.railway.app/api/comedores/network_graph/
```

### Functionality
- [ ] Map displays 265 markers
- [ ] Search works (by name/neighborhood)
- [ ] Filters work (type, status, etc.)
- [ ] Network graph renders correctly
- [ ] Node search in network graph works
- [ ] Tooltips appear on hover
- [ ] Admin panel accessible
- [ ] Can create/edit comedores in admin

## 📊 Expected Results

### Database Stats
- **Total Comedores**: 265
- **Total Cupos**: 21,525
- **Comunas**: 25
- **Active Comedores**: ~265
- **Average Cupos per Comedor**: ~81

### Network Graph
- **Barrio Nodes**: 25
- **Comedor Nodes**: ~20 (top by capacity)
- **Links**: Based on similarity
- **Color Categories**:
  - Verde: >100 cupos
  - Azul: 50-100 cupos
  - Amarillo: 20-49 cupos
  - Naranja: <20 cupos

## 🐛 Troubleshooting

### Issue: Build Fails
**Check**:
```bash
railway logs --filter "error"
```

**Common causes**:
- Missing dependency in `requirements.txt`
- Wrong Python version in `runtime.txt`
- Database connection error

### Issue: Database Empty
**Solution**:
```bash
railway run python importar_comedores.py
```

### Issue: Static Files Not Loading
**Check**:
```bash
railway run python manage.py collectstatic --noinput
railway logs | grep static
```

**Verify** WhiteNoise is in `INSTALLED_APPS` and middleware.

### Issue: 500 Error
**Check**:
```bash
railway logs --lines 100
```

**Common causes**:
- `SECRET_KEY` not set
- `ALLOWED_HOSTS` incorrect
- Database migration not run

### Issue: DisallowedHost Error
**Solution**:
Add your Railway domain to `ALLOWED_HOSTS`:
```bash
railway variables set ALLOWED_HOSTS=.railway.app,.up.railway.app,your-custom-domain.com
railway restart
```

## 📚 Documentation References

- **Railway Commands**: See `COMANDOS_RAILWAY.md`
- **Deployment Guide**: See `DEPLOY_RAILWAY.md`
- **Project Summary**: See `RESUMEN_DEPLOY.md`
- **Network Graph**: See `NETWORK_GRAPH_README.md`
- **Database Migration**: See `MIGRACION_POSTGRESQL.md`

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Site loads at Railway URL
- ✅ Map displays 265 comedores
- ✅ Network graph is interactive
- ✅ API returns JSON data
- ✅ Admin panel accessible
- ✅ No console errors
- ✅ All static files load
- ✅ Database queries work

## 💡 Next Steps After Deployment

1. **Custom Domain**: Add custom domain in Railway settings
2. **Monitoring**: Set up Railway alerts for downtime
3. **Backups**: Schedule database backups
4. **Analytics**: Add Google Analytics or similar
5. **SEO**: Add meta tags and sitemap
6. **Performance**: Enable caching for API endpoints
7. **Security**: Review CORS and authentication settings

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Django Docs**: https://docs.djangoproject.com

---

**Project**: Comedores Comunitarios Cali
**Technology Stack**: Django 4.2 + PostgreSQL + DRF + Leaflet + D3.js
**Deployment Platform**: Railway.app
**Status**: Ready for Deployment
**Date**: 2025-10-22

**Total Comedores**: 265
**Total Cupos**: 21,525
**Comunas Covered**: 25

🎉 **Your project is 100% ready for deployment!**

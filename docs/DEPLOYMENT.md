# 🚀 FitnessTracker Deployment Guide

This guide walks you through deploying your FitnessTracker app to production.

**Architecture:**
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express)
- **Database**: MongoDB Atlas (already configured)

---

## 📋 Prerequisites

1. GitHub account with your code pushed
2. Vercel account (free): https://vercel.com
3. Render account (free): https://render.com
4. MongoDB Atlas already set up (you have this!)

---

## 🔧 Step 1: Prepare Your Repository

Make sure your project is pushed to GitHub with this structure:

```
FitnessTracker/
├── client/           # Frontend (deploy to Vercel)
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── .env.production
│
├── server/           # Backend (deploy to Render)
│   ├── server.js
│   ├── package.json
│   ├── render.yaml
│   └── .env (DO NOT COMMIT - add to .gitignore)
│
└── package.json
```

### Important: Secure your secrets!

Create/update `.gitignore` in the root:
```
# Server secrets
server/.env

# Node modules
node_modules/
**/node_modules/

# Build outputs
client/dist/
```

---

## 🖥️ Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### 2.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `fitness-tracker-api`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

### 2.3 Add Environment Variables
In Render dashboard, go to **Environment** tab and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://...` (your MongoDB Atlas connection string) |
| `JWT_SECRET` | `your-super-secret-key-make-it-long-and-random` |
| `CLIENT_URL` | `https://your-app.vercel.app` (add after Vercel deploy) |

### 2.4 Deploy
Click **"Create Web Service"**

⏳ Wait for deployment (2-5 minutes)

📝 **Note your Render URL**: `https://fitness-tracker-api.onrender.com`

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Add Environment Variables
In Vercel project settings → Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://fitness-tracker-api.onrender.com/api` |

⚠️ Replace `fitness-tracker-api` with your actual Render app name!

### 3.4 Deploy
Click **"Deploy"**

📝 **Note your Vercel URL**: `https://your-app.vercel.app`

---

## 🔗 Step 4: Update CORS (Important!)

After both are deployed, update Render environment:

1. Go to Render dashboard → Your service → Environment
2. Add/update:
   - `CLIENT_URL` = `https://your-app.vercel.app`

3. Trigger a new deploy (Render dashboard → Manual Deploy)

---

## ✅ Step 5: Verify Deployment

1. **Test Backend**:
   ```
   https://fitness-tracker-api.onrender.com/api/health
   ```
   Should return: `{"status": "ok", ...}`

2. **Test Frontend**:
   - Open your Vercel URL
   - Try registering a new user
   - Log in and check all features

---

## 🐛 Troubleshooting

### "CORS Error"
- Verify `CLIENT_URL` is set correctly in Render
- Make sure it includes `https://` and no trailing slash

### "Network Error" or API not responding
- Render free tier sleeps after 15 min of inactivity
- First request may take 30-60 seconds to wake up
- Consider upgrading to paid tier for always-on

### "MongoDB connection failed"
- Check `MONGO_URI` is correct in Render
- Verify MongoDB Atlas allows connections from all IPs:
  - MongoDB Atlas → Network Access → Add `0.0.0.0/0`

### Build fails on Vercel
- Check if `VITE_API_URL` is set correctly
- Verify no TypeScript errors in the build logs

---

## 🔄 Automatic Deployments

Both Vercel and Render support auto-deploy:
- Every push to `main` branch triggers a new deployment
- You can configure other branches in settings

---

## 📊 Monitoring

### Render
- View logs: Dashboard → Your Service → Logs
- View metrics: Dashboard → Your Service → Metrics

### Vercel
- View deployments: Dashboard → Your Project → Deployments
- View analytics: Dashboard → Your Project → Analytics

---

## 💰 Free Tier Limits

### Render (Free)
- 750 hours/month of running time
- Sleeps after 15 min inactivity
- 512 MB RAM

### Vercel (Hobby)
- 100 GB bandwidth/month
- Unlimited static deployments
- 10 second serverless timeout

### MongoDB Atlas (Free - M0)
- 512 MB storage
- Shared RAM
- Good for small projects

---

## 🚀 Ready to Deploy!

1. Push your code to GitHub
2. Deploy backend to Render
3. Deploy frontend to Vercel
4. Update environment variables
5. Test everything works!

Good luck with your deployment! 🎉

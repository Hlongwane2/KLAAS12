# KLAAS12 - Vercel Deployment Guide

## Your Vercel Site
**URL:** https://frontend-six-gray-65.vercel.app/

## ✅ Required Environment Variables for Vercel

You MUST add these environment variables to your Vercel dashboard for the app to work:

### Steps to Add Environment Variables:

1. Go to: https://vercel.com/hlongwaneklaas53-gmailcoms-projects/frontend/settings/environment-variables

2. Add these 5 variables:

| Variable Name | Value |
|--------------|-------|
| `VITE_GEMINI_API_KEY` | `AIzaSyD0eza2Rk_a5QIWlxlwNo7IGzGbmzRFKQU` |
| `VITE_GROQ_API_KEY` | `key-hlongwaneklaas53-gmail-com` |
| `VITE_GROQ_API_BASE` | `https://api.groq.com/openai/v1` |
| `VITE_SUPABASE_URL` | `https://azgbmemnmmunsisugvyl.supabase.co` |
| `VITE_SUPABASE_API_KEY` | `sb_publishable_otPH2q5l9XasK-ssKtoQfQ_U6BVLtst` |

3. Click "Save" after adding each variable

4. Redeploy your project:
   - Go to: https://vercel.com/hlongwaneklaas53-gmailcoms-projects/frontend
   - Click "Deployments"
   - Click the latest deployment
   - Click "Redeploy"

## 🚀 Features That Will Work:

Once environment variables are set:

✅ **Login System** - Users can log in
✅ **Dashboard** - Full dashboard with stats
✅ **Study Time Tracking** - Automatic time tracking
✅ **Activity Logs** - Clickable stats showing activities
✅ **Completed Tasks** - View completed tasks
✅ **Study Zone** - Upload papers and generate quizzes
✅ **Flashcards** - AI-powered flashcard generation
✅ **Quiz Generation** - AI creates quizzes from papers
✅ **Question Papers** - Download Grade 12 past papers
✅ **Task Management** - Add, complete, and track study tasks

## 📱 How to Use:

1. **Login**: Open https://frontend-six-gray-65.vercel.app/
2. **Dashboard**: View your study stats
3. **Study Tasks**: Add tasks and track time
4. **Study Zone**: Upload notes and generate AI content
5. **Question Papers**: Download past exam papers

## 🔄 Auto-Deploy:

Every time you push to GitHub, Vercel automatically deploys:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically build and deploy your changes!

## ⚠️ Important Notes:

- The `.env` file is NOT committed to GitHub (for security)
- Environment variables MUST be set in Vercel dashboard
- Changes to code auto-deploy, but env vars must be added manually
- Question papers download from external sources (Stanmore Physics)

## 🐛 Troubleshooting:

If something doesn't work on Vercel:

1. **Check Environment Variables**: Make sure all 5 are added
2. **Check Build Logs**: Go to Vercel → Deployments → View build logs
3. **Redeploy**: Click "Redeploy" on the latest deployment
4. **Clear Cache**: Clear browser cache and reload

## 📊 Current GitHub Repository:

https://github.com/Hlongwane2/KLAAS12

All code changes are automatically synced with Vercel!

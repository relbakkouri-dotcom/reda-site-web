# Deployment Guide

## Current Setup
Your app is now configured to run on Vercel as a serverless function. The fixes applied:

1. ✅ Added `vercel.json` configuration for Vercel deployment
2. ✅ Updated `src/server.js` to export the Express app for Vercel
3. ✅ Updated `src/database.js` to use `/tmp` directory on Vercel

## Important: Database Limitation ⚠️
The current setup uses SQLite with the `/tmp` directory on Vercel. This is **temporary and ephemeral**:
- Data persists only during a single serverless function execution
- Data is lost when the function ends or new instances are created
- Perfect for development, but **NOT suitable for production**

## For Production, Upgrade to a Cloud Database

### Recommended Options:

#### 1. **MongoDB Atlas** (Easiest for beginners)
   ```bash
   npm install mongodb
   ```
   - Create free account at mongodb.com/cloud/atlas
   - Get connection string
   - Set `MONGODB_URI` in Vercel environment variables

#### 2. **Supabase** (PostgreSQL + Auth)
   ```bash
   npm install @supabase/supabase-js
   ```
   - Create account at supabase.com
   - Setup is PostgreSQL-based with built-in auth

#### 3. **PostgreSQL on Heroku/Railway**
   ```bash
   npm install pg
   ```
   - More traditional SQL database option

## Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Fix Vercel serverless deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```
   Or connect your GitHub repo directly at vercel.com

3. **Set Environment Variables** (if using cloud database)
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add your database connection strings

## Local Development
To test locally:
```bash
npm install
npm run dev
```
Your app will use the local SQLite database in `/data/students.db`

## Troubleshooting

**Error: "FUNCTION_INVOCATION_FAILED"**
- Check Vercel logs: `vercel logs`
- Verify all dependencies are in `package.json`
- Check that database operations complete successfully

**Database connection errors**
- For cloud database: verify connection string in environment variables
- For local dev: ensure `/data` directory exists


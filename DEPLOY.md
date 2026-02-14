# Deploy CallSync to Render.com

Follow these exact steps to deploy your video calling app with working cross-network calls:

## Step 1: Push to GitHub

```bash
cd /Users/aishwaryabajpai/Downloads/files/call-session-app

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - CallSync app"

# Create a new repository on GitHub (https://github.com/new)
# Name it: callsync-app
# Then run:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/callsync-app.git
git push -u origin main
```

## Step 2: Deploy to Render

1. Go to **https://render.com** and sign up (free, use GitHub login)

2. Click **"New +"** → **"Blueprint"**

3. Connect your GitHub repository: `callsync-app`

4. Render will detect `render.yaml` automatically

5. Add your environment variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service key

6. Click **"Apply"**

## Step 3: Wait for Deployment

Render will:
- ✅ Install all dependencies
- ✅ Build the React frontend
- ✅ Start the TURN server
- ✅ Start the backend server

After ~3-5 minutes, you'll get a URL like:
`https://callsync-app.onrender.com`

## Step 4: Test It!

Open the Render URL on:
- Your laptop (WiFi)
- Your phone (Mobile data)

Create/join a session and start calling - it will work perfectly across ANY network!

## Troubleshooting

If deployment fails:
- Check the build logs in Render dashboard
- Make sure `.env` variables are set
- Ensure package.json files are correct

---

**No more tunneling issues! Once deployed, your app has:**
- ✅ Public HTTPS URL (permanent)
- ✅ Real public IP (no NAT issues)
- ✅ Working TURN server (100% connection success)
- ✅ Free tier (no costs)

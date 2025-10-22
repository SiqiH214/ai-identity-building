# 🚀 Deployment Guide

Your app is ready to go live! Since this is a Next.js app with API routes, it needs to be deployed on a platform that supports server-side rendering.

## ✅ Recommended: Vercel (Free & Easy)

Vercel is made by the Next.js team and offers the best experience.

### Quick Deploy (2 minutes):

1. **Go to Vercel**: https://vercel.com/new

2. **Import your GitHub repository**:
   - Click "Import Git Repository"
   - Select: `SiqiH214/ai-identity-building`
   - Click "Import"

3. **Configure (leave defaults, just add env vars)**:
   - Framework Preset: **Next.js** (auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Add Environment Variables** (CRITICAL):
   ```
   GEMINI_API_KEY = [paste your Gemini API key here]
   GEMINI_IMAGE_MODEL = gemini-2.5-flash-image
   ```

5. **Click "Deploy"** and wait ~2 minutes

6. **Done!** Your app will be live at: `https://ai-identity-building.vercel.app`

### Auto-Deploy on Push

Once connected, every time you push to GitHub, Vercel will automatically:
- Build your app
- Deploy the new version
- Give you a preview URL

## 🔗 Your Live URL

After deployment, share your app at:
```
https://ai-identity-building.vercel.app
```

Or get a custom domain for free through Vercel!

## 🛠️ Alternative: Railway, Render, or Netlify

All of these platforms support Next.js apps with similar steps:
1. Connect your GitHub repo
2. Add environment variables
3. Deploy

---

**Note**: GitHub Pages won't work for this app because it requires a Node.js server to run the API routes.

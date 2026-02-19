# Analytics Setup - Quick Start Guide

## ✅ What's Already Done
- ✅ Analytics tracking code added to configurator
- ✅ Worker code created
- ✅ Dashboard page created
- ✅ All files committed and pushed

## 🚀 What You Need To Do (10 minutes)

### Step 1: Sign Up for Cloudflare (Free)
1. Go to https://dash.cloudflare.com/sign-up
2. Create account with email
3. Verify email

### Step 2: Install Wrangler CLI
Open PowerShell:
```powershell
npm install -g wrangler
```

### Step 3: Login
```powershell
wrangler login
```
This opens your browser - click "Allow" to authorize.

### Step 4: Create KV Namespace
```powershell
cd C:\Users\DanieleLongo\Documents\GitHub\RX5808-Div-Configurator\cloudflare-worker
wrangler kv:namespace create "ANALYTICS"
```

You'll see output like:
```
{ binding = "ANALYTICS", id = "abc123xyz456" }
```

**Copy that ID!**

### Step 5: Update Configuration
Edit `wrangler.toml` and replace `YOUR_KV_NAMESPACE_ID_HERE` with the ID from Step 4.

### Step 6: Deploy Worker
```powershell
wrangler deploy
```

You'll see output like:
```
Published rx5808-analytics (1.23 sec)
  https://rx5808-analytics.YOUR_USERNAME.workers.dev
```

**Copy that URL!**

### Step 7: Update Both Pages
1. Edit `index.html` - Line 531: Replace `YOUR_WORKER_URL_HERE` with your worker URL
2. Edit `analytics.html` - Line 193: Replace `YOUR_WORKER_URL_HERE` with your worker URL

### Step 8: Commit and Push
```powershell
cd C:\Users\DanieleLongo\Documents\GitHub\RX5808-Div-Configurator
git add .
git commit -m "config: add Cloudflare Worker URL"
git push origin main
```

### Step 9: Wait 2 Minutes
GitHub Pages will deploy automatically.

### Step 10: View Your Dashboard
Visit: https://lochnessfpv.github.io/RX5808-Div-Configurator/analytics.html

---

## 📊 What Gets Tracked

| Event | When It Fires |
|-------|---------------|
| `page_view` | Someone visits the configurator |
| `version_selected` | User changes version dropdown |
| `install_click` | User clicks Install button |
| `install_success` | Firmware flashes successfully |
| `install_failed` | Firmware flash fails |

## 💰 Cost Breakdown

**100% Free** with these limits:
- 100,000 requests/day
- 1,000 KV writes/day  
- 100,000 KV reads/day
- 1 GB storage

Your expected usage: ~50-500 events/day = **0.5% of free limit**

## 🔒 Privacy

- No cookies
- No personal data stored
- Only tracks: country, timestamp, version
- GDPR compliant
- No consent banner needed

## 🆘 Troubleshooting

**Dashboard shows error?**
- Check that worker URL is updated in both HTML files
- Check that worker is deployed: `wrangler tail` should show logs

**Worker deploy fails?**
- Run `wrangler login` again
- Check KV namespace ID is correct in wrangler.toml

**No data in dashboard?**
- Wait 2 minutes for GitHub Pages deployment
- Open browser DevTools Console on configurator page
- Look for any analytics errors

---

**Need help?** Open an issue at https://github.com/LochnessFPV/RX5808-Div-Configurator/issues

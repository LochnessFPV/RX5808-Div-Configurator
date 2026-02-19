# RX5808-Div Analytics - Cloudflare Worker Setup

## Setup Instructions

### 1. Sign up for Cloudflare (Free)
1. Go to https://dash.cloudflare.com/sign-up
2. Create a free account
3. Verify your email

### 2. Install Wrangler CLI
```bash
npm install -g wrangler
```

### 3. Login to Cloudflare
```bash
wrangler login
```

### 4. Create KV Namespace
```bash
wrangler kv:namespace create "ANALYTICS"
```

This will output something like:
```
{ binding = "ANALYTICS", id = "abc123xyz456" }
```

Copy the `id` value.

### 5. Update wrangler.toml
Edit `wrangler.toml` and replace `YOUR_KV_NAMESPACE_ID_HERE` with the ID from step 4.

### 6. Deploy Worker
```bash
cd cloudflare-worker
wrangler deploy
```

This will output your worker URL, something like:
```
https://rx5808-analytics.YOUR_USERNAME.workers.dev
```

### 7. Update Configurator
In the configurator's `index.html`, find this line:
```javascript
const ANALYTICS_ENDPOINT = 'YOUR_WORKER_URL_HERE';
```

Replace with your actual worker URL from step 6.

### 8. Commit and Push
```bash
git add .
git commit -m "feat: add Cloudflare Workers analytics"
git push origin main
```

## What Gets Tracked

- **Page Views**: Every time someone visits the configurator
- **Version Selections**: When users change the version dropdown
- **Install Clicks**: When users click the install button
- **Install Success**: Successful firmware installations
- **Install Failed**: Failed installations

## View Analytics

Visit: `https://lochnessfpv.github.io/RX5808-Div-Configurator/analytics.html`

## Privacy

- No cookies used
- No personally identifiable information stored
- Only tracks: timestamp, country, event type, version
- Data expires after 1 year
- GDPR compliant (no consent needed for this type of analytics)

## Costs

**100% Free** with Cloudflare's free tier limits:
- 100,000 requests/day
- 1,000 KV writes/day
- 100,000 KV reads/day

Your expected usage: ~50-500 requests/day - well within limits.

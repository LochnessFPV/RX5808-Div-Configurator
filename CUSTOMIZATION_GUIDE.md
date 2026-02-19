# RX5808-Div Configurator Customization Checklist

## ✅ Phase 1: Basic Branding (10 minutes)

### 1. Update package.json
```json
{
  "name": "rx5808-div-configurator",
  "description": "Web-based firmware configurator for RX5808-Div FPV scanner",
  "repository": {
    "type": "git",
    "url": "https://github.com/LochnessFPV/RX5808-Div-Configurator"
  },
  "author": "LochnessFPV"
}
```

### 2. Update index.html - Key Changes

Find and replace:
- **Title**: `ESP Web Tools` → `RX5808-Div Configurator`
- **Description**: Change meta descriptions to mention RX5808-Div
- **OG tags**: Update all Open Graph tags for social media
- **Content**: Replace demo content with RX5808-Div specific info

### 3. Check What HTML Uses

The index.html likely has hardcoded examples. You need to:
1. Find where it loads manifest URLs
2. Change to point to your GitHub releases
3. Update any example firmware references

## ✅ Phase 2: Point to Your Firmware (30 minutes)

### Key Concept:
ESP Web Tools can load firmware from a manifest URL. You need to change this:

**Current**: Points to ESPHome manifests
**Target**: Point to `https://github.com/LochnessFPV/RX5808-Div/releases/download/v1.7.0/manifest.json`

### Where to Look:

1. **index.html** - Check for `<esp-web-install-button>` tags
2. **src/** folder - TypeScript source files
3. Look for `manifest` attribute or URL references

### Example Change:
```html
<!-- OLD -->
<esp-web-install-button
  manifest="https://esphome.github.io/manifest.json"
>
</esp-web-install-button>

<!-- NEW -->
<esp-web-install-button
  manifest="https://github.com/LochnessFPV/RX5808-Div/releases/download/v1.7.0/manifest.json"
>
</esp-web-install-button>
```

## ✅ Phase 3: Build & Test (15 minutes)

### Build Process:
```bash
# Build the TypeScript source
npm run prepublishOnly

# Or check the script/build file
.\script\build
```

### Test:
1. Refresh localhost:3000
2. Click "Connect"
3. Select your ESP32 COM port
4. Should download firmware from your GitHub release
5. Flash to device

## ✅ Phase 4: Deploy to GitHub Pages (10 minutes)

### Option A: Manual
```bash
# Build
npm run prepublishOnly

# Create gh-pages branch
git checkout -b gh-pages
git add dist/ index.html static/
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### Option B: GitHub Actions (Automated)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: npm run prepublishOnly
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

Then enable GitHub Pages in repo settings.

## 📁 File Structure Overview

```
RX5808-Div-Configurator/
├── index.html              # Main page - MODIFY THIS
├── package.json            # Project config - UPDATE
├── src/                    # TypeScript source
│   ├── install-button.ts   # Main install button logic
│   ├── install-dialog.ts   # Flash dialog
│   └── ...
├── dist/                   # Built JS files (generated)
├── static/                 # Images, CSS
└── script/                 # Build scripts
    └── build               # Build command
```

## 🎨 Visual Customization (Optional)

### Add RX5808-Div Logo:
1. Put logo in `static/logo.png`
2. Update HTML: `<img src="static/logo.png">`

### Custom CSS:
Add to `<style>` section in index.html:
```css
.rx5808-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
}
```

## 🧪 Testing Checklist

- [ ] Page loads at localhost:3000
- [ ] Title shows "RX5808-Div Configurator"
- [ ] "Connect" button works
- [ ] Can select COM port
- [ ] Downloads manifest.json from your GitHub
- [ ] Flashes firmware successfully
- [ ] Device boots with new firmware

## 🚀 Going Live

1. Build: `npm run prepublishOnly`
2. Commit changes
3. Push to GitHub
4. Enable GitHub Pages in Settings
5. Access at: `https://lochnessfpv.github.io/RX5808-Div-Configurator/`

## 🔍 Finding the Manifest URL Code

Run this search in VS Code:
```
Ctrl+Shift+F: manifest
```

Look for:
- `manifest=` attribute
- `fetch()` calls
- URL strings with "github.com" or "releases"

## 📚 Resources

- Current demo: http://localhost:3000
- ESP Web Tools docs: https://esphome.github.io/esp-web-tools/
- Your firmware: https://github.com/LochnessFPV/RX5808-Div/releases

## ⚡ Quick Start Commands

```bash
# Development
npx serve .

# Build
npm run prepublishOnly

# Search for manifest references
grep -r "manifest" src/ index.html
```

---

**Next Step**: Open index.html and start customizing! 🎨

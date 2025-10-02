# China Business Hub - China Static Site

**Purpose:** Fully static, firewall-proof landing page for China market with working contact forms.

## Architecture

```
china/
├── README.md                    # This file
├── data/                        # ✏️ EDIT THESE FILES TO UPDATE CONTENT
│   ├── content.json            # Main site content (EDIT THIS!)
│   └── form-config.json        # Form fields configuration
├── src/                        # Build system (don't edit unless changing design)
│   ├── generator.js            # Static site generator
│   ├── templates/              # HTML templates
│   └── styles.css              # Shared styles
├── dist/                       # Generated static files (deploy this folder)
│   ├── index.html
│   ├── zh/index.html           # Chinese version
│   ├── en/index.html           # English version
│   ├── assets/
│   └── images/
└── package.json                # Build scripts
```

## Quick Start

### 1. Edit Content
```bash
# Edit the content file - this is where ALL your site content lives
nano china/data/content.json
```

### 2. Build Site
```bash
cd china
npm install
npm run build
```

### 3. Preview Locally
```bash
npm run preview
# Opens http://localhost:8080
```

### 4. Deploy to China
```bash
# Upload the /dist folder to:
# - Alibaba Cloud OSS
# - Tencent Cloud COS
# - Or any static hosting
```

## Form Submission Strategy

### Option A: FormSubmit.co (Recommended for Testing)
- **Pros:** Works immediately, no setup
- **Cons:** External service (may be blocked)
- **Setup:** Already configured in form-config.json

### Option B: Jinshuju (金数据) - Best for China
- **Pros:** Chinese service, 100% reliable
- **Cons:** Need to create account
- **Setup:**
  1. Create form at jinshuju.net
  2. Get embed code or action URL
  3. Update form-config.json

### Option C: Your Own Server
- **Pros:** Full control
- **Cons:** Need to set up backend
- **Setup:** Add endpoint URL to form-config.json

## Deployment Options

### Alibaba Cloud (Recommended)
```bash
# Install Alibaba Cloud CLI
npm install -g @alicloud/cli

# Upload to OSS
aliyun oss cp ./dist oss://your-bucket/ --recursive
```

### Tencent Cloud
```bash
# Install COSCMD
pip install coscmd

# Configure and upload
coscmd config -a YOUR_SECRET_ID -s YOUR_SECRET_KEY -b your-bucket -r ap-guangzhou
coscmd upload -r ./dist /
```

### Manual Upload
1. Zip the `dist/` folder
2. Upload via web console
3. Enable CDN
4. Configure custom domain

## Content Management

All content is in `data/content.json`:

```json
{
  "hero": {
    "title": "Edit this title",
    "subtitle": "Edit this subtitle"
  },
  "contact": {
    "email": "your-email@example.com",
    "wechat": "your-wechat-id"
  }
}
```

**No database, no CMS, just JSON files you can edit with any text editor.**

## Testing in China

### Before Deployment
1. Test form submission locally
2. Check all images load
3. Verify WeChat/WhatsApp links work

### After Deployment
1. Use Chinese VPN or ask someone in China to test
2. Test form submission from China
3. Check loading speed (should be <2s)

## Maintenance

### Update Content
1. Edit `data/content.json`
2. Run `npm run build`
3. Upload `dist/` folder

### Update Design
1. Edit `src/templates/` files
2. Edit `src/styles.css`
3. Rebuild and test

### Update Form
1. Edit `data/form-config.json`
2. Rebuild

## Troubleshooting

**Form not working?**
- Check form-config.json action URL
- Try Jinshuju.net as alternative
- Test email delivery

**Site slow in China?**
- Use Alibaba/Tencent CDN
- Optimize images (use WebP)
- Enable gzip compression

**Images not loading?**
- Ensure images are in dist/images/
- Check paths are relative
- No external image CDNs

## Support

See `docs/` folder for:
- Detailed deployment guides
- Form integration tutorials
- China hosting comparisons

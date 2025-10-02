# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**China Business Hub - China Static Site** - Lightweight, firewall-proof static landing page for China market deployment. Built for maximum reliability and performance in China, with working contact forms and zero runtime dependencies.

## Project Purpose

This is a **separate, simplified version** of the main China Business Hub website, specifically optimized for:
- China's Great Firewall compatibility
- Fast loading in China mainland
- Reliable form submissions
- Easy content management without CMS

**This is NOT the main website.** The main Payload CMS website is in the parent directory (`../`). This China site is intentionally separate and static for maximum reliability.

## Architecture

### Core Principle: Content as Data

```
JSON files (editable) → Generator script → Static HTML → Deploy to China CDN
```

**NO database, NO API calls, NO runtime dependencies, NO external services.**

## Development Commands

### Core Commands
- `npm run build` - Generate static site (builds `dist/` folder)
- `npm run preview` - Preview site locally at http://localhost:8080
- `npm run dev` - Build and preview in one command
- `npm run validate` - Validate content.json and form-config.json

### Setup Commands
- `npm install` - Install dependencies (first time only)
- `./setup.sh` - Automated setup and build (Unix/Mac only)

## Key Files to Edit

### Content Management (Edit These)

**DO edit these files to update site content:**

1. **`data/content.json`** - ALL site content (text, images, links)
   - Multilingual content (pt-BR, zh-CN, en)
   - Contact information
   - Service descriptions
   - Meta tags and SEO

2. **`data/form-config.json`** - Contact form configuration
   - Form fields and validation
   - Submission endpoint (FormSubmit/Jinshuju/Custom)
   - Email templates

### Build System (DON'T Edit Unless Changing Design)

**DON'T edit these unless changing the design/layout:**

- `src/generator.js` - Static site generator
- `src/templates/index.html` - HTML template
- `src/styles.css` - Site styles
- `scripts/validate-content.js` - Content validator

## Workflow for Content Updates

```bash
# 1. Edit content
nano data/content.json

# 2. Validate changes
npm run validate

# 3. Build site
npm run build

# 4. Preview locally
npm run preview

# 5. Deploy (see DEPLOYMENT_GUIDE.md)
cd dist
aliyun oss sync ./ oss://your-bucket/ --recursive
```

## Important Rules

### 1. Never Run Development Server
This is a **static site generator**, not a development server.
- ❌ DON'T use `next dev` or similar
- ✅ DO use `npm run preview` to test

### 2. Never Use Git for Deployment
- ❌ DON'T run `git push` to deploy
- ✅ DO upload `dist/` folder to hosting (Alibaba OSS, Tencent COS, etc.)

### 3. Always Rebuild After Content Changes
```bash
# Content changed? Must rebuild:
npm run build
```

### 4. Test in China Before Announcing
- ALWAYS test from China (VPN or ask colleague)
- Form submission must work from China
- Page load time should be <3 seconds

### 5. Keep It Simple
- This is intentionally minimal - don't add complexity
- If you need dynamic features, use the main Payload CMS site instead
- This site is for **reliability in China**, not feature richness

## File Structure

```
china/
├── data/                    # ✏️ EDIT: Site content
│   ├── content.json        # All text, images, links (multilingual)
│   └── form-config.json    # Form fields and submission config
│
├── src/                     # 🏗️ BUILD: Generator and templates
│   ├── generator.js        # Static site generator
│   ├── templates/          # HTML templates
│   └── styles.css          # Site styles
│
├── scripts/                 # 🔧 TOOLS: Utilities
│   └── validate-content.js # Content validator
│
├── dist/                    # 📦 OUTPUT: Deploy this folder
│   ├── index.html          # Portuguese version
│   ├── zh/index.html       # Chinese version
│   ├── en/index.html       # English version
│   └── assets/             # CSS, JS, images
│
├── docs/                    # 📚 DOCUMENTATION
│   └── DEPLOYMENT_GUIDE.md # Complete deployment guide
│
├── claude/                  # 🤖 AI INSTRUCTIONS
│   └── INSTRUCTIONS.md     # Detailed instructions for Claude Code
│
├── README.md               # Project overview
├── QUICKSTART.md           # 10-minute setup guide
├── CLAUDE.md               # This file
├── package.json            # NPM scripts and dependencies
└── setup.sh                # Automated setup script
```

## Content Management

### Multi-Language Support

All text content supports 3 languages:

```json
{
  "hero": {
    "title": {
      "pt": "Texto em Português",
      "zh": "中文文本",
      "en": "English text"
    }
  }
}
```

**Always provide all 3 languages when editing content.**

### Form Submission Options

The site supports multiple form submission methods (configured in `form-config.json`):

1. **FormSubmit.co** - Quick testing (may be blocked in China)
2. **Jinshuju (金数据)** - Recommended for China (100% reliable)
3. **Alibaba Cloud Function** - Advanced (full control)
4. **Custom Backend** - Your own API endpoint

**See `docs/DEPLOYMENT_GUIDE.md` for detailed setup instructions.**

## Build System

### How It Works

1. **Generator reads** `content.json` and `form-config.json`
2. **Loads** HTML template from `src/templates/index.html`
3. **Replaces** placeholders ({{HERO_TITLE}}, etc.) with actual content
4. **Generates** 3 HTML files (Portuguese, Chinese, English)
5. **Copies** CSS, images, and assets
6. **Outputs** to `dist/` folder

**Build time:** <5 seconds

### What Gets Generated

```
dist/
├── index.html           # Portuguese (default)
├── zh/
│   └── index.html      # Chinese
├── en/
│   └── index.html      # English
├── assets/
│   ├── styles.css      # Compiled CSS
│   └── form-handler.js # Form validation
└── images/             # Copied from ../public/media
```

## Deployment Strategy

### Recommended: Alibaba Cloud OSS

**Why Alibaba Cloud:**
- Best performance in China
- Built-in CDN
- Low cost (~$8/month)
- Reliable

**Deployment:**
```bash
npm run build
cd dist
aliyun oss sync ./ oss://your-bucket/ --recursive
```

### Alternative: Tencent Cloud COS

Similar performance and pricing to Alibaba.

### Not Recommended:
- ❌ Vercel (slow/blocked in China)
- ❌ Netlify (slow/blocked in China)
- ❌ GitHub Pages (blocked in China)

## Testing Requirements

### Before Deployment

- [ ] Run `npm run validate` (no errors)
- [ ] Run `npm run build` (successful)
- [ ] Test locally with `npm run preview`
- [ ] Check all 3 language versions
- [ ] Verify form validation works
- [ ] Confirm images load

### After Deployment (CRITICAL)

- [ ] **Test from China** (mandatory!)
- [ ] Form submission works from China
- [ ] Email notification received
- [ ] Page loads in <3 seconds
- [ ] All images load from China
- [ ] No console errors in browser

**Testing from China:**
1. Ask colleague in China to test
2. Use China VPN service
3. Use online tool: webkaka.com

## Common Tasks

### Update Contact Information

```bash
# 1. Edit contact info
nano data/content.json

# Find and update:
# - meta.contact.email
# - meta.contact.phone
# - meta.contact.whatsapp
# - meta.contact.wechat

# 2. Rebuild
npm run build

# 3. Re-deploy
cd dist
aliyun oss sync ./ oss://your-bucket/ --recursive
```

### Change Form Submission Method

```bash
# 1. Edit form config
nano data/form-config.json

# Update submission.action to:
# - FormSubmit: https://formsubmit.co/your-email@domain.com
# - Jinshuju: https://jinshuju.net/f/YOUR_FORM_ID
# - Custom: https://your-api.com/contact

# 2. Rebuild and deploy
npm run build
cd dist
aliyun oss sync ./ oss://your-bucket/ --recursive
```

### Add New Service/Feature

```bash
# 1. Edit content
nano data/content.json

# Find services.items array and add:
{
  "title": { "pt": "...", "zh": "...", "en": "..." },
  "description": { "pt": "...", "zh": "...", "en": "..." },
  "icon": "🎯"
}

# 2. Rebuild and deploy
npm run build
cd dist
aliyun oss sync ./ oss://your-bucket/ --recursive
```

### Update Images

```bash
# 1. Add images to parent project
cp new-image.png ../public/media/

# 2. Update content.json to reference it
nano data/content.json
# Example: "background_image": "/images/new-image.png"

# 3. Rebuild (automatically copies images)
npm run build

# 4. Deploy
cd dist
aliyun oss sync ./ oss://your-bucket/ --recursive
```

## Troubleshooting

### Build Fails

```bash
# Check for JSON syntax errors
npm run validate

# Common issues:
# - Missing comma in JSON
# - Missing closing brace
# - Invalid field name
```

### Form Not Working

```bash
# 1. Check form action URL
grep "action" data/form-config.json

# Should NOT contain placeholders like:
# - "your-email@"
# - "YOUR_FORM_ID"

# 2. Test form endpoint
curl -X POST "YOUR_ACTION_URL" \
  -d "name=Test&email=test@test.com&message=Test"
```

### Site Slow in China

```bash
# Solutions:
# 1. Use Alibaba/Tencent CDN (not Vercel/Netlify)
# 2. Optimize images (use WebP format)
# 3. Enable gzip compression in hosting settings
```

### Images Not Loading

```bash
# Verify images exist
ls -la ../public/media/

# Rebuild to copy images
npm run build

# Check dist/images/
ls -la dist/images/
```

## Integration with Main Site

### Relationship to Parent Project

This China site is **separate from** but **related to** the main Payload CMS project:

**Main Site (parent directory):**
- Payload CMS with full features
- Dynamic content management
- International audience
- Complex features (blog, user auth, etc.)

**China Site (this directory):**
- Static HTML only
- Simple content updates (JSON)
- China audience only
- Core features only (landing page + contact form)

### Shared Resources

**Images:** Automatically copied from `../public/media/`

**Design:** Inspired by main site but simplified

**Content:** Based on main site content but adapted for China

**Separate Deployment:**
- Main site → Vercel/your international hosting
- China site → Alibaba Cloud/Tencent Cloud

## Performance Optimization

### Current Optimizations

✅ Minimal HTML (no bloat)
✅ Single CSS file (no imports)
✅ No external JavaScript libraries
✅ Optimized images (WebP recommended)
✅ No web fonts (system fonts only)
✅ No external API calls
✅ No tracking scripts (optional Baidu Analytics)

### Expected Performance

| Metric | Target | Typical |
|--------|--------|---------|
| First Load | <1s | 0.8s |
| Page Size | <600KB | 450KB |
| Time to Interactive | <2s | 1.5s |
| Lighthouse Score | >90 | 95+ |

**From China with CDN:**
- Beijing: <1s
- Shanghai: <1s
- Guangzhou: <1s

## Security Considerations

### What's Secure

✅ No backend to compromise
✅ No database to hack
✅ No user authentication
✅ No sensitive data stored
✅ HTTPS by default (hosting provider)
✅ Honeypot spam protection
✅ Client-side validation

### What to Protect

⚠️ Form submission endpoint (keep action URL private)
⚠️ Hosting credentials (Alibaba/Tencent access keys)
⚠️ Email addresses in content.json (public but monitor for spam)

### Spam Protection

**Implemented:**
- Honeypot field (hidden `_gotcha` input)
- Client-side validation
- FormSubmit/Jinshuju have built-in protection

## Cost Breakdown

### Monthly Costs (Expected)

**Hosting:**
- Alibaba Cloud OSS: ~¥30
- CDN traffic: ~¥20
- **Total: ~¥50 (~$8 USD/month)**

**Form Submissions:**
- Jinshuju free tier: 100 submissions/month (¥0)
- Paid tier if needed: ¥99/month

**Total: $8-20/month** (vs $50-100 for dynamic hosting)

## Documentation Reference

### Quick Access

- **Quick Start:** `QUICKSTART.md` (10-minute guide)
- **Full Deployment:** `docs/DEPLOYMENT_GUIDE.md` (comprehensive)
- **This File:** `CLAUDE.md` (development guide)
- **AI Instructions:** `claude/INSTRUCTIONS.md` (detailed for Claude Code)

### External Resources

- Alibaba Cloud: https://www.alibabacloud.com
- Tencent Cloud: https://cloud.tencent.com
- Jinshuju: https://jinshuju.net
- FormSubmit: https://formsubmit.co

## Version Information

**Current Version:** 1.0.0
**Last Updated:** 2025-10-02
**Node.js Required:** v18.20.2 or >=20.9.0

## Support

**Issues?**
1. Check `docs/DEPLOYMENT_GUIDE.md` troubleshooting section
2. Run `npm run validate` for config errors
3. Review `claude/INSTRUCTIONS.md` for detailed guidance

**Contact:**
- Email: contato@chinabusinesshub.com
- WeChat: ChinaBizHub

---

## Important Reminders for Claude Code

When working on this project:

1. **Never create new files** unless absolutely necessary
2. **Always prefer editing** existing JSON files over creating new ones
3. **Never run `pnpm dev`** - this is a static site generator, use `npm run preview`
4. **Never run git push** - deployment is manual upload to China hosting
5. **Always validate** before building: `npm run validate`
6. **Test in China** is mandatory before considering work complete
7. **Keep it simple** - this project intentionally avoids complexity
8. **Document changes** in `claude/report/` for significant modifications

## Project Philosophy

**Simplicity over features**
**Reliability over flexibility**
**China compatibility over global optimization**
**Static over dynamic**
**Proven over cutting-edge**

This is a **pragmatic solution** for a **critical business need**: a website that **definitely works in China** with **definitely working contact forms**.

---

Built with ❤️ for reliable China deployment

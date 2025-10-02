# Claude Code Instructions for China Static Site

**Project:** China Business Hub - China Static Landing Page
**Type:** Static Site Generator
**Purpose:** Firewall-proof landing page for China market with working contact forms

---

## Critical Context

This is a **separate repository/project** from the main China Business Hub Payload CMS site. This is intentionally:

- ✅ **Static** (no database, no runtime)
- ✅ **Simple** (JSON → HTML generator)
- ✅ **China-optimized** (no external dependencies)
- ✅ **Reliable** (minimal failure points)

**This is NOT the main website.** The main Payload CMS website is in `../` (parent directory).

---

## When Working on This Project

### DO:

✅ **Edit JSON files** for content updates:
- `data/content.json` - All site content
- `data/form-config.json` - Form configuration

✅ **Always rebuild after changes:**
```bash
npm run build
```

✅ **Validate before building:**
```bash
npm run validate
```

✅ **Test locally:**
```bash
npm run preview
```

✅ **Document significant changes** in `claude/report/`

✅ **Think "China-first":**
- Will this work behind the Great Firewall?
- Does this add external dependencies? (avoid!)
- Is this testable from China?

### DON'T:

❌ **Never run development server:**
- No `npm run dev` (wrong project)
- No `pnpm dev` (this is static site)
- No `next dev` (not a Next.js app)

❌ **Never add external dependencies:**
- No Google Fonts
- No CDNs (jsDelivr, unpkg, etc.)
- No external APIs at runtime
- No analytics (unless Baidu)

❌ **Never use git for deployment:**
- No `git push` to deploy
- Deployment is manual upload to Alibaba Cloud/Tencent Cloud

❌ **Never create unnecessary files:**
- Content goes in `data/content.json`
- Configuration goes in `data/form-config.json`
- Don't create new config files

❌ **Never make it complex:**
- Keep it simple, static, reliable
- If you need dynamic features, use main site instead

---

## Project Architecture

### Content Flow

```
┌─────────────────────────────────────────────┐
│  1. CONTENT (Editable by non-developers)    │
│     data/content.json                       │
│     data/form-config.json                   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  2. GENERATOR (One-time setup, don't touch) │
│     src/generator.js                        │
│     src/templates/index.html                │
│     src/styles.css                          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  3. OUTPUT (Deploy to China hosting)        │
│     dist/index.html (Portuguese)            │
│     dist/zh/index.html (Chinese)            │
│     dist/en/index.html (English)            │
│     dist/assets/ (CSS, JS)                  │
│     dist/images/ (Media)                    │
└─────────────────────────────────────────────┘
```

### Key Principle: Content as Data

**All content is stored in JSON files.**
- Site text → `content.json`
- Form fields → `form-config.json`
- Images → referenced by path in JSON

**No content in code files.**

---

## File Responsibilities

### Editable (Update These)

**`data/content.json`** - All site content
- Multilingual text (pt-BR, zh-CN, en)
- Contact information
- Service descriptions
- SEO meta tags
- Navigation links

**`data/form-config.json`** - Contact form setup
- Form fields and types
- Validation rules
- Submission endpoint (FormSubmit/Jinshuju/Custom)
- Success/error messages

### Infrastructure (Don't Touch Unless Changing Design)

**`src/generator.js`** - Static site generator
- Reads JSON files
- Replaces template placeholders
- Generates HTML for each language
- Copies assets and images

**`src/templates/index.html`** - HTML template
- Contains placeholders like `{{HERO_TITLE}}`
- Generator replaces with actual content
- One template → 3 language versions

**`src/styles.css`** - Site styles
- Self-contained (no imports)
- No external dependencies
- Mobile responsive
- China-optimized (no web fonts)

**`scripts/validate-content.js`** - Content validator
- Checks JSON syntax
- Validates required fields
- Checks email/phone formats
- Warns about placeholders

---

## Common Tasks & How to Do Them

### Task 1: Update Contact Information

**User request:** "Change email to support@domain.com"

**Steps:**
1. Edit `data/content.json`:
   ```bash
   nano data/content.json
   ```

2. Find `meta.contact.email` and update:
   ```json
   {
     "meta": {
       "contact": {
         "email": "support@domain.com"  // ← Changed
       }
     }
   }
   ```

3. Rebuild:
   ```bash
   npm run build
   ```

4. Verify:
   ```bash
   npm run preview
   # Check contact section has new email
   ```

---

### Task 2: Add New Service

**User request:** "Add 'Quality Inspection' to services"

**Steps:**
1. Edit `data/content.json`:
   ```bash
   nano data/content.json
   ```

2. Find `services.items` array and add:
   ```json
   {
     "services": {
       "items": [
         // ... existing services ...
         {
           "title": {
             "pt": "Inspeção de Qualidade",
             "zh": "质量检验",
             "en": "Quality Inspection"
           },
           "description": {
             "pt": "Verificação completa de qualidade...",
             "zh": "全面质量检查...",
             "en": "Complete quality verification..."
           },
           "icon": "🔍"
         }
       ]
     }
   }
   ```

3. Rebuild:
   ```bash
   npm run build
   ```

4. Preview:
   ```bash
   npm run preview
   ```

---

### Task 3: Change Form Submission Method

**User request:** "Switch from FormSubmit to Jinshuju"

**Steps:**
1. Get Jinshuju form URL from user
   - Example: `https://jinshuju.net/f/ABC123`

2. Edit `data/form-config.json`:
   ```bash
   nano data/form-config.json
   ```

3. Update action:
   ```json
   {
     "submission": {
       "action": "https://jinshuju.net/f/ABC123"  // ← Changed
     }
   }
   ```

4. Rebuild and test:
   ```bash
   npm run build
   npm run preview
   # Submit test form
   ```

---

### Task 4: Update Hero Image

**User request:** "Use new hero banner image"

**Steps:**
1. Ensure image is in `../public/media/`:
   ```bash
   ls -la ../public/media/hero-new.png
   ```

2. Edit `data/content.json`:
   ```json
   {
     "hero": {
       "background_image": "/images/hero-new.png"  // ← Changed
     }
   }
   ```

3. Rebuild (automatically copies images):
   ```bash
   npm run build
   ```

4. Verify:
   ```bash
   npm run preview
   ```

---

### Task 5: Add Form Field

**User request:** "Add 'Company Size' dropdown to form"

**Steps:**
1. Edit `data/form-config.json`:
   ```bash
   nano data/form-config.json
   ```

2. Add to `fields` array:
   ```json
   {
     "fields": [
       // ... existing fields ...
       {
         "name": "company_size",
         "type": "select",
         "label": {
           "pt": "Tamanho da Empresa",
           "zh": "公司规模",
           "en": "Company Size"
         },
         "required": false,
         "options": [
           {
             "value": "1-10",
             "label": { "pt": "1-10 funcionários", "zh": "1-10人", "en": "1-10 employees" }
           },
           {
             "value": "11-50",
             "label": { "pt": "11-50 funcionários", "zh": "11-50人", "en": "11-50 employees" }
           },
           {
             "value": "50+",
             "label": { "pt": "50+ funcionários", "zh": "50+人", "en": "50+ employees" }
           }
         ]
       }
     ]
   }
   ```

3. Rebuild:
   ```bash
   npm run build
   ```

4. Test form:
   ```bash
   npm run preview
   ```

---

### Task 6: Fix Build Error

**Error message:** "Build failed"

**Debugging steps:**

1. **Check JSON syntax:**
   ```bash
   npm run validate
   ```

2. **Common JSON errors:**
   - Missing comma between objects
   - Missing closing brace/bracket
   - Trailing comma in last item
   - Invalid escape characters

3. **Find exact error:**
   ```bash
   node src/generator.js
   # Will show line number and error
   ```

4. **Use JSON validator:**
   ```bash
   # Check content.json
   cat data/content.json | jq .

   # Check form-config.json
   cat data/form-config.json | jq .
   ```

5. **Fix and retry:**
   ```bash
   # Fix the JSON file
   nano data/content.json

   # Validate
   npm run validate

   # Build
   npm run build
   ```

---

## Form Submission Architecture

### How It Works

1. **User fills form** on website
2. **JavaScript validates** (client-side)
3. **Form POSTs** to configured endpoint
4. **Endpoint processes** and sends email
5. **Success message** shown to user

### Three Integration Options

#### Option A: FormSubmit.co (Testing)

**Config:**
```json
{
  "submission": {
    "action": "https://formsubmit.co/your-email@domain.com",
    "method": "POST"
  }
}
```

**Pros:**
- Instant setup (2 minutes)
- Free forever
- Email notifications

**Cons:**
- May be blocked in China
- External dependency
- Basic features only

**When to use:**
- Quick testing before China deployment
- Non-China markets
- Temporary solution

---

#### Option B: Jinshuju 金数据 (Production)

**Config:**
```json
{
  "submission": {
    "action": "https://jinshuju.net/f/YOUR_FORM_ID",
    "method": "POST"
  }
}
```

**Pros:**
- **100% works in China** (Chinese service)
- Free tier (100 submissions/month)
- Professional features
- Auto-reply emails
- Form analytics

**Cons:**
- Chinese interface only
- Requires account setup
- Limited customization on free tier

**When to use:**
- **Production deployment in China** (RECOMMENDED)
- High-volume form submissions
- Need form analytics

**Setup guide:** See `docs/DEPLOYMENT_GUIDE.md` § Form Submission Solutions § Option B

---

#### Option C: Custom Backend (Advanced)

**Config:**
```json
{
  "submission": {
    "action": "https://your-api.com/api/contact",
    "method": "POST"
  }
}
```

**Pros:**
- Full control
- Custom logic
- Integration with CRM
- No third-party limits

**Cons:**
- Requires backend development
- Must handle email sending
- Server maintenance needed

**When to use:**
- Enterprise deployments
- Custom CRM integration
- Special business logic needed

---

## Multi-Language System

### How It Works

**Single source of truth:**
```json
{
  "hero": {
    "title": {
      "pt": "Título em Português",
      "zh": "中文标题",
      "en": "English Title"
    }
  }
}
```

**Generator creates 3 versions:**
- `/index.html` - Uses `pt` values
- `/zh/index.html` - Uses `zh` values
- `/en/index.html` - Uses `en` values

### Language Switcher

**Dropdown in top-right:**
```html
<select onchange="switchLanguage(this.value)">
  <option value="pt">Português</option>
  <option value="zh">中文</option>
  <option value="en">English</option>
</select>
```

**JavaScript navigation:**
```javascript
function switchLanguage(lang) {
  if (lang === 'zh') window.location.href = '/zh/';
  else if (lang === 'en') window.location.href = '/en/';
  else window.location.href = '/';
}
```

### Adding Translation

**When user asks:** "Add Spanish version"

**Response:**
1. **Explain limitation:**
   - Currently supports PT, ZH, EN only
   - Adding language requires code changes
   - Not just JSON edit

2. **If they still want it:**
   - Update `content.json` to add `es` fields
   - Update `form-config.json` to add `es` fields
   - Modify `generator.js` to generate `/es/` folder
   - Update language switcher in template

3. **Recommend:**
   - Keep to 3 languages for simplicity
   - Focus on target markets (China, Brazil, International)

---

## Testing Requirements

### Pre-Deployment Tests

**Always run before deployment:**

```bash
# 1. Validate
npm run validate

# 2. Build
npm run build

# 3. Preview
npm run preview
```

**Manual checks:**
- [ ] All 3 language versions load (/, /zh/, /en/)
- [ ] Images display correctly
- [ ] Form validation works
- [ ] Language switcher works
- [ ] WhatsApp button appears
- [ ] Mobile responsive (test in DevTools)

### Post-Deployment Tests

**CRITICAL - Must test from China:**

```bash
# Methods:
# 1. Ask colleague in China
# 2. Use China VPN
# 3. Use online tool: https://www.webkaka.com/webCheck.aspx
```

**Checklist:**
- [ ] Site loads in <3 seconds from China
- [ ] All images load
- [ ] Form submits successfully
- [ ] Email notification received
- [ ] No console errors
- [ ] Works on Chinese mobile (WeChat browser)

---

## Deployment Process

### Build & Deploy Workflow

```bash
# 1. Make changes
nano data/content.json

# 2. Validate
npm run validate

# 3. Build
npm run build

# 4. Test locally
npm run preview

# 5. Deploy to Alibaba Cloud
cd dist
aliyun oss sync ./ oss://your-bucket/ --recursive

# Or deploy to Tencent Cloud
coscmd upload -r ./ /
```

### Deployment Checklist

**Before deploying:**
- [ ] Changes tested locally
- [ ] No validation errors
- [ ] All languages work
- [ ] Form tested
- [ ] Images load

**After deploying:**
- [ ] Site accessible at URL
- [ ] Test from China
- [ ] Form works from China
- [ ] Email received
- [ ] Performance acceptable (<3s)

---

## Troubleshooting Guide

### Issue: Build Fails

**Symptoms:**
```
❌ Error parsing content.json
```

**Solutions:**
1. Check JSON syntax: `npm run validate`
2. Common errors:
   - Missing comma: `"field": "value" "next": "value"` → add comma
   - Trailing comma: `{"a": 1, "b": 2,}` → remove last comma
   - Unclosed string: `"text: "value"` → add closing quote
3. Use JSON validator: `cat data/content.json | jq .`

---

### Issue: Form Not Working

**Symptoms:**
- Form submits but no email
- Error message on submit
- Form doesn't submit at all

**Solutions:**

1. **Check action URL:**
   ```bash
   grep "action" data/form-config.json
   ```

   Should NOT contain:
   - `your-email@`
   - `YOUR_FORM_ID`
   - Placeholder text

2. **Test endpoint:**
   ```bash
   curl -X POST "ACTION_URL" \
     -d "name=Test&email=test@test.com&message=Test"
   ```

3. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Submit form
   - Look for errors

4. **Verify FormSubmit activation:**
   - First submission sends confirmation email
   - Must click link to activate

5. **Try alternative:**
   - Switch to Jinshuju (always works in China)
   - See `docs/DEPLOYMENT_GUIDE.md` for setup

---

### Issue: Images Not Loading

**Symptoms:**
- Broken image icons
- Images missing on site

**Solutions:**

1. **Check source exists:**
   ```bash
   ls -la ../public/media/
   ```

2. **Verify path in content.json:**
   ```json
   {
     "hero": {
       "background_image": "/images/cbh_hero_banner.png"  // Must start with /images/
     }
   }
   ```

3. **Rebuild (copies images):**
   ```bash
   npm run build
   ```

4. **Check dist folder:**
   ```bash
   ls -la dist/images/
   ```

5. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R
   - Or use incognito mode

---

### Issue: Slow in China

**Symptoms:**
- Load time >5 seconds from China
- Timeout errors

**Solutions:**

1. **Use China hosting:**
   - ✅ Alibaba Cloud OSS
   - ✅ Tencent Cloud COS
   - ❌ NOT Vercel/Netlify

2. **Enable CDN:**
   - Alibaba Cloud CDN
   - Tencent Cloud CDN

3. **Optimize images:**
   ```bash
   # Convert to WebP
   for i in ../public/media/*.png; do
     cwebp "$i" -o "${i%.png}.webp"
   done
   ```

4. **Check from multiple China locations:**
   - Use webkaka.com
   - Test from Beijing, Shanghai, Guangzhou

---

## Code Modification Guidelines

### When to Edit Code Files

**Edit generator/template ONLY if:**
- Changing site structure/layout
- Adding new section type
- Modifying design
- Changing form behavior

**For content/config changes:**
- Always use JSON files
- Never edit generator for content

### Safe Code Changes

**IF you must edit `src/generator.js`:**

1. **Understand the flow:**
   ```javascript
   // 1. Read JSON
   const content = JSON.parse(fs.readFileSync('data/content.json'))

   // 2. Load template
   const template = fs.readFileSync('src/templates/index.html')

   // 3. Replace placeholders
   html = template.replace('{{HERO_TITLE}}', content.hero.title[lang])

   // 4. Write output
   fs.writeFileSync(`dist/${lang}/index.html`, html)
   ```

2. **Test thoroughly:**
   ```bash
   npm run build
   npm run preview
   # Check all 3 languages
   ```

3. **Document changes:**
   ```bash
   nano claude/report/GENERATOR_CHANGES.md
   # Explain what changed and why
   ```

### Unsafe Changes (Avoid)

❌ Adding external dependencies
❌ Making API calls at runtime
❌ Adding database connections
❌ Using Node.js-specific features in browser code
❌ Breaking multi-language support

---

## Integration with Main Site

### Relationship

**Main Site (../)**
- Payload CMS
- Full features
- Dynamic
- International deployment

**This Site (china/)**
- Static HTML
- Core features only
- Static
- China deployment

### Shared Resources

**Images:**
- Automatically copied from `../public/media/`
- Generator copies during build
- No manual copying needed

**Content:**
- Based on main site
- Simplified for China
- Manually synced (not automatic)

**Design:**
- Inspired by main site
- Simplified CSS
- No framework dependencies

### Keep Separate

**Don't:**
- ❌ Mix build processes
- ❌ Share dependencies
- ❌ Deploy together
- ❌ Link databases

**Do:**
- ✅ Keep completely separate
- ✅ Different hosting
- ✅ Different deployment
- ✅ Different audiences

---

## Performance Standards

### Expected Metrics

| Metric | Target | Typical |
|--------|--------|---------|
| First Contentful Paint | <1.5s | 0.8s |
| Time to Interactive | <2.5s | 1.5s |
| Total Page Size | <600KB | 450KB |
| Requests | <20 | 12 |
| Lighthouse Score | >90 | 95+ |

### From China (with CDN)

| City | Expected Load Time |
|------|-------------------|
| Beijing | <1s |
| Shanghai | <1s |
| Guangzhou | <1s |
| Shenzhen | <1s |

### Optimization Rules

1. **No external resources** (all self-hosted)
2. **Minimal JavaScript** (vanilla only)
3. **Single CSS file** (no imports)
4. **Optimized images** (WebP preferred)
5. **No web fonts** (system fonts only)

---

## Security Best Practices

### What's Already Secure

✅ No backend (can't be hacked)
✅ No database (no SQL injection)
✅ No user auth (no session hijacking)
✅ Static files (limited attack surface)
✅ HTTPS by default (hosting provides)

### Spam Protection

**Implemented:**
- Honeypot field (hidden `_gotcha`)
- Client-side validation
- FormSubmit/Jinshuju have spam filters

**If spam becomes issue:**
1. Enable reCAPTCHA (requires account)
2. Add time-based tokens
3. Use Jinshuju (better spam protection)

### Sensitive Data

**What to protect:**
- Hosting credentials (Alibaba/Tencent keys)
- Form submission endpoints
- Email addresses (public but monitor)

**What's public:**
- All content in JSON files
- Generated HTML
- Images and assets

---

## Maintenance Schedule

### Weekly Tasks
- [ ] Check email for form submissions
- [ ] Respond to leads within 24h
- [ ] Monitor form spam

### Monthly Tasks
- [ ] Test site from China
- [ ] Check load times (webkaka.com)
- [ ] Review form analytics (if using Jinshuju)
- [ ] Update content if needed

### Quarterly Tasks
- [ ] Review hosting costs
- [ ] Optimize images if site is slow
- [ ] Update dependencies: `npm outdated`
- [ ] Test all form submission methods

### Yearly Tasks
- [ ] Review ICP license status
- [ ] Renew domain (if applicable)
- [ ] Audit content accuracy
- [ ] Consider design refresh

---

## Quick Reference Commands

```bash
# Development
npm install              # Install dependencies (first time)
npm run build           # Build static site
npm run preview         # Preview locally
npm run dev             # Build + preview
npm run validate        # Validate JSON files

# Deployment (Alibaba Cloud)
cd dist
aliyun oss sync ./ oss://your-bucket/ --recursive

# Deployment (Tencent Cloud)
cd dist
coscmd upload -r ./ /

# Troubleshooting
npm run validate                    # Check JSON syntax
cat data/content.json | jq .       # Validate JSON
grep "action" data/form-config.json # Check form endpoint
ls -la dist/images/                # Verify images copied
```

---

## Final Checklist for Claude Code

Before considering any task complete:

- [ ] Validated JSON: `npm run validate`
- [ ] Built successfully: `npm run build`
- [ ] Tested locally: `npm run preview`
- [ ] All 3 languages work (/, /zh/, /en/)
- [ ] Images load correctly
- [ ] Form validation works
- [ ] Mobile responsive tested
- [ ] No console errors
- [ ] **Reminded user to test from China**
- [ ] Documented changes if significant

---

## Remember

1. **Keep it simple** - Complexity is the enemy of reliability
2. **China first** - Every decision should consider Great Firewall
3. **Static forever** - No runtime dependencies, ever
4. **Test from China** - Non-negotiable for deployment
5. **Document everything** - Future you (or another AI) will thank you

---

**This project is intentionally minimal. Resist the urge to add features. The goal is reliability, not features.**

**Built for:** China deployment reliability
**Optimized for:** Form submission success
**Designed for:** Non-technical content updates
**Tested for:** Great Firewall compatibility

---

Last updated: 2025-10-02
Version: 1.0.0

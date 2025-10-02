# Cloudflare Pages Setup Guide

## ⚠️ RECOMMENDED: Use Cloudflare Workers Instead

**Best option:** Set up a Cloudflare Worker for form handling - no Chinese phone number needed, excellent China performance, and it's free.

**📘 See complete guide:** `claude/report/CLOUDFLARE_WORKER_SETUP.md` (15-30 minute setup)

**Why Workers > FormSubmit:**
- ✅ Guaranteed to work in China
- ✅ Free email via MailChannels
- ✅ Full control over logic
- ❌ FormSubmit may be blocked in China

---

## Alternative: Using FormSubmit (Quick Testing Only)

### Option 1: Using Environment Variables (Recommended)

**Step 1: Go to Cloudflare Dashboard**
```
1. Log in to Cloudflare
2. Go to Workers & Pages
3. Select your "chinabhcn" project
4. Click "Settings" tab
5. Scroll to "Environment variables"
```

**Step 2: Add Environment Variables**

Click "Add variable" and add these two:

**Variable 1:**
```
Name: DEFAULT_RECEPTION_EMAIL
Value: contato@chinabusinesshub.com
Environment: Production
```

**Variable 2:**
```
Name: FORM_SERVICE_TYPE
Value: formsubmit
Environment: Production
```

**Step 3: Trigger Rebuild**
```
1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Retry deployment"
```

**Done!** Form will now send to your email address.

---

### Option 2: Update JSON File Directly

If you prefer not to use environment variables:

**Step 1: Edit form-config.json**
```bash
# On your local machine
nano data/form-config.json

# Change line 7:
"action": "https://formsubmit.co/contato@chinabusinesshub.com"

# Save file
```

**Step 2: Commit and Push**
```bash
git add data/form-config.json
git commit -m "Configure form email address"
git push
```

**Done!** Cloudflare will auto-deploy.

---

## Testing Your Form

**After deployment:**

1. Visit your deployed site
2. Fill out the contact form
3. Submit it
4. Check your email for:
   - FormSubmit confirmation email (first time only)
   - Click the activation link
5. Submit form again
6. Should receive the actual form submission

**Test from China (CRITICAL):**
- Use China VPN
- Or ask someone in China to test
- FormSubmit may be blocked
- If blocked → Use Jinshuju instead (see FORM_SUBMISSION_02102025.md)

---

## Build Settings

**Already configured in Cloudflare Pages:**

Build command: `npm run build`
Build output directory: `dist`
Node version: 18 or 20

These should already be set from your initial setup.

---

## Other Options

### Cloudflare Workers (BEST - No CN Phone Required)

**See:** `claude/report/CLOUDFLARE_WORKER_SETUP.md` for complete setup guide

**Quick summary:**
1. Create Worker in Cloudflare Dashboard
2. Paste provided code (uses MailChannels for email)
3. Get Worker URL
4. Update Pages environment variable to Worker URL
5. Works perfectly in China, completely free

### Jinshuju (Requires Chinese Phone)

**Why?** FormSubmit may be blocked in China. Jinshuju is guaranteed to work.

**Limitation:** Requires Chinese phone number for registration

**See detailed guide:** `claude/report/FORM_SUBMISSION_02102025.md`

**Quick steps:**
1. Create account at https://jinshuju.net (needs CN phone)
2. Build form with your fields
3. Get form URL: `https://jinshuju.net/f/abc123`
4. Update environment variable:
   ```
   DEFAULT_RECEPTION_EMAIL=https://jinshuju.net/f/abc123
   FORM_SERVICE_TYPE=custom
   ```
5. Retry deployment

---

## Troubleshooting

**Form not working?**
- Check environment variables are saved
- Verify you triggered a new deployment
- Check browser console for errors (F12)
- Test the email service directly

**Email not received?**
- Check spam folder
- FormSubmit: Check activation email first time
- Verify email address is correct in settings

**Still having issues?**
- See comprehensive guide: `claude/report/FORM_SUBMISSION_02102025.md`
- Test with Jinshuju for guaranteed China compatibility

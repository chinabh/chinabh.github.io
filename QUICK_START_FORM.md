# Form Setup - Quick Start Guide
**Time required:** 15-30 minutes
**Difficulty:** Medium (copy-paste code provided)
**Cost:** FREE

---

## Why You Need This

Your Chinese vendors **MUST** be able to contact you via the form. Jinshuju requires a Chinese phone number (which you don't have). **Cloudflare Workers is the best solution** for your situation.

---

## What You'll Do

1. Create a Cloudflare Worker (5 min)
2. Copy-paste the code I provide (2 min)
3. Configure email address (2 min)
4. Connect to your website (5 min)
5. Test it works (5 min)

**Total: 20 minutes**

---

## Step-by-Step (Simplified)

### 1. Create Worker

```
Dashboard → Workers & Pages → Create → Create Worker
Name: china-contact-form
Click "Deploy"
```

### 2. Add Code

```
Click "Edit code"
Delete everything
Paste code from: claude/report/CLOUDFLARE_WORKER_SETUP.md
(It's the big JavaScript code block starting with "export default")
Click "Save and Deploy"
```

### 3. Set Your Email

```
Still in Worker page → Click "Settings" tab
Scroll to "Variables and Secrets"
Click "Add variable"
   Name: RECIPIENT_EMAIL
   Value: contato@chinabusinesshub.com
Click "Save"
Go back and click "Deploy" again
```

### 4. Get Worker URL

```
Copy the URL shown (looks like):
https://china-contact-form.YOUR-ACCOUNT.workers.dev
```

### 5. Connect to Website

```
Dashboard → Workers & Pages → chinabhcn (your Pages project)
Settings → Environment Variables
Add variable:
   Name: DEFAULT_RECEPTION_EMAIL
   Value: (paste the Worker URL from step 4)
Add another variable:
   Name: FORM_SERVICE_TYPE
   Value: custom
Click "Save"

Go to Deployments → Click "..." on latest → "Retry deployment"
```

### 6. Test

```
Wait 2-3 minutes for deployment
Visit your site
Fill out form
Submit
Check your email inbox
```

**Done!** ✅

---

## If You Get Stuck

**Detailed guide with screenshots and troubleshooting:**
- See: `claude/report/CLOUDFLARE_WORKER_SETUP.md`

**The complete Worker code is there** - just copy and paste it exactly.

---

## What You Get

- ✅ Form submissions sent to your email
- ✅ Works perfectly in China
- ✅ Free (Cloudflare + MailChannels)
- ✅ Spam protection included
- ✅ Professional email formatting
- ✅ Reply-to automatically set to submitter

---

## Quick Test Command

After setup, test with:

```bash
curl -X POST https://china-contact-form.YOUR-ACCOUNT.workers.dev \
  -d "name=Test User" \
  -d "email=test@test.com" \
  -d "message=Testing form" \
  -d "language=en"
```

Should receive email within seconds.

---

## Troubleshooting

**No email received?**
1. Check spam folder
2. Verify RECIPIENT_EMAIL is set in Worker settings
3. Check Worker logs (Worker → Logs → Begin log stream)

**Form doesn't submit?**
1. Check browser console (F12)
2. Verify Worker URL is correct in Pages environment variables
3. Check you triggered new deployment

**Still stuck?**
- Read full guide: `claude/report/CLOUDFLARE_WORKER_SETUP.md`
- Check Worker logs for errors
- Test Worker directly with curl command above

---

## Alternative: FormSubmit (Not Recommended)

If you want super quick (but risky for China):

```
Pages → Environment Variables
DEFAULT_RECEPTION_EMAIL=contato@chinabusinesshub.com
FORM_SERVICE_TYPE=formsubmit

Redeploy
```

**Warning:** May be blocked in China. Use Workers instead.

---

## Your Action Items

**Right now:**
- [ ] Follow steps 1-6 above
- [ ] Should take 20 minutes
- [ ] Test form works
- [ ] Check email arrives

**Before announcing site:**
- [ ] Test from China (VPN or colleague)
- [ ] Verify Chinese characters work
- [ ] Complete full testing checklist in CLOUDFLARE_WORKER_SETUP.md

---

**Bottom line:** Cloudflare Workers is your best option. The setup guide has all the code ready to copy-paste. Takes 20 minutes, works great in China, completely free.

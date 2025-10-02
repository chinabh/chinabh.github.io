# 🚀 Quick Start - Get Your China Site Live in 10 Minutes

## Step 1: Update Your Contact Info (2 min)

```bash
cd china/
nano data/content.json
```

**Update these fields:**
```json
{
  "meta": {
    "contact": {
      "email": "your-real-email@chinabusinesshub.com",  ← CHANGE THIS
      "whatsapp": "+5511987654321",                     ← CHANGE THIS
      "wechat": "YourWeChatID"                          ← CHANGE THIS
    }
  }
}
```

Save and close (Ctrl+X, Y, Enter)

---

## Step 2: Configure Form Submission (3 min)

```bash
nano data/form-config.json
```

**Option A - Quick Test (FormSubmit):**
```json
{
  "submission": {
    "action": "https://formsubmit.co/your-email@chinabusinesshub.com"  ← CHANGE THIS
  }
}
```

**Option B - Production (Jinshuju - Recommended):**
1. Go to https://jinshuju.net
2. Create account (use WeChat login)
3. Click "新建表单" (New Form)
4. Add basic fields
5. Click "发布" (Publish)
6. Copy form URL
7. Paste here:
```json
{
  "submission": {
    "action": "https://jinshuju.net/f/YOUR_FORM_ID"  ← PASTE HERE
  }
}
```

Save and close

---

## Step 3: Build Your Site (1 min)

```bash
npm install    # Only needed first time
npm run build
```

You should see:
```
✅ Generated: pt/index.html
✅ Generated: zh/index.html
✅ Generated: en/index.html
✅ Copied styles.css
✨ Build completed successfully!
```

---

## Step 4: Test Locally (1 min)

```bash
npm run preview
```

Browser opens at http://localhost:8080

**Test checklist:**
- [ ] Homepage loads
- [ ] Images show
- [ ] Form appears
- [ ] Language switcher works (/, /zh/, /en/)
- [ ] WhatsApp button shows
- [ ] Submit test form

If all good, **you're ready to deploy!**

---

## Step 5: Deploy to China (3 min)

### Option A: Alibaba Cloud (Recommended)

```bash
# Install CLI (first time only)
npm install -g @alicloud/cli

# Configure (first time only)
aliyun configure
# Enter your AccessKey ID
# Enter your AccessKey Secret

# Deploy
cd dist
aliyun oss sync ./ oss://your-bucket-name/ --recursive
```

**Your site is now live!**
URL: `http://your-bucket-name.oss-cn-beijing.aliyuncs.com`

### Option B: Tencent Cloud

```bash
# Install (first time only)
pip install coscmd

# Configure (first time only)
coscmd config -a YOUR_ID -s YOUR_KEY -b your-bucket -r ap-guangzhou

# Deploy
cd dist
coscmd upload -r ./ /
```

### Option C: FTP Upload (Any Host)

1. Open FileZilla (or any FTP client)
2. Connect to your hosting
3. Upload entire `/dist` folder to `public_html`
4. Done!

---

## Test From China

**Critical:** You MUST test from China before announcing

### Method 1: Ask a Friend in China
Send them your URL and ask:
- Does it load fast? (should be <2 seconds)
- Do images load?
- Does form submit work?

### Method 2: Use China VPN
- Connect to China server
- Test your site
- Submit form

### Method 3: China Testing Services
- https://www.webkaka.com/webCheck.aspx
- Paste your URL
- Check loading speed from multiple China regions

---

## Troubleshooting

**Form not working?**
```bash
# Check if placeholder still there
grep "your-email@" data/form-config.json
```
If it shows text, you didn't update form-config.json!

**Images not loading?**
```bash
npm run build    # Rebuild
```

**Site slow?**
- Use Alibaba/Tencent Cloud (not Vercel/Netlify)
- Enable CDN in cloud console

---

## Next Steps

✅ **Immediate:**
1. Test form submission (send yourself a test)
2. Share URL with team
3. Test from China

✅ **This Week:**
1. Set up custom domain (optional)
2. Enable CDN (recommended)
3. Set up Baidu Analytics

✅ **Ongoing:**
- Monitor form submissions daily
- Update content monthly
- Test site quarterly

---

## Update Content Later

```bash
cd china/
nano data/content.json    # Edit content
npm run build             # Rebuild
cd dist

# Re-deploy (choose one):
aliyun oss sync ./ oss://your-bucket/ --recursive  # Alibaba
coscmd upload -r ./ /                               # Tencent
# OR upload via FTP
```

---

## Get Help

**Documentation:**
- Full guide: `docs/DEPLOYMENT_GUIDE.md`
- README: `README.md`

**Common Issues:**
1. Form not working → Check form-config.json action URL
2. Images missing → Run `npm run build` again
3. Slow in China → Use Alibaba/Tencent hosting

**Contact:**
- Email: contato@chinabusinesshub.com
- WeChat: ChinaBizHub

---

## Success Checklist

Before going live:
- [ ] Updated contact info in content.json
- [ ] Configured form in form-config.json
- [ ] Built successfully (`npm run build`)
- [ ] Tested locally (`npm run preview`)
- [ ] Deployed to China hosting
- [ ] Tested form submission
- [ ] Tested from China (or asked someone to)
- [ ] Form notification email received
- [ ] Site loads in <3 seconds from China

**All checked? Congratulations! Your China site is live! 🎉**

Share the URL:
- Portuguese: `https://your-site.com/`
- Chinese: `https://your-site.com/zh/`
- English: `https://your-site.com/en/`

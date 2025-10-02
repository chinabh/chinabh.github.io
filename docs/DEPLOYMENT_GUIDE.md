# China Deployment Guide

## Quick Start (5 minutes)

### 1. Configure Your Content
```bash
cd china/
nano data/content.json  # Update email, phone, WeChat ID
```

### 2. Configure Form Submission
```bash
nano data/form-config.json
```

**Option A: FormSubmit.co (Easiest)**
```json
{
  "submission": {
    "action": "https://formsubmit.co/your-email@chinabusinesshub.com"
  }
}
```
First submission will send confirmation email. Click to activate.

**Option B: Jinshuju (Recommended for China)**
1. Create account: https://jinshuju.net
2. Create form
3. Get form URL
4. Update action field

### 3. Build & Test
```bash
npm install
npm run build     # Generates /dist folder
npm run preview   # Test locally at http://localhost:8080
```

### 4. Deploy to China

Choose one hosting method below.

---

## Hosting Options for China

### Option 1: Alibaba Cloud OSS (Recommended)

**Pros:** Best performance in China, CDN included, ¥50-100/month

**Setup:**

1. **Create Alibaba Cloud Account**
   - Visit: https://www.alibabacloud.com
   - Requires Chinese ID or business license for ICP

2. **Create OSS Bucket**
   ```bash
   # Install Alibaba CLI
   npm install -g @alicloud/cli

   # Configure
   aliyun configure

   # Create bucket
   aliyun oss mb oss://your-bucket-name --acl public-read

   # Upload files
   cd dist
   aliyun oss sync ./ oss://your-bucket-name/ --recursive
   ```

3. **Enable Static Website**
   - OSS Console → Your Bucket → Basic Settings → Static Pages
   - Index Page: `index.html`
   - Error Page: `index.html`

4. **Enable CDN (Optional but Recommended)**
   - Alibaba Cloud Console → CDN
   - Add domain
   - Point to your OSS bucket URL
   - Configure HTTPS (recommended)

5. **Custom Domain**
   - Add CNAME record: `your-domain.com → your-bucket.oss-cn-beijing.aliyuncs.com`
   - Or use CDN domain

**Cost:** ~¥50-100/month for small traffic

---

### Option 2: Tencent Cloud COS

**Pros:** Similar to Alibaba, good China performance

**Setup:**

1. **Create Account:** https://cloud.tencent.com

2. **Install COSCMD**
   ```bash
   pip install coscmd

   # Configure
   coscmd config -a YOUR_SECRET_ID -s YOUR_SECRET_KEY -b your-bucket-name -r ap-guangzhou
   ```

3. **Upload**
   ```bash
   cd dist
   coscmd upload -r ./ /
   ```

4. **Enable Static Website**
   - COS Console → Bucket → Basic Config → Static Website
   - Index: `index.html`

**Cost:** ~¥40-80/month

---

### Option 3: Vercel (for testing only)

**⚠️ Warning:** May be slow/blocked in China

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd dist
vercel --prod
```

**Use only for testing before China deployment.**

---

### Option 4: Traditional Web Hosting

**Good for:** Simple setup, familiar cPanel interface

**Compatible Hosts:**
- Any shared hosting with FTP access
- Upload `/dist` folder contents to `public_html`

**Steps:**
1. Connect via FTP (FileZilla, etc.)
2. Upload all files from `dist/` to server root
3. Done!

---

## Form Submission Solutions

### Option A: FormSubmit.co

**Setup (2 minutes):**
1. Update form action: `https://formsubmit.co/your-email@domain.com`
2. Submit test form
3. Check email and click confirmation link
4. Done!

**Pros:**
- Instant setup
- Free
- Email notifications

**Cons:**
- May be blocked in China (test first!)
- External dependency

**Testing in China:**
```bash
# Have someone in China test:
curl -X POST https://formsubmit.co/your-email@domain.com \
  -d "name=Test&email=test@test.com&message=Test from China"
```

---

### Option B: Jinshuju (金数据) - RECOMMENDED FOR CHINA

**Setup (10 minutes):**

1. **Create Account:** https://jinshuju.net (Chinese interface)

2. **Create Form:**
   - Click "新建表单" (New Form)
   - Add fields matching your form-config.json:
     - Name (姓名)
     - Email (邮箱)
     - Phone (电话)
     - Company (公司)
     - Message (留言)

3. **Get Form URL:**
   - Click "发布" (Publish)
   - Copy form URL
   - Example: `https://jinshuju.net/f/ABC123`

4. **Update form-config.json:**
   ```json
   {
     "submission": {
       "action": "https://jinshuju.net/f/ABC123",
       "method": "POST"
     }
   }
   ```

5. **Rebuild:**
   ```bash
   npm run build
   ```

**Pros:**
- 100% reliable in China
- Free tier available
- Chinese customer support
- Auto-response emails
- Form analytics

**Cons:**
- Chinese interface only
- May need phone verification

---

### Option C: Alibaba Cloud Function (Advanced)

**For developers who want full control:**

1. **Create Function:**
   ```bash
   # Install Fun CLI
   npm install -g @alicloud/fun

   # Create function
   fun init
   ```

2. **Function Code (Node.js):**
   ```javascript
   const nodemailer = require('nodemailer');

   exports.handler = async (event, context) => {
       const data = JSON.parse(event.body);

       // Send email via Alibaba DirectMail or SMTP
       const transporter = nodemailer.createTransport({
           host: 'smtpdm.aliyun.com',
           port: 465,
           secure: true,
           auth: {
               user: process.env.EMAIL_USER,
               pass: process.env.EMAIL_PASS
           }
       });

       await transporter.sendMail({
           from: 'noreply@your-domain.com',
           to: 'leads@your-domain.com',
           subject: 'New Lead from China Site',
           html: `
               <h2>New Contact Form Submission</h2>
               <p><strong>Name:</strong> ${data.name}</p>
               <p><strong>Email:</strong> ${data.email}</p>
               <p><strong>Message:</strong> ${data.message}</p>
           `
       });

       return {
           statusCode: 200,
           body: JSON.stringify({ success: true })
       };
   };
   ```

3. **Deploy:**
   ```bash
   fun deploy
   ```

4. **Update form-config.json** with function URL

**Cost:** Pay-per-invocation (usually <¥10/month)

---

## Testing Checklist

### Before Deployment

- [ ] Content.json has correct contact info
- [ ] Form action URL is configured (not placeholder)
- [ ] All images exist in public/media/
- [ ] Build completes without errors
- [ ] Local preview works (npm run preview)
- [ ] Validation passes (npm run validate)

### After Deployment

- [ ] **Test from China** (critical!)
  - Use Chinese VPN or ask colleague
  - Test all 3 language versions (/, /zh/, /en/)
  - Test form submission
  - Check email receipt

- [ ] All images load
- [ ] Navigation works
- [ ] Form validation works
- [ ] Success message appears
- [ ] Mobile responsive
- [ ] WhatsApp button works
- [ ] Language switcher works

---

## Troubleshooting

### Form Not Working

**Check 1: Form action URL**
```bash
grep "action" data/form-config.json
# Should NOT contain "your-email@" or "YOUR_FORM_ID"
```

**Check 2: Test form endpoint**
```bash
curl -X POST "YOUR_FORM_ACTION_URL" \
  -d "name=Test&email=test@test.com&message=Test"
```

**Check 3: Browser console**
- Open Developer Tools (F12)
- Go to Console tab
- Submit form
- Look for errors

### Site Slow in China

**Solution 1: Use China CDN**
- Alibaba Cloud CDN
- Tencent Cloud CDN

**Solution 2: Optimize images**
```bash
# Install image optimizer
npm install -g sharp-cli

# Optimize all images
cd ../public/media
sharp -i "*.{jpg,png}" -o optimized/ -f webp -q 80
```

**Solution 3: Enable gzip**
- Most China hosts enable automatically
- Check with: `curl -H "Accept-Encoding: gzip" -I https://your-site.com`

### Images Not Loading

**Check 1: File paths**
```bash
# Images should be at:
dist/images/cbh_hero_banner.png
dist/images/mainlogo.png
```

**Check 2: Rebuild**
```bash
npm run build
```

**Check 3: Check image references in content.json**
```json
{
  "hero": {
    "background_image": "/images/cbh_hero_banner.png"
  }
}
```

---

## ICP License (China-specific)

**What is ICP?**
Internet Content Provider license - required for websites hosted in China with custom domain.

**Do I need it?**
- ✅ YES: If using custom domain in China
- ❌ NO: If using CDN-provided subdomain

**How to get it:**
1. Register through hosting provider (Alibaba/Tencent)
2. Provide business documents
3. Wait 6-8 weeks for approval
4. Cost: ¥0 (but requires business license)

**Temporary solution:**
- Use hosting-provided subdomain: `your-bucket.oss-cn-beijing.aliyuncs.com`
- Or use `.cn` domain (faster ICP process)

---

## Performance Optimization

### 1. Image Optimization
```bash
# Use WebP format
cd ../public/media
for i in *.png; do cwebp "$i" -o "${i%.png}.webp"; done

# Update content.json to use .webp files
```

### 2. Enable Browser Caching

Add to Alibaba OSS Bucket settings:
```
Cache-Control: public, max-age=31536000
```

### 3. Minify HTML/CSS (Optional)

```bash
npm install -g html-minifier clean-css-cli

# Minify
html-minifier --collapse-whitespace dist/index.html -o dist/index.html
cleancss -o dist/assets/styles.css dist/assets/styles.css
```

---

## Monitoring & Analytics

### China-Friendly Options

**Baidu Analytics:**
```html
<!-- Add to template before </head> -->
<script>
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?YOUR_SITE_ID";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();
</script>
```

**Umami (Self-hosted):**
- Deploy on Alibaba Cloud
- Privacy-friendly
- Works in China

---

## Support

**Issues?**
1. Check troubleshooting section above
2. Run `npm run validate` for config errors
3. Test form URL with curl
4. Check browser console for JS errors

**Need help with China hosting?**
- Alibaba Cloud support (English available)
- Tencent Cloud documentation
- WeChat developer groups

---

## Next Steps After Deployment

1. **Monitor form submissions:** Check email regularly
2. **Track analytics:** Set up Baidu Analytics
3. **Test from China:** Monthly tests to ensure no blocking
4. **Update content:** Edit content.json, rebuild, re-deploy
5. **Backup:** Keep copy of dist/ folder
6. **SEO:** Submit to Baidu Webmaster Tools

---

## Quick Reference

```bash
# Build site
npm run build

# Test locally
npm run preview

# Validate config
npm run validate

# Deploy to Alibaba
aliyun oss sync ./dist oss://your-bucket/ --recursive

# Deploy to Tencent
coscmd upload -r ./dist /
```

**Support Email:** contato@chinabusinesshub.com
**WeChat:** ChinaBizHub

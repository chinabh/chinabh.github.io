# 🔒 Password Protection - Pre-Launch Instructions

## What This Does

Your site is now password-protected! Visitors will see a login prompt before accessing the site.

## Login Credentials

**Username:** `preview`
**Password:** `chinabh2025`

⚠️ **Share these credentials only with your team for testing!**

---

## How It Works

Two files have been added to your `dist/` folder:

1. **`.htaccess`** - Tells the server to require authentication
2. **`.htpasswd`** - Contains the encrypted password

When you deploy `dist/` to your hosting, these files will protect your site.

---

## Deployment Instructions

### If Using Alibaba Cloud OSS:

```bash
cd dist
aliyun oss sync ./ oss://your-bucket/ --recursive --include ".htaccess" --include ".htpasswd"
```

**Important:** OSS doesn't support `.htaccess` by default. You need to:

1. **Option A:** Use Alibaba Cloud CDN with "Access Control" → "URL Authentication"
2. **Option B:** Use Alibaba Cloud WAF (Web Application Firewall) with IP whitelist
3. **Option C:** Switch to ECS (Elastic Compute Service) with Apache/Nginx

### If Using Tencent Cloud COS:

Similar to OSS - object storage doesn't support `.htaccess`.

**Recommendation:** Use "Bucket Access Permissions" → "Private Read/Write" + temporary access links.

### If Using Traditional Hosting (Shared/VPS with Apache):

Simply upload the `dist/` folder as usual. The `.htaccess` file will work automatically.

```bash
# Upload via FTP/SFTP
# Or use rsync:
rsync -avz dist/ user@your-server.com:/var/www/html/
```

---

## Testing Locally

```bash
npm run preview
```

**Note:** The local preview server (`http-server`) doesn't support `.htaccess`.
To test password protection locally, you need Apache or Nginx.

---

## 🚀 Launch Day - Remove Password Protection

When you're ready to launch publicly:

### Method 1: Delete the files
```bash
cd dist
rm .htaccess .htpasswd
# Re-deploy
aliyun oss sync ./ oss://your-bucket/ --recursive
```

### Method 2: Rebuild without password files
```bash
npm run build
# The new build won't include password files
# Deploy the fresh dist/ folder
```

---

## Change Password

To change the password, run:

```bash
echo "preview:$(openssl passwd -apr1 YOUR_NEW_PASSWORD)" > dist/.htpasswd
```

Replace `YOUR_NEW_PASSWORD` with your desired password.

---

## Alternative: If .htaccess Doesn't Work on Your Hosting

**Option 1: Use hosting-specific access control**
- Alibaba OSS: Use "Referer Whitelist" or "IP Whitelist"
- Tencent COS: Use "Bucket ACL" → Private
- Both: Set bucket to private, use signed URLs for team access

**Option 2: Simple JavaScript redirect**
I can create a simple password prompt page that redirects to the real site.
(Less secure, but works anywhere)

**Option 3: IP Whitelist**
Configure your hosting to only allow your team's IP addresses.

---

## Need Help?

If `.htaccess` doesn't work on your China hosting (common with OSS/COS), let me know and I'll implement an alternative solution!

---

**Current Status:** ✅ Password protection files created
**Next Step:** Deploy `dist/` folder to your hosting with password files included

#!/bin/bash
# Quick curl test for Cloudflare Worker form submission

WORKER_URL="https://china-contact-form.dfnaiff.workers.dev"

echo "🧪 Testing form submission with curl..."
echo "────────────────────────────────────────"

curl -v -X POST "$WORKER_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Origin: https://chinabusinesshub.com" \
  --data-urlencode "company_name_chinese=测试公司" \
  --data-urlencode "company_name_english=Test Company Ltd" \
  --data-urlencode "segment=Electronics" \
  --data-urlencode "year_established=2015" \
  --data-urlencode "phone=+86 138 0000 0000" \
  --data-urlencode "email=test@testcompany.com" \
  --data-urlencode "website_social=www.test.com" \
  --data-urlencode "exports_to_brazil=yes" \
  --data-urlencode "main_products_brazil=Test products" \
  --data-urlencode "challenges_brazil=Test challenges" \
  --data-urlencode "support_needed=We need help with distribution in Brazil" \
  --data-urlencode "language=en" \
  --data-urlencode "_subject=Test from curl" \
  --data-urlencode "_page_url=https://test.com" \
  --data-urlencode "_user_agent=curl" \
  --data-urlencode "_gotcha=" \
  2>&1 | grep -E "(HTTP|Location:|error)"

echo ""
echo "────────────────────────────────────────"
echo "Check the Location header for the result:"
echo "  - ?submitted=true = Success"
echo "  - ?error=missing_fields = Missing required fields"
echo "  - ?error=invalid_email = Invalid email"
echo "  - ?error=send_failed = Resend API failed"
echo "  - ?error=spam = Spam detected"
echo ""

#!/bin/bash
# Quick setup script for China static site

echo "🇨🇳 China Business Hub - Static Site Setup"
echo "==========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js first: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if we're in the china directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the china/ directory"
    echo "   cd china && ./setup.sh"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Validate content files
echo "🔍 Validating content files..."
node scripts/validate-content.js

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Please update the configuration files first:"
    echo "   1. Edit data/content.json (update email, phone, WeChat)"
    echo "   2. Edit data/form-config.json (update form action URL)"
    echo ""
    echo "Then run this script again: ./setup.sh"
    exit 1
fi

echo ""

# Build the site
echo "🏗️  Building static site..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📁 Your static site is in: dist/"
echo ""
echo "Next steps:"
echo "  1. Preview locally:  npm run preview"
echo "  2. Deploy to China:  See docs/DEPLOYMENT_GUIDE.md"
echo ""
echo "Quick references:"
echo "  - QUICKSTART.md          (10-minute guide)"
echo "  - README.md              (overview)"
echo "  - docs/DEPLOYMENT_GUIDE.md (detailed guide)"
echo ""

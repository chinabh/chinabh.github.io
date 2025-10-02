#!/usr/bin/env node
/**
 * STATIC SITE GENERATOR FOR CHINA BUSINESS HUB
 *
 * Reads content.json and form-config.json
 * Generates static HTML files for PT, ZH, EN
 * Copies assets and images
 *
 * Usage: node src/generator.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, '..', 'public');

// ============================================
// UTILITY FUNCTIONS
// ============================================

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) {
        console.warn(`⚠️  Source not found: ${src}`);
        return;
    }

    const stats = fs.statSync(src);

    if (stats.isDirectory()) {
        ensureDir(dest);
        const entries = fs.readdirSync(src);

        for (const entry of entries) {
            copyRecursive(
                path.join(src, entry),
                path.join(dest, entry)
            );
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

// ============================================
// LOAD DATA
// ============================================

console.log('📖 Loading content and configuration...');

const content = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'content.json'), 'utf-8')
);

const formConfig = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'form-config.json'), 'utf-8')
);

const template = fs.readFileSync(
    path.join(SRC_DIR, 'templates', 'index.html'),
    'utf-8'
);

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

// Override form action with environment variable if set
if (process.env.DEFAULT_RECEPTION_EMAIL) {
    const formServiceType = process.env.FORM_SERVICE_TYPE || 'formsubmit';

    if (formServiceType === 'formsubmit') {
        formConfig.submission.action = `https://formsubmit.co/${process.env.DEFAULT_RECEPTION_EMAIL}`;
    } else if (formServiceType === 'custom') {
        formConfig.submission.action = process.env.DEFAULT_RECEPTION_EMAIL;
    }

    console.log(`📧 Using form email from environment: ${formConfig.submission.action}`);
}

console.log('✅ Data loaded successfully');

// ============================================
// HELPER FUNCTIONS FOR CONTENT GENERATION
// ============================================

function getText(obj, lang) {
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object' && obj[lang]) return obj[lang];
    return obj?.en || obj?.zh || '';
}

function generateLanguageOptions(currentLang) {
    return content.languages.available
        .map(lang => {
            const selected = lang === currentLang ? 'selected' : '';
            return `<option value="${lang}" ${selected}>${content.languages.names[lang]}</option>`;
        })
        .join('\n            ');
}

function generateTrustBadges(lang) {
    return content.hero.trust_badges
        .map(badge => `
            <div class="trust-badge">
                <span>${badge.icon}</span>
                <span>${getText(badge.text, lang)}</span>
            </div>
        `)
        .join('');
}

function generateCantonBanner(lang) {
    if (!content.hero.show_canton_banner) return '';

    return `
        <div class="canton-banner">
            ${getText(content.hero.canton_banner_text, lang)}
        </div>
    `;
}

function generateGuanxiSection(lang) {
    if (!content.about.guanxi?.enabled) return '';

    return `
        <div class="guanxi-section">
            <h3>${getText(content.about.guanxi.title, lang)}</h3>
            <p>${getText(content.about.guanxi.content, lang)}</p>
        </div>
    `;
}

function generateServicesItems(lang) {
    return content.services.items
        .map(service => `
            <div class="service-card">
                <div class="service-icon">${service.icon}</div>
                <h3>${getText(service.title, lang)}</h3>
                <p>${getText(service.description, lang)}</p>
            </div>
        `)
        .join('\n            ');
}

function generateProcessSteps(lang) {
    return content.process.steps
        .map(step => `
            <div class="process-step">
                <div class="step-number">${step.number}</div>
                <h3>${getText(step.title, lang)}</h3>
                <p>${getText(step.description, lang)}</p>
            </div>
        `)
        .join('\n            ');
}

function generateFormFields(lang) {
    return formConfig.fields
        .filter(field => field.type !== 'hidden')
        .map(field => {
            const label = getText(field.label, lang);
            const placeholder = getText(field.placeholder, lang);
            const required = field.required ? 'required' : '';
            const requiredStar = field.required ? '<span style="color: red;">*</span>' : '';

            let inputHtml = '';

            switch (field.type) {
                case 'textarea':
                    inputHtml = `
                        <textarea
                            name="${field.name}"
                            id="${field.name}"
                            placeholder="${placeholder}"
                            rows="${field.rows || 4}"
                            ${required}
                            class="form-textarea"
                        ></textarea>
                    `;
                    break;

                case 'select':
                    const options = field.options
                        .map(opt => `<option value="${opt.value}">${getText(opt.label, lang)}</option>`)
                        .join('\n                    ');

                    inputHtml = `
                        <select
                            name="${field.name}"
                            id="${field.name}"
                            ${required}
                            class="form-select"
                        >
                            <option value="">-- ${getText(field.label, lang)} --</option>
                            ${options}
                        </select>
                    `;
                    break;

                default:
                    inputHtml = `
                        <input
                            type="${field.type}"
                            name="${field.name}"
                            id="${field.name}"
                            placeholder="${placeholder}"
                            ${required}
                            class="form-input"
                        />
                    `;
            }

            return `
                <div class="form-group">
                    <label for="${field.name}" class="form-label">
                        ${label} ${requiredStar}
                    </label>
                    ${inputHtml}
                </div>
            `;
        })
        .join('\n            ');
}

function generateContactMethods(lang) {
    const methods = [
        {
            icon: '✉️',
            label: 'Email',
            value: content.meta.contact.email,
            link: `mailto:${content.meta.contact.email}`
        },
        {
            icon: '📱',
            label: 'WhatsApp',
            value: content.meta.contact.whatsapp,
            link: `https://wa.me/${content.meta.contact.whatsapp.replace(/\D/g, '')}`
        },
        {
            icon: '💬',
            label: 'WeChat',
            value: content.meta.contact.wechat,
            link: null
        },
        {
            icon: '📞',
            label: getText({ pt: 'Telefone', zh: '电话', en: 'Phone' }, lang),
            value: content.meta.contact.phone,
            link: `tel:${content.meta.contact.phone.replace(/\D/g, '')}`
        }
    ];

    return methods
        .map(method => {
            const valueHtml = method.link
                ? `<a href="${method.link}" target="_blank" rel="noopener noreferrer">${method.value}</a>`
                : method.value;

            return `
                <div class="contact-method">
                    <div class="contact-icon">${method.icon}</div>
                    <div>
                        <strong>${method.label}</strong>
                        <div>${valueHtml}</div>
                    </div>
                </div>
            `;
        })
        .join('\n            ');
}

function generateWeChatQR(lang) {
    const qrPath = content.meta.social.wechat_qr;
    if (!qrPath) return '';

    return `
        <div class="wechat-qr-container">
            <h3>${getText({ pt: 'Escaneie para WeChat', zh: '扫码添加微信', en: 'Scan for WeChat' }, lang)}</h3>
            <img src="${qrPath}" alt="WeChat QR Code" />
            <p><strong>WeChat ID:</strong> ${content.meta.contact.wechat}</p>
        </div>
    `;
}

function generateFooterLinks(lang) {
    return content.footer.links
        .map(link => `<a href="${link.url}">${getText(link.label, lang)}</a>`)
        .join('\n            ');
}

// ============================================
// GENERATE PAGE FOR LANGUAGE
// ============================================

function generatePage(lang) {
    console.log(`🌍 Generating ${lang.toUpperCase()} version...`);

    let html = template;

    // Meta tags
    const replacements = {
        '{{LANG}}': lang,
        '{{LANG_NAME}}': content.languages.names[lang],
        '{{META_TITLE}}': `${content.meta.siteName} - ${getText(content.meta.tagline, lang)}`,
        '{{META_DESCRIPTION}}': content.meta.description,
        '{{META_KEYWORDS}}': content.meta.keywords,
        '{{OG_IMAGE}}': content.hero.background_image,

        // Language switcher
        '{{LANGUAGE_OPTIONS}}': generateLanguageOptions(lang),

        // Hero section
        '{{HERO_TITLE}}': getText(content.hero.title, lang),
        '{{HERO_SUBTITLE}}': getText(content.hero.subtitle, lang),
        '{{HERO_BG_IMAGE}}': content.hero.background_image,
        '{{HERO_CTA_PRIMARY}}': getText(content.hero.cta_primary, lang),
        '{{HERO_CTA_SECONDARY}}': getText(content.hero.cta_secondary, lang),
        '{{TRUST_BADGES}}': generateTrustBadges(lang),
        '{{CANTON_BANNER}}': generateCantonBanner(lang),

        // About section
        '{{ABOUT_TITLE}}': getText(content.about.section_title, lang),
        '{{MISSION_TITLE}}': getText(content.about.mission.title, lang),
        '{{MISSION_CONTENT}}': getText(content.about.mission.content, lang),
        '{{VISION_TITLE}}': getText(content.about.vision.title, lang),
        '{{VISION_CONTENT}}': getText(content.about.vision.content, lang),
        '{{GUANXI_SECTION}}': generateGuanxiSection(lang),

        // Services section
        '{{SERVICES_TITLE}}': getText(content.services.section_title, lang),
        '{{SERVICES_ITEMS}}': generateServicesItems(lang),

        // Process section
        '{{PROCESS_TITLE}}': getText(content.process.section_title, lang),
        '{{PROCESS_STEPS}}': generateProcessSteps(lang),

        // Contact section
        '{{CONTACT_TITLE}}': getText(content.contact.section_title, lang),
        '{{CONTACT_SUBTITLE}}': getText(content.contact.subtitle, lang),
        '{{FORM_ACTION}}': formConfig.submission.action,
        '{{FORM_METHOD}}': formConfig.submission.method,
        '{{FORM_FIELDS}}': generateFormFields(lang),
        '{{FORM_SUBMIT_TEXT}}': getText(content.contact.form_submit_button, lang),
        '{{SUCCESS_MESSAGE}}': getText(content.contact.success_message, lang),
        '{{ERROR_MESSAGE}}': getText(content.contact.error_message, lang),
        '{{LOADING_TEXT}}': getText({ pt: 'Enviando...', zh: '发送中...', en: 'Sending...' }, lang),
        '{{CONTACT_METHODS}}': generateContactMethods(lang),
        '{{WECHAT_QR}}': generateWeChatQR(lang),

        // Footer
        '{{FOOTER_LINKS}}': generateFooterLinks(lang),
        '{{FOOTER_COPYRIGHT}}': getText(content.footer.copyright, lang),

        // WhatsApp
        '{{WHATSAPP_NUMBER}}': content.meta.contact.whatsapp.replace(/\D/g, ''),
    };

    for (const [key, value] of Object.entries(replacements)) {
        html = html.replaceAll(key, value);
    }

    return html;
}

// ============================================
// BUILD PROCESS
// ============================================

console.log('\n🏗️  Starting build process...\n');

// Clean and create dist directory
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
ensureDir(DIST_DIR);

// Generate pages for each language
const languages = content.languages.available;

languages.forEach((lang) => {
    const html = generatePage(lang);

    let outputDir = DIST_DIR;
    if (lang !== content.languages.default) {
        outputDir = path.join(DIST_DIR, lang);
        ensureDir(outputDir);
    }

    const outputPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputPath, html, 'utf-8');

    console.log(`  ✅ Generated: ${lang}/index.html`);
});

// Copy assets
console.log('\n📦 Copying assets...');

// Copy CSS
const assetsDir = path.join(DIST_DIR, 'assets');
ensureDir(assetsDir);
fs.copyFileSync(
    path.join(SRC_DIR, 'styles.css'),
    path.join(assetsDir, 'styles.css')
);
console.log('  ✅ Copied styles.css');

// Create empty form-handler.js (placeholder for custom JS if needed)
fs.writeFileSync(
    path.join(assetsDir, 'form-handler.js'),
    '// Custom form handling code can go here\nconsole.log("China Business Hub - Form ready");',
    'utf-8'
);
console.log('  ✅ Created form-handler.js');

// Copy images from public/media
const imagesDir = path.join(DIST_DIR, 'images');
ensureDir(imagesDir);

const mediaSourceDir = path.join(PUBLIC_DIR, 'media');
if (fs.existsSync(mediaSourceDir)) {
    copyRecursive(mediaSourceDir, imagesDir);
    console.log('  ✅ Copied images from public/media');
} else {
    console.warn('  ⚠️  No media directory found at public/media');
}

// Copy favicon
const faviconPath = path.join(PUBLIC_DIR, '..', 'favicon.ico');
if (fs.existsSync(faviconPath)) {
    fs.copyFileSync(faviconPath, path.join(DIST_DIR, 'favicon.ico'));
    console.log('  ✅ Copied favicon.ico');
}

console.log('\n✨ Build completed successfully!\n');
console.log('📁 Output directory: ' + DIST_DIR);
console.log('🚀 Deploy the /dist folder to your China hosting\n');
console.log('Preview locally with: npx http-server dist -p 8080\n');

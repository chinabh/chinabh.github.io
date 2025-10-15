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
// UTILITY: STRIP COMMENTS FROM JSON
// ============================================

/**
 * Strips // style comments from JSON files
 * Allows using comments in JSON for better maintainability
 */
function stripJsonComments(jsonString) {
    // Remove single-line comments (// ...)
    // But preserve URLs (http://, https://)
    return jsonString
        .split('\n')
        .map(line => {
            // Find // that's not part of a URL
            const commentIndex = line.search(/(?<!:)\/\//);
            if (commentIndex !== -1) {
                return line.substring(0, commentIndex);
            }
            return line;
        })
        .join('\n');
}

// ============================================
// LOAD DATA
// ============================================

console.log('📖 Loading content and configuration...');

const contentRaw = fs.readFileSync(path.join(DATA_DIR, 'content.json'), 'utf-8');
const content = JSON.parse(stripJsonComments(contentRaw));

const formConfigRaw = fs.readFileSync(path.join(DATA_DIR, 'form-config.json'), 'utf-8');
const formConfig = JSON.parse(stripJsonComments(formConfigRaw));

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

// Password protection (pre-launch)
const IN_PRODUCTION = process.env.IN_PRODUCTION === 'true';
const SITE_PASSWORD = process.env.SITE_PASSWORD || 'chinabh2025';

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
    if (!content.hero.trust_badges || content.hero.trust_badges.length === 0) {
        return '';
    }

    const badges = content.hero.trust_badges
        .filter(badge => badge.enabled !== false) // Filter out disabled badges
        .map(badge => `
            <div class="trust-badge">
                <span>${badge.icon}</span>
                <span>${getText(badge.text, lang)}</span>
            </div>
        `)
        .join('');

    // If no badges after filtering, return empty string
    if (!badges.trim()) return '';

    return `<div class="trust-badges">${badges}</div>`;
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
    const methods = [];

    // Email - always show if exists
    if (content.meta.contact?.email) {
        methods.push({
            icon: '✉️',
            label: 'Email',
            value: content.meta.contact.email,
            link: `mailto:${content.meta.contact.email}`
        });
    }

    // WhatsApp - only if exists
    if (content.meta.contact?.whatsapp) {
        methods.push({
            icon: '📱',
            label: 'WhatsApp',
            value: content.meta.contact.whatsapp,
            link: `https://wa.me/${content.meta.contact.whatsapp.replace(/\D/g, '')}`
        });
    }

    // WeChat - only if exists
    if (content.meta.contact?.wechat) {
        methods.push({
            icon: '💬',
            label: 'WeChat',
            value: content.meta.contact.wechat,
            link: content.meta.contact.wechat_link
        });
    }

    // Phone - only if exists
    if (content.meta.contact?.phone) {
        methods.push({
            icon: '📞',
            label: getText({ pt: 'Telefone', zh: '电话', en: 'Phone' }, lang),
            value: content.meta.contact.phone,
            link: `tel:${content.meta.contact.phone.replace(/\D/g, '')}`
        });
    }

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
    const qrPath = content.meta.social?.wechat_qr;
    if (!qrPath) return '';

    const wechatId = content.meta.contact?.wechat;
    const wechatIdLabel = getText(content.wechat_popup?.wechat_id_label || { zh: '微信号', en: 'WeChat ID' }, lang);
    const wechatIdHtml = wechatId ? `<p><strong>${wechatIdLabel}:</strong> ${wechatId}</p>` : '';

    return `
        <div class="wechat-qr-container">
            <h3>${getText(content.wechat_popup?.title || { zh: '扫码添加微信', en: 'Scan for WeChat' }, lang)}</h3>
            <img src="${qrPath}" alt="WeChat QR Code" />
            ${wechatIdHtml}
        </div>
    `;
}

function generateFooterLinks(lang) {
    return content.footer.links
        .map(link => `<a href="${link.url}">${getText(link.label, lang)}</a>`)
        .join('\n            ');
}

function generateHeaderButtons(lang) {
    if (!content.header?.buttons) return '';

    return content.header.buttons
        .map(button => {
            const label = getText(button.label, lang);

            // Determine button style class
            let styleClass = 'btn-primary';
            if (button.style === 'secondary') {
                styleClass = 'btn-secondary';
            } else if (button.style === 'tertiary') {
                styleClass = 'btn-tertiary';
            }

            // External links open in new tab
            if (button.external) {
                return `<a href="${button.target}" class="header-btn ${styleClass}" target="_blank" rel="noopener noreferrer">${label}</a>`;
            }

            // Internal links with scroll behavior
            return `<a href="${button.target}" onclick="scrollToSection('${button.target}'); return false;" class="header-btn ${styleClass}">${label}</a>`;
        })
        .join('\n                ');
}

function generateWeChatButton() {
    const wechat = content.meta.contact?.wechat;
    if (!wechat) return '';

    return `
    <!-- WeChat Floating Button -->
    <div class="wechat-float" onclick="openWeChatModal()" aria-label="Contact via WeChat">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="white">
            <path d="M15.5 8C8.6 8 3 12.9 3 19c0 3.5 1.9 6.6 4.9 8.7-.2 1.7-1.2 4.8-1.3 5.1-.1.4.1.4.3.3.3-.1 5.4-3.5 6.2-4.1.8.1 1.6.2 2.4.2 6.9 0 12.5-4.9 12.5-11S22.4 8 15.5 8zm-2.2 14.4c-.9 0-1.7-.7-1.7-1.6s.8-1.6 1.7-1.6 1.7.7 1.7 1.6-.8 1.6-1.7 1.6zm6.7 0c-.9 0-1.7-.7-1.7-1.6s.8-1.6 1.7-1.6 1.7.7 1.7 1.6-.8 1.6-1.7 1.6zM37 21.5c0-5.4-5-9.8-11.1-9.8-.3 0-.6 0-.9.1 1.1 1.3 1.8 2.9 1.8 4.7 0 5.3-5.1 9.6-11.3 9.6-.5 0-1-.1-1.5-.1-.1.3-.1.5-.1.8 0 5.4 5.6 9.7 12.5 9.7.7 0 1.4-.1 2.1-.2.7.5 5.1 3.5 5.4 3.5.2.1.3 0 .3-.3 0-.2-.9-3-1.1-4.4 2.6-1.8 4-4.5 4-7.6z"/>
        </svg>
    </div>`;
}

function generateWeChatModal(lang) {
    const qrPath = content.meta.social?.wechat_qr;
    const wechatId = content.meta.contact?.wechat;

    if (!qrPath && !wechatId) return '';

    const title = getText(content.wechat_popup?.title || { zh: '扫码添加微信', en: 'Scan to Add WeChat' }, lang);
    const subtitle = getText(content.wechat_popup?.subtitle || { zh: '使用微信扫描二维码添加我们', en: 'Use WeChat to scan the QR code' }, lang);
    const wechatIdLabel = getText(content.wechat_popup?.wechat_id_label || { zh: '微信号', en: 'WeChat ID' }, lang);
    const closeButton = getText(content.wechat_popup?.close_button || { zh: '关闭', en: 'Close' }, lang);

    const qrImageHtml = qrPath ? `<img src="${qrPath}" alt="WeChat QR Code" class="wechat-modal-qr" />` : '';
    const wechatIdHtml = wechatId ? `<p class="wechat-modal-id"><strong>${wechatIdLabel}:</strong> ${wechatId}</p>` : '';

    return `
    <!-- WeChat Modal -->
    <div id="wechat-modal" class="wechat-modal" onclick="closeWeChatModal(event)">
        <div class="wechat-modal-content" onclick="event.stopPropagation()">
            <button class="wechat-modal-close" onclick="closeWeChatModal()">&times;</button>
            <h2 class="wechat-modal-title">${title}</h2>
            <p class="wechat-modal-subtitle">${subtitle}</p>
            ${qrImageHtml}
            ${wechatIdHtml}
            <button class="btn btn-primary wechat-modal-close-btn" onclick="closeWeChatModal()">${closeButton}</button>
        </div>
    </div>

    <script>
        function openWeChatModal() {
            document.getElementById('wechat-modal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }

        function closeWeChatModal(event) {
            if (!event || event.target.id === 'wechat-modal' || event.target.classList.contains('wechat-modal-close') || event.target.classList.contains('wechat-modal-close-btn')) {
                document.getElementById('wechat-modal').style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }

        // Close on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeWeChatModal();
            }
        });
    </script>`;
}

function generatePasswordProtection() {
    if (IN_PRODUCTION) {
        return ''; // No password protection in production
    }

    return `
    <div id="password-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); z-index: 9999; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 400px; width: 90%; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
            <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 24px;">Preview Access</h2>
            <p style="color: #6b7280; margin: 0 0 30px 0; font-size: 14px;">This site is not yet launched. Enter password to continue.</p>
            <input type="password" id="password-input" placeholder="Enter password" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; margin-bottom: 16px; box-sizing: border-box; transition: border-color 0.2s;" onfocus="this.style.borderColor='#667eea'" onblur="this.style.borderColor='#e5e7eb'" />
            <button onclick="checkPassword()" style="width: 100%; padding: 12px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 20px rgba(102,126,234,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">Unlock Site</button>
            <p id="password-error" style="color: #ef4444; margin: 16px 0 0 0; font-size: 14px; display: none;">Incorrect password. Please try again.</p>
        </div>
    </div>
    <script>
        const correctPassword = '${SITE_PASSWORD}';

        function checkPassword() {
            const input = document.getElementById('password-input');
            const error = document.getElementById('password-error');

            if (input.value === correctPassword) {
                document.getElementById('password-overlay').style.display = 'none';
                sessionStorage.setItem('siteUnlocked', 'true');
            } else {
                error.style.display = 'block';
                input.value = '';
                input.focus();
            }
        }

        // Allow Enter key to submit
        document.getElementById('password-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });

        // Check if already unlocked in this session
        if (sessionStorage.getItem('siteUnlocked') === 'true') {
            document.getElementById('password-overlay').style.display = 'none';
        }

        // Focus password input on load
        setTimeout(() => {
            document.getElementById('password-input').focus();
        }, 100);
    </script>
    `;
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

        // Header
        '{{HEADER_LOGO}}': content.header?.logo || '/images/logo.png',
        '{{HEADER_LOGO_ALT}}': getText(content.header?.logo_alt || { en: 'Logo', zh: '标志' }, lang),
        '{{HEADER_BUTTONS}}': generateHeaderButtons(lang),

        // Language switcher
        '{{LANGUAGE_OPTIONS}}': generateLanguageOptions(lang),

        // Hero section
        '{{HERO_TITLE}}': getText(content.hero.title, lang),
        '{{HERO_SUBTITLE}}': getText(content.hero.subtitle, lang),
        '{{HERO_BG_IMAGE}}': content.hero.background_image,
        '{{HERO_CTA_PRIMARY}}': getText(content.hero.cta_primary, lang),
        '{{HERO_CTA_SECONDARY}}': getText(content.hero.cta_secondary, lang),
        '{{HERO_CTA_TERTIARY}}': getText(content.hero.cta_tertiary, lang),
        '{{HERO_CTA_TERTIARY_URL}}': content.hero.cta_tertiary_url,
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
        '{{ERROR_MISSING_FIELDS}}': getText(content.contact.error_missing_fields, lang),
        '{{ERROR_INVALID_EMAIL}}': getText(content.contact.error_invalid_email, lang),
        '{{ERROR_SEND_FAILED}}': getText(content.contact.error_send_failed, lang),
        '{{ERROR_SPAM}}': getText(content.contact.error_spam, lang),
        '{{LOADING_TEXT}}': getText({ pt: 'Enviando...', zh: '发送中...', en: 'Sending...' }, lang),
        '{{CONTACT_METHODS}}': generateContactMethods(lang),
        '{{WECHAT_QR}}': generateWeChatQR(lang),

        // Footer
        '{{FOOTER_LINKS}}': generateFooterLinks(lang),
        '{{FOOTER_COPYRIGHT}}': getText(content.footer.copyright, lang),

        // WeChat button and modal (optional)
        '{{WHATSAPP_BUTTON}}': generateWeChatButton(),
        '{{WECHAT_MODAL}}': generateWeChatModal(lang),

        // Password protection (pre-launch)
        '{{PASSWORD_PROTECTION}}': generatePasswordProtection(),
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

// Copy images from project /images directory
const imagesDir = path.join(DIST_DIR, 'images');
ensureDir(imagesDir);

const projectImagesDir = path.join(ROOT_DIR, 'images');
if (fs.existsSync(projectImagesDir)) {
    copyRecursive(projectImagesDir, imagesDir);
    console.log('  ✅ Copied images from /images');
} else {
    console.warn('  ⚠️  No images directory found at /images');
}

// Also copy images from public/media if it exists (for backward compatibility)
const mediaSourceDir = path.join(PUBLIC_DIR, 'media');
if (fs.existsSync(mediaSourceDir)) {
    copyRecursive(mediaSourceDir, imagesDir);
    console.log('  ✅ Copied additional images from public/media');
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

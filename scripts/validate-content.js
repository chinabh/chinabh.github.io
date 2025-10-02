#!/usr/bin/env node
/**
 * CONTENT VALIDATOR
 * Checks content.json and form-config.json for common issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');

let hasErrors = false;

console.log('🔍 Validating content files...\n');

// Check if files exist
const contentPath = path.join(DATA_DIR, 'content.json');
const formPath = path.join(DATA_DIR, 'form-config.json');

if (!fs.existsSync(contentPath)) {
    console.error('❌ content.json not found!');
    hasErrors = true;
}

if (!fs.existsSync(formPath)) {
    console.error('❌ form-config.json not found!');
    hasErrors = true;
}

if (hasErrors) {
    process.exit(1);
}

// Load and validate content.json
try {
    const content = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

    console.log('✅ content.json is valid JSON');

    // Check required fields
    const requiredFields = [
        'meta.siteName',
        'meta.contact.email',
        'meta.contact.whatsapp',
        'hero.title',
        'services.items',
        'contact.section_title'
    ];

    requiredFields.forEach(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], content);
        if (!value) {
            console.error(`❌ Missing required field: ${field}`);
            hasErrors = true;
        }
    });

    // Check multilingual fields
    const languages = content.languages?.available || ['pt', 'zh', 'en'];
    const multilingualFields = [
        content.hero.title,
        content.hero.subtitle,
        content.about.mission.content
    ];

    multilingualFields.forEach((field, index) => {
        if (typeof field === 'object') {
            languages.forEach(lang => {
                if (!field[lang]) {
                    console.warn(`⚠️  Missing translation for language: ${lang} (field #${index + 1})`);
                }
            });
        }
    });

    // Check email format
    const email = content.meta.contact.email;
    if (email && !email.includes('@')) {
        console.error('❌ Invalid email format');
        hasErrors = true;
    }

    // Check WhatsApp number
    const whatsapp = content.meta.contact.whatsapp;
    if (whatsapp && !/^\+?\d{10,15}$/.test(whatsapp.replace(/[\s()-]/g, ''))) {
        console.warn('⚠️  WhatsApp number format might be invalid. Expected format: +5511987654321');
    }

    if (!hasErrors) {
        console.log('✅ content.json validation passed');
    }

} catch (error) {
    console.error('❌ Error parsing content.json:', error.message);
    hasErrors = true;
}

// Load and validate form-config.json
try {
    const formConfig = JSON.parse(fs.readFileSync(formPath, 'utf-8'));

    console.log('✅ form-config.json is valid JSON');

    // Check form action URL
    const action = formConfig.submission?.action;
    if (!action) {
        console.error('❌ Missing form submission action URL');
        hasErrors = true;
    } else if (action.includes('your-email@') || action.includes('YOUR_FORM_ID')) {
        console.warn('⚠️  Form action URL contains placeholder - update before deployment!');
        console.warn(`   Current: ${action}`);
    }

    // Check required fields
    const hasRequiredFields = formConfig.fields?.some(f => f.required);
    if (!hasRequiredFields) {
        console.warn('⚠️  No required fields in form - consider making at least email required');
    }

    if (!hasErrors) {
        console.log('✅ form-config.json validation passed');
    }

} catch (error) {
    console.error('❌ Error parsing form-config.json:', error.message);
    hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(50));

if (hasErrors) {
    console.log('❌ Validation failed - please fix errors above');
    process.exit(1);
} else {
    console.log('✅ All validations passed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Update form action URL in form-config.json');
    console.log('   2. Run: npm run build');
    console.log('   3. Deploy /dist folder to China hosting');
    process.exit(0);
}

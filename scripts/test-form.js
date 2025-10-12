#!/usr/bin/env node
/**
 * TEST SCRIPT FOR CLOUDFLARE WORKER FORM SUBMISSION
 *
 * Tests the form submission endpoint with sample data
 * Usage: node scripts/test-form.js
 */

const WORKER_URL = 'https://china-contact-form.dfnaiff.workers.dev';

async function testFormSubmission() {
  console.log('🧪 Testing form submission to:', WORKER_URL);
  console.log('─'.repeat(60));

  // Create test form data matching form-config.json
  const formData = new URLSearchParams({
    company_name_chinese: '测试公司',
    company_name_english: 'Test Company Ltd',
    segment: 'Electronics, Manufacturing',
    year_established: '2015',
    phone: '+86 138 0000 0000',
    email: 'test@testcompany.com',
    website_social: 'www.testcompany.com',
    exports_to_brazil: 'yes',
    main_products_brazil: 'Electronic components, LED lights',
    challenges_brazil: 'Finding reliable distributors and understanding import regulations',
    support_needed: 'We need help connecting with qualified distributors in São Paulo and Rio de Janeiro. Also need guidance on Brazilian import regulations.',
    language: 'en',
    _subject: 'New Contact from China Business Hub (Test)',
    _page_url: 'https://chinabusinesshub.com/test',
    _user_agent: 'Test Script',
    // Honeypot (should be empty)
    _gotcha: ''
  });

  console.log('\n📤 Sending test data:');
  console.log(JSON.stringify(Object.fromEntries(formData), null, 2));
  console.log('─'.repeat(60));

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://chinabusinesshub.com'
      },
      body: formData,
      redirect: 'manual' // Don't follow redirects
    });

    console.log('\n📥 Response:');
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    // Check for redirect
    if (response.status === 302 || response.status === 301) {
      const redirectUrl = response.headers.get('location');
      console.log('\n✅ Redirect to:', redirectUrl);

      // Parse redirect URL to check result
      if (redirectUrl.includes('submitted=true')) {
        console.log('✅ SUCCESS: Form submitted successfully!');
      } else if (redirectUrl.includes('error=')) {
        const errorMatch = redirectUrl.match(/error=([^&]+)/);
        const errorType = errorMatch ? errorMatch[1] : 'unknown';
        console.log('❌ ERROR:', errorType);

        // Explain error
        const errorExplanations = {
          'missing_fields': 'Required fields are missing',
          'invalid_email': 'Email format is invalid',
          'send_failed': 'Failed to send email via Resend API',
          'spam': 'Spam detected (honeypot triggered)'
        };
        console.log('   Explanation:', errorExplanations[errorType] || 'Unknown error');
      }
    } else {
      const text = await response.text();
      console.log('\n⚠️  Unexpected response:');
      console.log(text);
    }

  } catch (error) {
    console.error('\n❌ Request failed:');
    console.error(error.message);

    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log('Test complete!\n');
}

// Run test
testFormSubmission();

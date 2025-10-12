export default {
  async fetch(request, env) {
    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Get the origin for CORS
    const origin = request.headers.get('Origin') || '';

    try {
      // Parse form data
      const formData = await request.formData();
      const data = Object.fromEntries(formData);

      // Honeypot spam check
      if (data._gotcha && data._gotcha.trim() !== '') {
        console.log('Spam blocked via honeypot');
        return createRedirect(origin, 'spam');
      }

      // Validate required fields (matching form-config.json)
      if (!data.company_name_chinese || !data.company_name_english || !data.email || !data.support_needed) {
        console.log('Missing required fields');
        return createRedirect(origin, 'missing_fields');
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        console.log('Invalid email format');
        return createRedirect(origin, 'invalid_email');
      }

      // Send email via Resend
      const emailSent = await sendEmail(data, env);

      if (!emailSent) {
        console.log('Failed to send email');
        return createRedirect(origin, 'send_failed');
      }

      // Success - redirect back
      console.log('Form submitted successfully');
      return createRedirect(origin, 'success');

    } catch (error) {
      console.error('Error processing form:', error);
      return createRedirect(origin, 'send_failed');
    }
  }
};

/**
 * Send email via Resend API
 */
async function sendEmail(data, env) {
  // Format email content (matching form-config.json fields)
  const emailBody = `
New Partnership Form Submission
================================

Company Information:
-------------------
Company Name (Chinese): ${data.company_name_chinese}
Company Name (English): ${data.company_name_english}
Segment(s): ${data.segment}
Year Established: ${data.year_established}

Contact Information:
-------------------
Primary Phone: ${data.phone}
Primary Email: ${data.email}
Website/Social: ${data.website_social || 'Not provided'}

Export Information:
------------------
Already exports to Brazil: ${data.exports_to_brazil}
Main products exported: ${data.main_products_brazil || 'N/A'}

Challenges & Support:
--------------------
Challenges in Brazil: ${data.challenges_brazil || 'Not specified'}

Support Needed:
${data.support_needed}

Metadata:
---------
Language: ${data.language || 'en'}
Submitted from: ${data._page_url || 'Unknown'}
User Agent: ${data._user_agent || 'Unknown'}
Timestamp: ${new Date().toISOString()}

---
Sent via China Business Hub Partnership Form
  `.trim();

  // Get configuration from environment variables
  const recipientEmail = env.RECIPIENT_EMAIL || 'contato@chinabusinesshub.com';
  const resendApiKey = env.RESEND_API_KEY;
  const fromDomain = env.FROM_DOMAIN || 'chinabh-github-io.pages.dev';

  if (!resendApiKey) {
    console.error('RESEND_API_KEY not set');
    return false;
  }

  // Resend API request
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `China Business Hub <noreply@${fromDomain}>`,
        to: [recipientEmail],
        subject: `New Partnership: ${data.company_name_english} - China Business Hub`,
        reply_to: data.email,
        text: emailBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', response.status, errorText);
      return false;
    }

    const result = await response.json();
    console.log('Email sent successfully:', result.id);
    return true;

  } catch (error) {
    console.error('Resend error:', error);
    return false;
  }
}

/**
 * Create redirect response with specific error codes
 * @param {string} origin - The origin URL
 * @param {string} status - Status code: 'success', 'missing_fields', 'invalid_email', 'send_failed', 'spam'
 */
function createRedirect(origin, status) {
  let param;

  if (status === 'success') {
    param = 'submitted=true';
  } else {
    param = `error=${status}`;
  }

  const redirectUrl = origin ? `${origin}?${param}` : `/?${param}`;

  return Response.redirect(redirectUrl, 302);
}

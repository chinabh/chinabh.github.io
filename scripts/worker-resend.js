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
        return createRedirect(origin, true);
      }

      // Validate required fields
      if (!data.name || !data.email || !data.message) {
        console.log('Missing required fields');
        return createRedirect(origin, false);
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        console.log('Invalid email format');
        return createRedirect(origin, false);
      }

      // Send email via Resend
      const emailSent = await sendEmail(data, env);

      if (!emailSent) {
        console.log('Failed to send email');
        return createRedirect(origin, false);
      }

      // Success - redirect back
      console.log('Form submitted successfully');
      return createRedirect(origin, true);

    } catch (error) {
      console.error('Error processing form:', error);
      return createRedirect(origin, false);
    }
  }
};

/**
 * Send email via Resend API
 */
async function sendEmail(data, env) {
  // Format email content
  const emailBody = `
New Contact Form Submission
===========================

Contact Information:
-------------------
Name/Company: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
WeChat: ${data.wechat || 'Not provided'}
Company: ${data.company || 'Not provided'}

Business Details:
----------------
Business Type: ${data.business_type || 'Not specified'}
Products of Interest: ${data.products || 'Not specified'}

Message:
--------
${data.message}

Metadata:
---------
Language: ${data.language || 'en'}
Submitted from: ${data._page_url || 'Unknown'}
User Agent: ${data._user_agent || 'Unknown'}
Timestamp: ${new Date().toISOString()}

---
Sent via China Business Hub Contact Form
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
        subject: `New Contact: ${data.name} - China Business Hub`,
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
 * Create redirect response
 */
function createRedirect(origin, success) {
  const param = success ? 'submitted=true' : 'error=true';
  const redirectUrl = origin ? `${origin}?${param}` : `/?${param}`;

  return Response.redirect(redirectUrl, 302);
}

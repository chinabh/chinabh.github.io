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

      // Send email via MailChannels
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
 * Send email via MailChannels API
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

  // Get recipient email from environment variable or use default
  const recipientEmail = env.RECIPIENT_EMAIL || 'contato@chinabusinesshub.com';

  // MailChannels API request
  try {
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: recipientEmail }],
            dkim_domain: 'chinabhcn.pages.dev',
            dkim_selector: 'mailchannels',
          },
        ],
        from: {
          email: 'noreply@chinabhcn.pages.dev',
          name: 'China Business Hub Contact Form',
        },
        reply_to: {
          email: data.email,
          name: data.name,
        },
        content: [
          {
            type: 'text/plain',
            value: emailBody,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MailChannels API error:', response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('MailChannels error:', error);
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

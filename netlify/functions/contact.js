

const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid request body' }) };
  }

  const { name, email, businessType, message } = body;

  if (!name || !email || !message) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing required fields' }) };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid email address' }) };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,        // moyotrevor624@gmail.com
      pass: process.env.GMAIL_APP_PASSWORD  // 16-char App Password from Google
    }
  });

  try {
    await transporter.sendMail({
      from: `"ModernizeFlow Website" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,  // sends to yourself
      replyTo: email,              // so you can reply directly to the lead
      subject: `New Lead: ${name} — ModernizeFlow`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0d1117;color:#e8edf4;padding:32px;border-radius:12px;">
          <h2 style="color:#3b82f6;margin-bottom:24px;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;color:#6b7e96;width:140px;">Name</td><td style="padding:10px 0;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:10px 0;color:#6b7e96;">Email</td><td style="padding:10px 0;"><a href="mailto:${email}" style="color:#3b82f6;">${email}</a></td></tr>
            <tr><td style="padding:10px 0;color:#6b7e96;">Business Type</td><td style="padding:10px 0;">${businessType || 'Not specified'}</td></tr>
          </table>
          <div style="margin-top:24px;padding:20px;background:#131c28;border-radius:8px;border-left:3px solid #3b82f6;">
            <p style="color:#6b7e96;margin-bottom:8px;font-size:13px;">MESSAGE</p>
            <p style="line-height:1.7;">${message}</p>
          </div>
          <p style="margin-top:24px;color:#3d5068;font-size:12px;">
            Hit reply to respond directly to ${name} at ${email}
          </p>
        </div>
      `
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Message sent successfully' })
    };

  } catch (error) {
    console.error('Email error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Failed to send message. Please try again.' })
    };
  }
};

// netlify/functions/chat.js
// Proxies chatbot messages to Claude API
// Set env var: ANTHROPIC_API_KEY in Netlify dashboard

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid request body' }) };
  }

  const { messages, system } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Messages are required' }) };
  }

  // Rate limiting: max 20 messages per conversation
  if (messages.length > 40) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ reply: "This chat session has reached its limit. Please email us at hello@modernizeflow.co.zw to continue the conversation!" })
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set');
    return {
      statusCode: 200, // Return 200 with fallback so chat still works
      headers,
      body: JSON.stringify({
        reply: "Hi! I'm not fully configured yet. Please contact us directly at hello@modernizeflow.co.zw or fill in the contact form below — we'd love to help!"
      })
    };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', // Fast & cost-effective for chat
        max_tokens: 400,
        system: system || 'You are a helpful assistant for ModernizeFlow, a software company in Zimbabwe.',
        messages: messages.slice(-10) // Keep last 10 messages for context window efficiency
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, errorData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: "I'm having a moment — sorry about that! Please email us at hello@modernizeflow.co.zw or use the contact form."
        })
      };
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "I couldn't generate a response. Please reach out to us directly!";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply, success: true })
    };

  } catch (error) {
    console.error('Chat function error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: "I'm temporarily offline. Please contact us at hello@modernizeflow.co.zw — we respond within 24 hours!"
      })
    };
  }
};

const { createClient } = require('@supabase/supabase-js');
 
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
 
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};
 
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }
 
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed' }) };
  }
 
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid request body' }) };
  }
 
  const { action } = body;
 
  // ── SIGN UP ──
  if (action === 'signup') {
    const { first, last, email, password, business } = body;
 
    if (!first || !last || !email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'All fields are required' }) };
    }
 
    if (password.length < 8) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'Password must be at least 8 characters' }) };
    }
 
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: first,
          last_name: last,
          business_type: business || ''
        }
      }
    });
 
    if (error) {
      // Supabase returns a specific message for duplicate emails
      const message = error.message.includes('already registered')
        ? 'An account with this email already exists.'
        : error.message;
      return { statusCode: 400, headers, body: JSON.stringify({ message }) };
    }
 
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: {
          firstName: first,
          lastName: last,
          email: data.user.email,
          businessType: business
        }
      })
    };
  }
 
  // ── SIGN IN ──
  if (action === 'login') {
    const { email, password } = body;
 
    if (!email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'Email and password are required' }) };
    }
 
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
 
    if (error) {
      return { statusCode: 401, headers, body: JSON.stringify({ message: 'Invalid email or password' }) };
    }
 
    const meta = data.user.user_metadata;
 
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: {
          firstName: meta.first_name || '',
          lastName: meta.last_name || '',
          email: data.user.email,
          businessType: meta.business_type || ''
        }
      })
    };
  }
 
  return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid action' }) };
};
 
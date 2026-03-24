// netlify/functions/auth.js
// Lightweight auth using a JSON store via Netlify Blobs (or FaunaDB/Supabase for production)
// For production, replace storage with Supabase Auth or FaunaDB — see comments below.

const crypto = require('crypto');

// ── HELPERS ──
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ── STORAGE: Netlify Blobs ──
// Netlify Blobs is built-in key-value storage — no extra services needed.
// Docs: https://docs.netlify.com/blobs/overview/
async function getStore() {
  // Using Netlify Blobs (available in all Netlify plans)
  const { getStore } = await import('@netlify/blobs');
  return getStore('mf-users');
}

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
    return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid request' }) };
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid email address' }) };
    }

    try {
      const store = await getStore();
      const existing = await store.get(email.toLowerCase()).catch(() => null);

      if (existing) {
        return { statusCode: 409, headers, body: JSON.stringify({ message: 'An account with this email already exists' }) };
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = hashPassword(password, salt);
      const token = generateToken();
      const createdAt = new Date().toISOString();

      const user = {
        firstName: first,
        lastName: last,
        email: email.toLowerCase(),
        businessType: business || '',
        salt,
        hashedPassword,
        token,
        createdAt
      };

      await store.setJSON(email.toLowerCase(), user);

      // Return user data (without sensitive fields)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: { firstName: first, lastName: last, email: email.toLowerCase(), businessType: business, token }
        })
      };
    } catch (err) {
      console.error('Signup error:', err);
      return { statusCode: 500, headers, body: JSON.stringify({ message: 'Server error. Please try again.' }) };
    }
  }

  // ── LOGIN ──
  if (action === 'login') {
    const { email, password } = body;

    if (!email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'Email and password required' }) };
    }

    try {
      const store = await getStore();
      const userData = await store.get(email.toLowerCase(), { type: 'json' }).catch(() => null);

      if (!userData) {
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'Invalid email or password' }) };
      }

      const { salt, hashedPassword, firstName, lastName, businessType } = userData;
      const inputHash = hashPassword(password, salt);

      if (inputHash !== hashedPassword) {
        return { statusCode: 401, headers, body: JSON.stringify({ message: 'Invalid email or password' }) };
      }

      const token = generateToken();
      // Update token in store
      await store.setJSON(email.toLowerCase(), { ...userData, token });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: { firstName, lastName, email: email.toLowerCase(), businessType, token }
        })
      };
    } catch (err) {
      console.error('Login error:', err);
      return { statusCode: 500, headers, body: JSON.stringify({ message: 'Server error. Please try again.' }) };
    }
  }

  return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid action' }) };
};

/*
──────────────────────────────────────────────
PRODUCTION UPGRADE PATH:
──────────────────────────────────────────────

Option A — Supabase Auth (recommended for scale):
1. Create project at supabase.com (free tier available)
2. npm install @supabase/supabase-js
3. Set env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
4. Replace Netlify Blobs storage with supabase.auth.admin.createUser()
   and supabase.auth.admin.signInWithPassword()

Option B — FaunaDB:
1. npm install faunadb
2. Set env var: FAUNA_SECRET
3. Use fauna.query(q.Create(q.Collection('users'), { data: user }))

Option C — PlanetScale / Turso (SQL):
1. Use serverless MySQL/SQLite with connection pooling
2. Good for complex queries and analytics

──────────────────────────────────────────────
*/

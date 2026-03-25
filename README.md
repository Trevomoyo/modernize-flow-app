# ModernizeFlow — Interactive Website

## 📁 File Structure

```
modernizeflow/
├── index.html              ← Main website
├── style.css               ← All styles
├── main.js                 ← Frontend JS (scroll animations, chatbot, auth, forms)
├── netlify.toml            ← Netlify configuration
├── package.json            ← Dependencies
└── netlify/
    └── functions/
        ├── contact.js      ← Contact form handler (sends email)
        ├── auth.js         ← Sign up / Sign in
        └── chat.js         ← AI chatbot (Claude API)
```

---

## 🚀 Deployment Steps

### 1. Replace your existing site files
Upload all files to your Git repo connected to Netlify, OR drag-and-drop the folder into Netlify's deploy UI.

### 2. Set Environment Variables
Go to: **Netlify Dashboard → Your Site → Site Settings → Environment Variables**

Add these:

| Variable | Value | Required For |
|----------|-------|--------------|
| `ANTHROPIC_API_KEY` | Your Claude API key | AI Chatbot |
| `SENDGRID_API_KEY` | Your SendGrid key | Contact form emails |
| `EMAIL_TO` | `hello@modernizeflow.co.zw` | Contact form emails |
| `EMAIL_FROM` | `noreply@modernizeflow.co.zw` | Contact form emails |

### 3. Install dependencies
In your project root, run:
```bash
npm install
```

---

## 🔑 Getting API Keys

### Anthropic (for AI Chatbot)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Add as `ANTHROPIC_API_KEY` in Netlify

### SendGrid (for Contact Form Emails) — FREE up to 100 emails/day
1. Sign up at [sendgrid.com](https://sendgrid.com) (free plan)
2. Go to Settings → API Keys → Create API Key
3. Add as `SENDGRID_API_KEY` in Netlify
4. Verify your sending domain (modernizeflow.co.zw) in SendGrid

**Alternative: Resend** (even simpler, 3,000 emails/month free)
1. Sign up at [resend.com](https://resend.com)
2. Get API key, add as `RESEND_API_KEY`
3. Already handled in `contact.js`

---

## ✨ Features Included

- **Scroll Animations** — Elements fade/slide in as you scroll
- **Animated Counters** — Stats count up when visible
- **Custom Cursor** — Branded cursor with trail effect
- **AI Chatbot** — Powered by Claude, knows all about ModernizeFlow
- **Sign In / Sign Up Modal** — With Netlify Blobs storage
- **Contact Form** — Sends email to your inbox via Netlify Function
- **Sticky Nav** — Blur effect on scroll

---

## 🔧 Auth Storage Upgrade (for production scale)

The current auth uses **Netlify Blobs** (built-in, no cost, no setup).
For 100+ users, upgrade to:

- **Supabase** (recommended): Free tier, built-in auth, PostgreSQL
- **FaunaDB**: Serverless-native, great for Netlify
- **PlanetScale**: MySQL, generous free tier

See comments in `netlify/functions/auth.js` for migration code.

---

## 🧪 Local Development

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Link to your Netlify site
netlify link

# Run locally (functions + site)
netlify dev
```

Your site will be at `http://localhost:8888`

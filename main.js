// ── CUSTOM CURSOR ──
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursorTrail');
let mouseX = 0, mouseY = 0;
 
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
  setTimeout(() => {
    trail.style.left = mouseX + 'px';
    trail.style.top = mouseY + 'px';
  }, 80);
});
 
document.querySelectorAll('a, button, .solution-card, .portfolio-card, .suggestion-chip').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '18px';
    cursor.style.height = '18px';
    cursor.style.background = 'var(--accent-2)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '10px';
    cursor.style.height = '10px';
    cursor.style.background = 'var(--accent)';
  });
});
 
// ── SCROLL ANIMATIONS (IntersectionObserver) ──
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
 
reveals.forEach(el => revealObserver.observe(el));
 
// ── NAVBAR SCROLL EFFECT ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});
 
// ── ANIMATED COUNTERS ──
const statNums = document.querySelectorAll('.stat-num');
let countersStarted = false;
 
const countObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !countersStarted) {
    countersStarted = true;
    statNums.forEach(num => {
      const target = parseInt(num.dataset.target);
      let current = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { num.textContent = target; clearInterval(timer); }
        else { num.textContent = Math.floor(current); }
      }, 20);
    });
  }
}, { threshold: 0.5 });
 
if (statNums.length) countObserver.observe(statNums[0]);
 
// ── SMOOTH SCROLL (nav links) ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
 
// ── AUTH MODAL ──
const authModal = document.getElementById('authModal');
const closeModal = document.getElementById('closeModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const modalTabs = document.querySelectorAll('.modal-tab');
 
function openModal(tab = 'login') {
  authModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  switchTab(tab);
}
function closeModalFn() {
  authModal.classList.remove('active');
  document.body.style.overflow = '';
}
function switchTab(tab) {
  modalTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  loginForm.classList.toggle('hidden', tab !== 'login');
  signupForm.classList.toggle('hidden', tab !== 'signup');
}
 
document.getElementById('openLogin').addEventListener('click', () => openModal('login'));
document.getElementById('openSignup').addEventListener('click', () => openModal('signup'));
document.getElementById('heroGetStarted').addEventListener('click', () => openModal('signup'));
closeModal.addEventListener('click', closeModalFn);
authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModalFn(); });
 
modalTabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
 
document.querySelectorAll('.link-text').forEach(link => {
  link.addEventListener('click', () => switchTab(link.dataset.tab));
});
 
// ── AUTH: SIGN IN (via Netlify Function) ──
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const msg = document.getElementById('loginMessage');
  const btn = document.getElementById('loginBtn');
 
  if (!email || !password) {
    showMsg(msg, 'Please fill in all fields.', 'error'); return;
  }
 
  btn.classList.add('btn-loading');
  btn.textContent = 'Signing in...';
 
  try {
    const res = await fetch('/.netlify/functions/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showMsg(msg, '✓ Welcome back! Redirecting...', 'success');
      setUserSession(data.user);
      setTimeout(() => { closeModalFn(); updateNavForUser(data.user); }, 1200);
    } else {
      showMsg(msg, data.message || 'Invalid email or password.', 'error');
    }
  } catch (err) {
    showMsg(msg, 'Connection error. Please try again.', 'error');
  } finally {
    btn.classList.remove('btn-loading');
    btn.textContent = 'Sign In';
  }
});
 
// ── AUTH: SIGN UP (via Netlify Function) ──
document.getElementById('signupBtn').addEventListener('click', async () => {
  const first = document.getElementById('signupFirst').value.trim();
  const last = document.getElementById('signupLast').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const business = document.getElementById('signupBusiness').value;
  const msg = document.getElementById('signupMessage');
  const btn = document.getElementById('signupBtn');
 
  if (!first || !last || !email || !password) {
    showMsg(msg, 'Please fill in all required fields.', 'error'); return;
  }
  if (password.length < 8) {
    showMsg(msg, 'Password must be at least 8 characters.', 'error'); return;
  }
 
  btn.classList.add('btn-loading');
  btn.textContent = 'Creating account...';
 
  try {
    const res = await fetch('/.netlify/functions/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'signup', first, last, email, password, business })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showMsg(msg, '✓ Account created! Welcome to ModernizeFlow.', 'success');
      setUserSession(data.user);
      setTimeout(() => { closeModalFn(); updateNavForUser(data.user); }, 1400);
    } else {
      showMsg(msg, data.message || 'Something went wrong.', 'error');
    }
  } catch (err) {
    showMsg(msg, 'Connection error. Please try again.', 'error');
  } finally {
    btn.classList.remove('btn-loading');
    btn.textContent = 'Create Account';
  }
});
 
function updateNavForUser(user) {
  const actions = document.querySelector('.nav-actions');
  actions.innerHTML = `
    <span style="color:var(--text-muted);font-size:0.88rem;">Hi, ${user.firstName}!</span>
    <button class="btn-ghost" id="logoutBtn">Sign Out</button>
  `;
  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearUserSession();
    location.reload();
  });
}
 
// ── SESSION MANAGEMENT (cookie-based) ──
function setUserSession(user) {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 day cookie
  document.cookie = `mf_user=${encodeURIComponent(JSON.stringify(user))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  localStorage.setItem('mf_user', JSON.stringify(user)); // fallback
}
 
function getUserSession() {
  // Try cookie first
  const match = document.cookie.match(/(?:^|;\s*)mf_user=([^;]*)/);
  if (match) {
    try { return JSON.parse(decodeURIComponent(match[1])); } catch {}
  }
  // Fallback to localStorage
  const ls = localStorage.getItem('mf_user');
  if (ls) { try { return JSON.parse(ls); } catch {} }
  return null;
}
 
function clearUserSession() {
  document.cookie = 'mf_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  localStorage.removeItem('mf_user');
}
 
// Restore session on page load
const savedUser = getUserSession();
if (savedUser) {
  try { updateNavForUser(savedUser); } catch {}
}
 
// ── CONTACT FORM (via Netlify Function) ──
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('contactSubmit');
  const msg = document.getElementById('contactMessage');
 
  const formData = {
    name: form.querySelector('[name="name"]').value.trim(),
    email: form.querySelector('[name="email"]').value.trim(),
    businessType: form.querySelector('[name="businessType"]').value,
    message: form.querySelector('[name="message"]').value.trim()
  };
 
  if (!formData.name || !formData.email || !formData.message) {
    showMsg(msg, 'Please fill in all required fields.', 'error'); return;
  }
 
  btn.classList.add('btn-loading');
  btn.querySelector('span').textContent = 'Sending...';
 
  try {
    const res = await fetch('/.netlify/functions/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showMsg(msg, '✓ Message sent! We\'ll be in touch within 24 hours.', 'success');
      form.reset();
    } else {
      showMsg(msg, data.message || 'Something went wrong. Please try again.', 'error');
    }
  } catch (err) {
    showMsg(msg, 'Connection error. Please try again.', 'error');
  } finally {
    btn.classList.remove('btn-loading');
    btn.querySelector('span').textContent = 'Send Message';
  }
});
 
// ── CHATBOT ──
const chatFab = document.getElementById('chatFab');
const chatWidget = document.getElementById('chatWidget');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatBadge = document.getElementById('chatBadge');
const chatFabIcon = document.querySelector('.chat-fab-icon');
const chatFabClose = document.querySelector('.chat-fab-close');
 
let chatOpen = false;
let chatHistory = [];
 
const SYSTEM_PROMPT = `You are ModernizeFlow's friendly AI assistant. ModernizeFlow is a software company based in Zimbabwe (website: modernizeflow.co.zw) that helps businesses modernize from manual/paper-based operations to digital systems.
 
Services: Inventory Management, Point of Sale (POS) Systems, Customer Relationship Management (CRM), Business Analytics, Workflow Automation, and Cloud Migration.
 
Founders: Tatenda Masuka (Co-Founder & CEO), Trevor Moyo (Co-Founder & CTO), and Milton Mukundiwa (Co-Founder & COO).
 
Location: Harare, Zimbabwe. Email: hello@modernizeflow.co.zw
 
Be warm, concise, and helpful. For pricing, say it's custom-quoted based on business size and needs — encourage them to fill in the contact form or book a demo. If asked about technical details, keep it simple and accessible. Always encourage the user to reach out if they want to get started.`;
 
function toggleChat() {
  chatOpen = !chatOpen;
  chatWidget.classList.toggle('open', chatOpen);
  chatFabIcon.classList.toggle('hidden', chatOpen);
  chatFabClose.classList.toggle('hidden', !chatOpen);
  chatBadge.classList.add('hidden');
  if (chatOpen) chatInput.focus();
}
 
chatFab.addEventListener('click', toggleChat);
chatClose.addEventListener('click', toggleChat);
 
document.querySelectorAll('.suggestion-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    sendChatMessage(chip.dataset.msg);
    chip.closest('.chat-suggestions')?.remove();
  });
});
 
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFromInput(); }
});
chatSend.addEventListener('click', sendFromInput);
 
function sendFromInput() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  sendChatMessage(text);
}
 
function sendChatMessage(text) {
  appendMessage(text, 'user');
  chatHistory.push({ role: 'user', content: text });
  showTyping();
  fetchAIReply();
}
 
function appendMessage(text, role) {
  const wrapper = document.createElement('div');
  wrapper.className = `chat-msg ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;
  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = 'Just now';
  wrapper.appendChild(bubble);
  wrapper.appendChild(time);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return wrapper;
}
 
function showTyping() {
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-msg bot';
  wrapper.id = 'typingMsg';
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
 
function removeTyping() {
  document.getElementById('typingMsg')?.remove();
}
 
async function fetchAIReply() {
  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: SYSTEM_PROMPT,
        messages: chatHistory
      })
    });
    const data = await response.json();
    removeTyping();
    const reply = data.reply || "I'm sorry, I couldn't get a response. Please try again or email us at hello@modernizeflow.co.zw";
    chatHistory.push({ role: 'assistant', content: reply });
    appendMessage(reply, 'bot');
  } catch (err) {
    removeTyping();
    appendMessage("I'm having trouble connecting right now. Please try again shortly!", 'bot');
  }
}
 
// ── HELPER ──
function showMsg(el, text, type) {
  el.textContent = text;
  el.className = `form-message ${type}`;
}
 
// ── COOKIE CONSENT BANNER ──
const cookieBanner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');
const cookieDecline = document.getElementById('cookieDecline');
 
function getCookieConsent() {
  return document.cookie.match(/mf_consent=([^;]*)/)?.[1];
}
 
// Show banner if no consent decision yet
if (!getCookieConsent()) {
  setTimeout(() => cookieBanner.classList.remove('hidden'), 1500);
} else {
  cookieBanner.classList.add('hidden');
}
 
cookieAccept.addEventListener('click', () => {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `mf_consent=accepted; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  cookieBanner.classList.add('hidden');
});
 
cookieDecline.addEventListener('click', () => {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `mf_consent=declined; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  cookieBanner.classList.add('hidden');
  // Clear any existing session cookies if declined
  clearUserSession();
});

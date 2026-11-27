import { supabase, showMessage } from './supabase-client.js';
const form = document.getElementById('loginForm');
const notice = document.getElementById('loginNotice');
const button = document.getElementById('loginButton');
const next = new URLSearchParams(location.search).get('next');
form.addEventListener('submit', async (event) => {
  event.preventDefault(); button.disabled = true; button.textContent = 'Signing in…';
  const { data, error } = await supabase.auth.signInWithPassword({ email: document.getElementById('email').value.trim(), password: document.getElementById('password').value });
  if (error) { showMessage(notice, error.message, 'error'); button.disabled = false; button.textContent = 'Sign In'; return; }
  const destination = next && next.startsWith('/') && !next.startsWith('//') ? next : 'my-orders.html';
  location.href = destination;
});

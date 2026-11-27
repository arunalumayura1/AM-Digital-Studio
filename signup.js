import { supabase, showMessage } from './supabase-client.js';
const form = document.getElementById('signupForm');
const notice = document.getElementById('signupNotice');
const button = document.getElementById('signupButton');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirmPassword').value;
  if (password !== confirm) { showMessage(notice, 'Passwords do not match.', 'error'); return; }
  button.disabled = true; button.textContent = 'Creating account…';
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  if (error) { showMessage(notice, error.message, 'error'); button.disabled = false; button.textContent = 'Create Account'; return; }
  if (data.session) { showMessage(notice, 'Account created successfully. Opening your orders…', 'success'); setTimeout(() => location.href = 'my-orders.html', 800); }
  else { showMessage(notice, 'Account created. Check your email for the confirmation link, then sign in.', 'success'); button.disabled = false; button.textContent = 'Create Account'; }
});

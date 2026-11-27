// AM Digital Studio — Supabase client
// The publishable key is intended for browser use. Keep RLS enabled.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://thsoottsbatrxszyolpe.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_uQ04dgZlSaczNM9izYlscg_-rP6DsEb';
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

export async function requireUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

const { data: sessionData } = await supabase.auth.getSession();

console.log('SERVICE ORDER AUTH CHECK', {
    user_id_sent_to_database: user?.id,
    session_user_id: sessionData?.session?.user?.id,
    access_token_exists: !!sessionData?.session?.access_token,
    user_email: user?.email
});
  if (error || !user) {
    const next = encodeURIComponent(location.pathname + location.search);
    location.href = `login.html?next=${next}`;
    return null;
  }
  return user;
}

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('id, full_name, email, role').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export function money(amount, currency = 'LKR') {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(amount || 0));
}

export function statusLabel(value = '') {
  return String(value).replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function showMessage(element, message, type = 'info') {
  if (!element) return;
  element.textContent = message;
  element.className = `notice ${type}`;
  element.hidden = false;
}

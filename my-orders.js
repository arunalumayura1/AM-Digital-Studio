import { supabase, requireUser, getProfile, money, statusLabel } from './supabase-client.js';
const list = document.getElementById('ordersList');
const user = await requireUser();
if (user) {
  try {
    const profile = await getProfile(user.id);
    document.getElementById('welcomeText').textContent = `Signed in as ${profile.full_name || user.email}`;
    if (profile.role === 'admin') document.getElementById('adminLink').hidden = false;
    const { data: orders, error } = await supabase.from('orders').select('id, tracking_number, order_type, service_name, package_name, project_title, items, total_amount, currency, status, payment_status, created_at, updated_at').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw error;
    const rows = orders || [];
    document.getElementById('totalCount').textContent = rows.length;
    document.getElementById('activeCount').textContent = rows.filter(o => !['completed','cancelled'].includes(o.status)).length;
    document.getElementById('completedCount').textContent = rows.filter(o => o.status === 'completed').length;
    if (!rows.length) { list.innerHTML = '<div class="empty">You have no orders yet. Your future service and store orders will appear here.</div>'; }
    else list.innerHTML = rows.map(o => {
      const title = o.order_type === 'service' ? (o.service_name || 'Service order') : 'Store order';
      const detail = o.order_type === 'service' ? [o.package_name, o.project_title].filter(Boolean).join(' · ') : `${Array.isArray(o.items) ? o.items.length : 0} item type(s)`;
      return `<article class="order-card"><div class="order-head"><div><h3>${escapeHtml(title)}</h3><div class="muted" style="font-size:.78rem">${escapeHtml(detail)}</div></div><span class="pill">${escapeHtml(statusLabel(o.status))}</span></div><div class="order-meta"><span>Tracking: <strong>${escapeHtml(o.tracking_number)}</strong></span><span>${money(o.total_amount, o.currency)}</span><span>${new Date(o.created_at).toLocaleDateString()}</span><span>Payment: ${escapeHtml(statusLabel(o.payment_status))}</span></div><div class="actions" style="margin-top:14px"><a class="btn small" href="tracking.html?number=${encodeURIComponent(o.tracking_number)}">View Tracking</a></div></article>`;
    }).join('');
  } catch (error) { list.innerHTML = `<div class="notice error">${escapeHtml(error.message)}</div>`; }
}
function escapeHtml(value='') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
document.getElementById('logoutButton').addEventListener('click', async () => { await supabase.auth.signOut(); location.href = 'login.html'; });

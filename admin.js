import { supabase, requireUser, getProfile, money, statusLabel, showMessage } from './supabase-client.js';
const body = document.getElementById('adminOrders');
const notice = document.getElementById('adminNotice');
let isAdmin = false;
const user = await requireUser();
if (user) {
  try {
    const profile = await getProfile(user.id);
    if (profile.role !== 'admin') { document.getElementById('adminWelcome').textContent = 'This account does not have administrator access.'; showMessage(notice, 'Access denied. Please sign in with the AM Digital Studio administrator account.', 'error'); body.innerHTML = '<tr><td colspan="7">Administrator access required.</td></tr>'; }
    else { isAdmin = true; document.getElementById('adminWelcome').textContent = `Signed in as ${profile.full_name || user.email}`; await loadOrders(); }
  } catch (error) { showMessage(notice, error.message, 'error'); }
}
async function loadOrders() {
  if (!isAdmin) return;
  body.innerHTML = '<tr><td colspan="7">Loading orders…</td></tr>';
  const { data, error } = await supabase.from('orders').select('id,tracking_number,user_id,customer_name,customer_email,customer_phone,order_type,service_name,package_name,project_title,total_amount,currency,status,payment_status,created_at').order('created_at', { ascending: false });
  if (error) { showMessage(notice, error.message, 'error'); body.innerHTML = '<tr><td colspan="7">Could not load orders.</td></tr>'; return; }
  const orders = data || [];
  document.getElementById('adminTotal').textContent = orders.length;
  document.getElementById('adminPending').textContent = orders.filter(o => o.status === 'pending').length;
  document.getElementById('adminCompleted').textContent = orders.filter(o => o.status === 'completed').length;
  if (!orders.length) { body.innerHTML = '<tr><td colspan="7">No orders have been submitted yet.</td></tr>'; return; }
  body.innerHTML = orders.map(o => `<tr data-id="${o.id}"><td><strong>${escapeHtml(o.tracking_number)}</strong><br><small>${new Date(o.created_at).toLocaleDateString()}</small></td><td>${escapeHtml(o.customer_name)}<br><small>${escapeHtml(o.customer_email || '')}</small></td><td>${escapeHtml(statusLabel(o.order_type))}</td><td>${money(o.total_amount,o.currency)}</td><td><select class="control order-status">${['pending','confirmed','in_progress','ready','completed','cancelled'].map(s => `<option value="${s}" ${o.status===s?'selected':''}>${statusLabel(s)}</option>`).join('')}</select></td><td><select class="control payment-status">${['unpaid','pending_verification','paid','refunded','failed'].map(s => `<option value="${s}" ${o.payment_status===s?'selected':''}>${statusLabel(s)}</option>`).join('')}</select></td><td><button class="btn small save-order" type="button">Save</button></td></tr>`).join('');
  body.querySelectorAll('.save-order').forEach(button => button.addEventListener('click', async () => {
    const row = button.closest('tr'); const id = row.dataset.id; button.disabled = true; button.textContent = 'Saving…';
    const status = row.querySelector('.order-status').value; const payment_status = row.querySelector('.payment-status').value;
    const { error: updateError } = await supabase.from('orders').update({ status, payment_status }).eq('id', id);
    button.disabled = false; button.textContent = 'Save';
    if (updateError) showMessage(notice, updateError.message, 'error');
    else { showMessage(notice, 'Order updated successfully.', 'success'); await loadOrders(); }
  }));
}
function escapeHtml(value='') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
document.getElementById('refreshOrders').addEventListener('click', loadOrders);
document.getElementById('logoutButton').addEventListener('click', async () => { await supabase.auth.signOut(); location.href = 'login.html'; });

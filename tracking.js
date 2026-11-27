import { supabase, money, statusLabel, showMessage } from './supabase-client.js';
const form = document.getElementById('trackingForm');
const numberInput = document.getElementById('trackingNumber');
const notice = document.getElementById('trackingNotice');
const result = document.getElementById('trackingResult');
const params = new URLSearchParams(location.search);
if (params.get('number')) numberInput.value = params.get('number');
form.addEventListener('submit', async (event) => {
  event.preventDefault(); result.hidden = true;
  const tracking = numberInput.value.trim().toUpperCase();
  const button = document.getElementById('trackButton'); button.disabled = true; button.textContent = 'Checking…';
  const { data, error } = await supabase.rpc('track_order', { p_tracking_number: tracking });
  button.disabled = false; button.textContent = 'Track Order';
  if (error) { showMessage(notice, `Unable to check this order: ${error.message}`, 'error'); return; }
  const order = Array.isArray(data) ? data[0] : data;
  if (!order) { showMessage(notice, 'No order was found with that tracking number. Please check it and try again.', 'error'); return; }
  notice.hidden = true;
  // Public lookup intentionally exposes only the current safe status, not private customer data.
  const timeline = `<div class="timeline-item"><strong>${escapeHtml(statusLabel(order.status))}</strong><small>Latest available status · ${new Date(order.updated_at).toLocaleString()}</small></div>`;
  result.innerHTML = `<article class="order-card"><div class="order-head"><div><span class="eyebrow">TRACKING RESULT</span><h2 style="margin:5px 0">${escapeHtml(order.tracking_number)}</h2></div><span class="pill">${escapeHtml(statusLabel(order.status))}</span></div><div class="order-meta"><span>Type: ${escapeHtml(statusLabel(order.order_type))}</span><span>Payment: ${escapeHtml(statusLabel(order.payment_status))}</span><span>Total: ${money(order.total_amount, order.currency)}</span></div>${order.service_name ? `<p><strong>Service:</strong> ${escapeHtml(order.service_name)}</p>` : ''}${order.package_name ? `<p><strong>Package:</strong> ${escapeHtml(order.package_name)}</p>` : ''}${order.project_title ? `<p><strong>Project:</strong> ${escapeHtml(order.project_title)}</p>` : ''}${order.estimated_completion ? `<p><strong>Estimated completion:</strong> ${new Date(order.estimated_completion+'T00:00:00').toLocaleDateString()}</p>` : ''}<h3>Progress history</h3><div class="timeline">${timeline}</div></article>`;
  result.hidden = false;
});
function escapeHtml(value='') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
if (numberInput.value) form.requestSubmit();

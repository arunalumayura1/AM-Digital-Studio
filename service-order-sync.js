import { supabase } from './supabase-client.js';

const notice = document.createElement('div');
notice.className = 'notice';
notice.style.cssText = 'max-width:900px;margin:16px auto;padding:12px 16px;border-radius:12px;';
const anchor = document.querySelector('main') || document.body;
anchor.prepend(notice);

function show(text, type = 'info') {
  notice.textContent = text;
  notice.className = `notice ${type}`;
  notice.hidden = false;
}

async function saveServiceOrder() {
  const existingTracking = localStorage.getItem('amds-service-tracking-number');
  if (existingTracking) {
    show(`Your order is saved. Tracking number: ${existingTracking}`, 'success');
    return;
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    show('Please sign in to save and track your service order. Redirecting to login…', 'error');
    const next = encodeURIComponent('/finalpay.html');
    setTimeout(() => location.href = `login.html?next=${next}`, 900);
    return;
  }

  const value = key => localStorage.getItem(key) || '';
  const customerName = value('customerName').trim();
  const customerEmail = value('customerEmail').trim() || user.email || '';
  const serviceName = value('serviceName').trim();
  const projectTitle = value('projectTitle').trim();
  const price = Number(String(value('selectedPrice') || '0').replace(/[^0-9.]/g, '')) || 0;

  if (!customerName || !serviceName || !projectTitle) {
    show('Some required order details are missing. Please return to the order form and complete them.', 'error');
    return;
  }

  show('Saving your service order…');
  const paid = value('paypalPaymentStatus') === 'COMPLETED';
  const { data, error } = await supabase.from('orders').insert({
    user_id: user.id,
    order_type: 'service',
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: value('customerWhatsApp') || null,
    customer_country: value('customerCountry') || null,
    service_name: serviceName,
    package_name: value('selectedPackage') || null,
    project_title: projectTitle,
    project_description: value('projectDescription') || null,
    delivery_type: value('selectedDelivery') || null,
    total_amount: price,
    currency: 'LKR',
    payment_status: paid ? 'paid' : 'unpaid',
    payment_method: paid ? 'paypal' : null,
    payment_reference: paid ? value('paypalOrderID') || null : null
  }).select('tracking_number').single();

  if (error) {
    console.error('Service order save failed:', error);
    show(`Could not save your order: ${error.message}`, 'error');
    return;
  }

  localStorage.setItem('amds-service-tracking-number', data.tracking_number);
  show(`Your service order has been saved. Tracking number: ${data.tracking_number}`, 'success');
}

// PayPal runs in the existing classic script; expose a narrow updater for its approval callback.
window.amdsUpdatePayment = async ({ orderID } = {}) => {
  const tracking = localStorage.getItem('amds-service-tracking-number');
  if (!tracking) throw new Error('The service order has not been saved yet.');
  const { error } = await supabase.from('orders').update({
    payment_status: 'paid',
    payment_method: 'paypal',
    payment_reference: orderID || localStorage.getItem('paypalOrderID') || null
  }).eq('tracking_number', tracking);
  if (error) throw error;
  show(`Payment updated. Tracking number: ${tracking}`, 'success');
};

saveServiceOrder().catch(error => {
  console.error(error);
  show(`Could not save your order: ${error.message || 'Unknown error'}`, 'error');
});

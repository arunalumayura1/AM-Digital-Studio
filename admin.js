
import {
    supabase,
    requireUser,
    getProfile,
    money,
    statusLabel,
    showMessage
} from './supabase-client.js';

const body = document.getElementById('adminOrders');
const notice = document.getElementById('adminNotice');

const archiveBody = document.getElementById('archivedCustomers');
const archiveNotice = document.getElementById('archiveNotice');
const archiveSearch = document.getElementById('archiveSearch');
const archiveCountryFilter = document.getElementById('archiveCountryFilter');

let isAdmin = false;
let archivedRecords = [];
let registeredCustomers = [];
let deletedAccounts = [];

// ========================================
// ADMIN AUTHENTICATION
// ========================================

const user = await requireUser();

if (user) {
    try {
        const profile = await getProfile(user.id);

        if (profile.role !== 'admin') {

            document.getElementById('adminWelcome').textContent =
                'This account does not have administrator access.';

            showMessage(
                notice,
                'Access denied. Please sign in with the AM Digital Studio administrator account.',
                'error'
            );

            body.innerHTML =
                '<tr><td colspan="7">Administrator access required.</td></tr>';

            archiveBody.innerHTML =
                '<tr><td colspan="7">Administrator access required.</td></tr>';

        } else {

            isAdmin = true;

            document.getElementById('adminWelcome').textContent =
                `Signed in as ${profile.full_name || user.email}`;

          await Promise.all([
    loadOrders(),
    loadArchivedCustomers(),
    loadRegisteredCustomers(),
    loadDeletedAccounts()
]);
        }

    } catch (error) {
        showMessage(notice, error.message, 'error');
    }
}


// ========================================
// LOAD ORDERS
// ========================================

async function loadOrders() {

    if (!isAdmin) return;

    body.innerHTML =
        '<tr><td colspan="7">Loading orders…</td></tr>';

    const { data, error } = await supabase
        .from('orders')
        .select(`
            id,
            tracking_number,
            user_id,
            customer_name,
            customer_email,
            customer_phone,
            order_type,
            service_name,
            package_name,
            project_title,
            total_amount,
            currency,
            status,
            payment_status,
            created_at
        `)
        .order('created_at', { ascending: false });

    if (error) {

        showMessage(notice, error.message, 'error');

        body.innerHTML =
            '<tr><td colspan="7">Could not load orders.</td></tr>';

        return;
    }

    const orders = data || [];

    document.getElementById('adminTotal').textContent =
        orders.length;

    document.getElementById('adminPending').textContent =
        orders.filter(o => o.status === 'pending').length;

    document.getElementById('adminCompleted').textContent =
        orders.filter(o => o.status === 'completed').length;

    if (!orders.length) {

        body.innerHTML =
            '<tr><td colspan="7">No orders have been submitted yet.</td></tr>';

        return;
    }

    body.innerHTML = orders.map(o => `
        <tr data-id="${escapeHtml(o.id)}">
            <td>
                <strong>${escapeHtml(o.tracking_number)}</strong>
                <br>
                <small>${formatDate(o.created_at)}</small>
            </td>

            
<td>
    ${escapeHtml(o.customer_name)}

    ${o.customer_name === 'Deleted Customer' ? `
        <br>
        <span style="
            display: inline-block;
            margin-top: 6px;
            padding: 3px 9px;
            border-radius: 20px;
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffe69c;
            font-size: 11px;
            font-weight: 700;
        ">
            DELETED ACCOUNT
        </span>
    ` : ''}

    <br>
    <small>${escapeHtml(o.customer_email || '')}</small>
</td>

            <td>${escapeHtml(statusLabel(o.order_type))}</td>

            <td>${money(o.total_amount, o.currency)}</td>

            <td>
                <select class="control order-status">
                    ${[
                        'pending',
                        'confirmed',
                        'in_progress',
                        'ready',
                        'completed',
                        'cancelled'
                    ].map(s => `
                        <option value="${s}"
                            ${o.status === s ? 'selected' : ''}>
                            ${escapeHtml(statusLabel(s))}
                        </option>
                    `).join('')}
                </select>
            </td>

            <td>
                <select class="control payment-status">
                    ${[
                        'unpaid',
                        'pending_verification',
                        'paid',
                        'refunded',
                        'failed'
                    ].map(s => `
                        <option value="${s}"
                            ${o.payment_status === s ? 'selected' : ''}>
                            ${escapeHtml(statusLabel(s))}
                        </option>
                    `).join('')}
                </select>
            </td>

           <td>
    <div style="display:flex;gap:8px;align-items:center;">
        <button class="btn small save-order" type="button">
            Save
        </button>

        <button
            class="btn small delete-order"
            type="button"
            style="background:#dc3545;color:white;border:none;"
        >
            Delete
        </button>
    </div>
</td>
        </tr>
    `).join('');

    body.querySelectorAll('.save-order').forEach(button => {

        button.addEventListener('click', async () => {

            const row = button.closest('tr');
            const id = row.dataset.id;

            button.disabled = true;
            button.textContent = 'Saving…';

            const status =
                row.querySelector('.order-status').value;

            const payment_status =
                row.querySelector('.payment-status').value;

            const { error: updateError } = await supabase
                .from('orders')
                .update({ status, payment_status })
                .eq('id', id);

            button.disabled = false;
            button.textContent = 'Save';

            if (updateError) {

                showMessage(notice, updateError.message, 'error');

            } else {

                showMessage(
                    notice,
                    'Order updated successfully.',
                    'success'
                );

                await loadOrders();
            }
        });


        // DELETE ORDER
body.querySelectorAll('.delete-order').forEach(button => {

    button.addEventListener('click', async () => {

        const row = button.closest('tr');
        const id = row.dataset.id;

        const trackingNumber =
            row.querySelector('td strong')?.textContent || 'this order';

        const confirmed = confirm(
            `Are you sure you want to permanently delete ${trackingNumber}?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        button.disabled = true;
        button.textContent = 'Deleting…';

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) {
            button.disabled = false;
            button.textContent = 'Delete';

            showMessage(notice, 'Could not delete order: ' + error.message, 'error');
            return;
        }

        showMessage(notice, 'Order permanently deleted.', 'success');

        await loadOrders();
    });
});
    });
}

// ========================================
// LOAD REGISTERED CUSTOMERS
// ========================================

async function loadRegisteredCustomers() {
    if (!isAdmin) return;

    const customerBody = document.getElementById('registeredCustomers');

    customerBody.innerHTML =
        '<tr><td colspan="3">Loading customers…</td></tr>';

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

    if (error) {
        customerBody.innerHTML =
            '<tr><td colspan="3">Could not load customers.</td></tr>';

        document.getElementById('registeredCustomersCount').textContent = '—';

        showMessage(notice, 'Could not load registered customers: ' + error.message, 'error');
        return;
    }

    registeredCustomers = data || [];

    document.getElementById('registeredCustomersCount').textContent =
        registeredCustomers.length;

    renderRegisteredCustomers();
}


function renderRegisteredCustomers() {
    const customerBody = document.getElementById('registeredCustomers');

    const query = document.getElementById('registeredCustomerSearch')
        .value.trim().toLowerCase();

    const filtered = registeredCustomers.filter(customer =>
        [
            customer.full_name,
            customer.email
        ].some(value =>
            String(value || '').toLowerCase().includes(query)
        )
    );

    if (!filtered.length) {
        customerBody.innerHTML =
            '<tr><td colspan="3">No registered customers found.</td></tr>';
        return;
    }

    customerBody.innerHTML = filtered.map(customer => `
        <tr>
            <td>${escapeHtml(customer.full_name || 'N/A')}</td>
            <td>${escapeHtml(customer.email || 'N/A')}</td>
            <td>${formatDate(customer.created_at)}</td>
        </tr>
    `).join('');
}


// ========================================
// LOAD DELETED CUSTOMER ACCOUNTS
// ========================================

async function loadDeletedAccounts() {
    if (!isAdmin) return;

    const deletedBody = document.getElementById('deletedAccounts');

    deletedBody.innerHTML =
        '<tr><td colspan="4">Loading deleted accounts…</td></tr>';

    const { data, error } = await supabase.rpc(
        'get_deleted_customer_accounts'
    );

    if (error) {
        deletedBody.innerHTML =
            '<tr><td colspan="4">Could not load deleted accounts.</td></tr>';

        document.getElementById('deletedAccountsCount').textContent = '—';

        showMessage(notice, 'Could not load deleted accounts: ' + error.message, 'error');
        return;
    }

    deletedAccounts = data || [];

    document.getElementById('deletedAccountsCount').textContent =
        deletedAccounts.length;

    renderDeletedAccounts();
}


function renderDeletedAccounts() {
    const deletedBody = document.getElementById('deletedAccounts');

    const query = document.getElementById('deletedAccountSearch')
        .value.trim().toLowerCase();

    const filtered = deletedAccounts.filter(customer =>
        [
            customer.full_name,
            customer.email
        ].some(value =>
            String(value || '').toLowerCase().includes(query)
        )
    );

    if (!filtered.length) {
        deletedBody.innerHTML =
            '<tr><td colspan="4">No deleted customer accounts found.</td></tr>';
        return;
    }

    deletedBody.innerHTML = filtered.map(customer => `
        <tr>
            <td>${escapeHtml(customer.full_name || 'N/A')}</td>
            <td>${escapeHtml(customer.email || 'N/A')}</td>
            <td>${formatDate(customer.registered_at)}</td>
            <td>${formatDate(customer.deleted_at)}</td>
        </tr>
    `).join('');
}
// ========================================
// LOAD ARCHIVED CUSTOMERS
// ========================================

async function loadArchivedCustomers() {

    if (!isAdmin) return;

    archiveBody.innerHTML =
        '<tr><td colspan="7">Loading archived records…</td></tr>';

    const { data, error } = await supabase
        .from('deleted_customer_data')
        .select(`
            id,
            original_user_id,
            tracking_number,
            customer_name,
            customer_email,
            customer_phone,
            customer_country,
            delivery_address,
            customer_note,
            archived_at
        `)
        .order('archived_at', { ascending: false });

    if (error) {

        showMessage(
            archiveNotice,
            'Could not load archived records: ' + error.message,
            'error'
        );

        archiveBody.innerHTML =
            '<tr><td colspan="7">Unable to load archived records.</td></tr>';

        document.getElementById('archivedTotal').textContent = '—';
        document.getElementById('deletedCustomersCount').textContent = '—';
        document.getElementById('archivedOrdersCount').textContent = '—';

        return;
    }

    archivedRecords = data || [];

    // Count unique deleted customer accounts.
    const deletedCustomerIds = new Set(
        archivedRecords
            .map(record => record.original_user_id)
            .filter(Boolean)
    );

    document.getElementById('deletedCustomersCount').textContent =
        deletedCustomerIds.size;

    // Each archived row represents one archived order.
    document.getElementById('archivedOrdersCount').textContent =
        archivedRecords.length;

    document.getElementById('archivedTotal').textContent =
        archivedRecords.length;

    populateCountryFilter();

    renderArchivedCustomers();

    if (archivedRecords.length === 0) {

        showMessage(
            archiveNotice,
            'No deleted customer records have been archived yet.',
            'info'
        );

    } else {

        archiveNotice.hidden = true;
    }
}


// ========================================
// COUNTRY FILTER OPTIONS
// ========================================

function populateCountryFilter() {

    const selectedCountry = archiveCountryFilter.value;

    const countries = [
        ...new Set(
            archivedRecords
                .map(record => String(record.customer_country || '').trim())
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b));

    archiveCountryFilter.innerHTML =
        '<option value="">All Countries</option>';

    countries.forEach(country => {

        const option = document.createElement('option');

        option.value = country;
        option.textContent = country;

        archiveCountryFilter.appendChild(option);
    });

    if (countries.includes(selectedCountry)) {
        archiveCountryFilter.value = selectedCountry;
    }
}


// ========================================
// SEARCH + COUNTRY FILTER
// ========================================

function renderArchivedCustomers() {

    if (!isAdmin) return;

    const query = archiveSearch.value
        .trim()
        .toLowerCase();

    const selectedCountry = archiveCountryFilter.value;

    const filtered = archivedRecords.filter(record => {

        const matchesSearch = [
            record.tracking_number,
            record.customer_name,
            record.customer_email,
            record.customer_phone,
            record.customer_country
        ].some(value =>
            String(value || '').toLowerCase().includes(query)
        );

        const matchesCountry =
            !selectedCountry ||
            String(record.customer_country || '').trim() === selectedCountry;

        return matchesSearch && matchesCountry;
    });

    if (!filtered.length) {

        archiveBody.innerHTML = `
            <tr>
                <td colspan="7">
                    No matching archived customer records found.
                </td>
            </tr>
        `;

        return;
    }

    archiveBody.innerHTML = filtered.map(record => `
        <tr>
            <td>
                <strong>
                    ${escapeHtml(record.tracking_number || 'N/A')}
                </strong>
            </td>

            <td>
                ${escapeHtml(record.customer_name || 'N/A')}
                <br>
                <small>
                    ${escapeHtml(record.customer_email || 'No email')}
                </small>
            </td>

            <td>${escapeHtml(record.customer_phone || 'N/A')}</td>

            <td>${escapeHtml(record.customer_country || 'N/A')}</td>

            <td>${escapeHtml(record.delivery_address || 'N/A')}</td>

            <td>${escapeHtml(record.customer_note || 'No note')}</td>

            <td>${formatDate(record.archived_at)}</td>
        </tr>
    `).join('');
}


// ========================================
// EVENT LISTENERS
// ========================================

archiveSearch.addEventListener('input', renderArchivedCustomers);

archiveCountryFilter.addEventListener('change', renderArchivedCustomers);

document.getElementById('registeredCustomerSearch')
    .addEventListener('input', renderRegisteredCustomers);

document.getElementById('deletedAccountSearch')
    .addEventListener('input', renderDeletedAccounts);
// ========================================
// HELPERS
// ========================================

function escapeHtml(value = '') {

    return String(value).replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}


function formatDate(value) {

    if (!value) return 'N/A';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'N/A';

    return date.toLocaleString();
}


// ========================================
// REFRESH
// ========================================

document.getElementById('refreshOrders')
    .addEventListener('click', async () => {

        if (!isAdmin) return;

      await Promise.all([
    loadOrders(),
    loadArchivedCustomers(),
    loadRegisteredCustomers(),
    loadDeletedAccounts()
]);
    });


// ========================================
// LOGOUT
// ========================================

document.getElementById('logoutButton')
    .addEventListener('click', async () => {

        await supabase.auth.signOut();

        location.href = 'login.html';
    });

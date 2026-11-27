
import { supabase, requireUser, getProfile } from './supabase-client.js';

const notice = document.getElementById('accountNotice');

function showNotice(message, type = 'info') {
    notice.textContent = message;
    notice.className = `notice ${type}`;
    notice.hidden = false;
}

const user = await requireUser();
let currentProfile = null;

if (user) {
    try {
        currentProfile = await getProfile(user.id);

        document.getElementById('welcomeText').textContent =
            `Signed in as ${currentProfile.full_name || user.email}`;

        // Only customer accounts may request deletion.
        const deleteButton = document.getElementById('deleteAccountButton');

        if (currentProfile.role === 'customer') {
            deleteButton.disabled = false;
        } else {
            deleteButton.disabled = true;
        }

    } catch (error) {
        showNotice(error.message, 'error');
    }
}


// ========================================
// CHANGE PASSWORD
// ========================================

document.getElementById('changePasswordForm')
    .addEventListener('submit', async (event) => {

        event.preventDefault();

        if (!user) return;

        const currentPassword =
            document.getElementById('currentPassword').value;

        const newPassword =
            document.getElementById('newPassword').value;

        const confirmPassword =
            document.getElementById('confirmPassword').value;

        if (newPassword.length < 8) {
            showNotice('New password must contain at least 8 characters.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotice('New passwords do not match.', 'error');
            return;
        }

        if (currentPassword === newPassword) {
            showNotice('Choose a different password.', 'error');
            return;
        }

        const button = event.submitter;
        button.disabled = true;
        button.textContent = 'Updating...';

        try {
            const { error: signInError } =
                await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: currentPassword
                });

            if (signInError) throw signInError;

            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            document.getElementById('changePasswordForm').reset();

            showNotice('Your password has been updated successfully!', 'success');

        } catch (error) {
            showNotice(error.message, 'error');

        } finally {
            button.disabled = false;
            button.textContent = 'Update Password';
        }
    });


// ========================================
// PASSWORD RESET EMAIL
// ========================================

document.getElementById('sendResetEmail')
    .addEventListener('click', async (event) => {

        if (!user?.email) {
            showNotice('Your account email could not be found.', 'error');
            return;
        }

        const button = event.currentTarget;
        button.disabled = true;
        button.textContent = 'Sending...';

        try {
            const redirectUrl =
                new URL('reset-password.html', window.location.href).href;

            const { error } = await supabase.auth.resetPasswordForEmail(
                user.email,
                { redirectTo: redirectUrl }
            );

            if (error) throw error;

            showNotice(
                `Password reset email sent to ${user.email}. Please check your inbox.`,
                'success'
            );

        } catch (error) {
            showNotice(error.message, 'error');

        } finally {
            button.disabled = false;
            button.textContent = 'Send Reset Email';
        }
    });


// ========================================
// PREMIUM BLUE GLASS CONFIRMATION MODAL
// ========================================

function confirmDeleteAccount() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');

        modal.className = 'am-delete-overlay';

        modal.innerHTML = `
            <div class="am-delete-modal" role="dialog"
                 aria-modal="true"
                 aria-labelledby="amDeleteTitle">

                <div class="am-delete-icon">!</div>

                <span class="am-delete-eyebrow">
                    AM DIGITAL STUDIO
                </span>

                <h2 id="amDeleteTitle">Delete Account?</h2>

                <p>
                    Are you sure you want to permanently delete
                    your AM Digital Studio account?
                </p>

                <div class="am-delete-info">
                    <span>ⓘ</span>
                    Your order history will be retained securely
                    for administrative reference.
                </div>

                <div class="am-delete-actions">
                    <button type="button"
                            class="am-delete-cancel">
                        Cancel
                    </button>

                    <button type="button"
                            class="am-delete-confirm">
                        Yes, Delete
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const finish = (confirmed) => {
            modal.classList.remove('show');

            setTimeout(() => modal.remove(), 180);

            document.removeEventListener('keydown', handleKeydown);
            resolve(confirmed);
        };

        const handleKeydown = (event) => {
            if (event.key === 'Escape') {
                finish(false);
            }
        };

        modal.querySelector('.am-delete-cancel')
            .addEventListener('click', () => finish(false));

        modal.querySelector('.am-delete-confirm')
            .addEventListener('click', () => finish(true));

        modal.addEventListener('click', (event) => {
            if (event.target === modal) finish(false);
        });

        document.addEventListener('keydown', handleKeydown);

        requestAnimationFrame(() => {
            modal.classList.add('show');
            modal.querySelector('.am-delete-cancel').focus();
        });
    });
}

// ========================================
// ACCOUNT DELETION
// ========================================

document.getElementById('deleteAccountButton')
    .addEventListener('click', async (event) => {

        if (!user || currentProfile?.role !== 'customer') {
            showNotice('Only customer accounts can be deleted.', 'error');
            return;
        }

        const passwordInput =
            document.getElementById('deleteAccountPassword');

        const password = passwordInput.value;

        if (!password) {
            showNotice('Please enter your current password.', 'error');
            passwordInput.focus();
            return;
        }
const confirmed = await confirmDeleteAccount();

if (!confirmed) return;

        const button = event.currentTarget;
        button.disabled = true;
        button.textContent = 'Deleting Account...';

        try {
            const { data: sessionData, error: sessionError } =
                await supabase.auth.getSession();

            if (sessionError) throw sessionError;

            if (!sessionData.session) {
                throw new Error('Your login session has expired. Please sign in again.');
            }

            const { data, error } =
                await supabase.functions.invoke(
                    'delete-customer-account',
                    {
                        body: { password }
                    }
                );

            if (error) {
                let message = error.message;

                if (error.context) {
                    try {
                        const result = await error.context.json();
                        if (result.error) message = result.error;
                    } catch (_) {}
                }

                throw new Error(message);
            }

            if (!data?.success) {
                throw new Error(data?.error || 'Account deletion failed.');
            }

            passwordInput.value = '';

            showNotice(
                'Your account has been deleted successfully. Redirecting...',
                'success'
            );

            // Clear the deleted account's local session.
            await supabase.auth.signOut();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2500);

        } catch (error) {
            showNotice(error.message, 'error');

            button.disabled = false;
            button.textContent = 'Delete My Account';
        }
    });


// ========================================
// LOGOUT
// ========================================

document.getElementById('logoutButton')
    .addEventListener('click', async () => {

        const { error } = await supabase.auth.signOut();

        if (error) {
            showNotice(error.message, 'error');
            return;
        }

        window.location.href = 'login.html';
    });



import { supabase, requireUser, getProfile } from './supabase-client.js';

const notice = document.getElementById('accountNotice');

function showNotice(message, type = 'info') {
    notice.textContent = message;
    notice.className = `notice ${type}`;
    notice.hidden = false;
}

const user = await requireUser();

if (user) {
    try {
        const profile = await getProfile(user.id);

        document.getElementById('welcomeText').textContent =
            `Signed in as ${profile.full_name || user.email}`;

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
            // Verify the current password first.
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


// ========================================
// ACCOUNT DELETION
// ========================================

// Kept disabled until secure server-side deletion
// and order-data retention are configured.

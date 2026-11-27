
import { supabase } from './supabase-client.js';

const notice = document.getElementById('resetNotice');
const form = document.getElementById('resetPasswordForm');

let recoverySession = null;

function showNotice(message, type = 'info') {
    notice.textContent = message;
    notice.className = `notice ${type}`;
    notice.hidden = false;
}

// Listen for Supabase password recovery session
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' && session) {
        recoverySession = session;
        form.hidden = false;
        showNotice('Recovery link verified. You can now create a new password.', 'success');
    }
});

// Check whether the recovery link created a valid session
async function initialize() {
    form.hidden = true;

    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session) {
            recoverySession = data.session;
            form.hidden = false;
            showNotice('Recovery link verified. Enter your new password.', 'success');
        } else {
            showNotice(
                'Invalid or expired reset link. Please request a new password reset email.',
                'error'
            );
        }
    } catch (error) {
        showNotice(error.message, 'error');
    }
}

await initialize();

// Update password
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!recoverySession) {
        showNotice('Your reset session is invalid. Please request a new reset email.', 'error');
        return;
    }

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword.length < 8) {
        showNotice('Password must contain at least 8 characters.', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotice('Passwords do not match.', 'error');
        return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Updating...';

    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        form.reset();
        form.hidden = true;

        showNotice(
            'Your password has been changed successfully! Redirecting to login...',
            'success'
        );

        await supabase.auth.signOut();

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2500);

    } catch (error) {
        showNotice(error.message, 'error');
    } finally {
        button.disabled = false;
        button.textContent = 'Update Password';
    }
});

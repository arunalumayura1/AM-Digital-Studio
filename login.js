
import { supabase, showMessage } from './supabase-client.js';

const form = document.getElementById('loginForm');
const notice = document.getElementById('loginNotice');
const button = document.getElementById('loginButton');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const forgotLink = document.getElementById('forgotPasswordLink');

// NORMAL LOGIN
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    button.disabled = true;
    button.textContent = 'Signing in…';

    const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.value.trim(),
        password: passwordInput.value
    });

    if (error) {
        showMessage(notice, error.message, 'error');
        button.disabled = false;
        button.textContent = 'Sign In';
        return;
    }

    location.href = 'home.html';
});


// FORGOT PASSWORD
forgotLink.addEventListener('click', async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    // Check email address
    if (!email || !emailInput.validity.valid) {
        showMessage(
            notice,
            'Please enter your valid email address first.',
            'error'
        );

        emailInput.focus();
        return;
    }

    forgotLink.style.pointerEvents = 'none';
    forgotLink.textContent = 'Sending reset email…';

    const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
            redirectTo: `${window.location.origin}/reset-password.html`
        }
    );

    if (error) {
        showMessage(notice, error.message, 'error');
    } else {
        showMessage(
            notice,
            'Password reset link sent! Please check your email inbox.',
            'success'
        );
    }

    forgotLink.textContent = 'Forgot Password?';
    forgotLink.style.pointerEvents = 'auto';
});

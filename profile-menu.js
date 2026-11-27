
import { supabase } from './supabase-client.js';

// Initialize when the page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileMenu);
} else {
    initProfileMenu();
}

async function initProfileMenu() {
const navbar = document.querySelector('.navbar');
if (!navbar) return;

const navContainer = navbar.querySelector('.nav-container');

// Service pages use nav-container.
// Index page uses navbar directly.
const profileHost = navContainer || navbar;

const menu = navbar.querySelector('.nav-links, #navLinks');
    /* =================================
       CREATE PROFILE MENU
    ================================= */

    const wrapper = document.createElement('div');
    wrapper.className = 'profile-wrapper';

    wrapper.innerHTML = `
        <button class="profile-avatar" type="button"
                aria-label="Account menu"
                aria-expanded="false">
            <span class="profile-initial">?</span>
        </button>

        <div class="profile-dropdown" hidden>
            <div class="profile-user">

                <div class="profile-avatar profile-avatar-large">
                    <span class="profile-initial">?</span>
                </div>

                <div class="profile-user-info">
                    <strong class="profile-name">Welcome</strong>
                    <small class="profile-email"></small>
                </div>

            </div>

            <div class="profile-divider"></div>
            <div class="profile-actions"></div>
        </div>
    `;

profileHost.appendChild(wrapper);

    const avatar = wrapper.querySelector('button.profile-avatar');
    const dropdown = wrapper.querySelector('.profile-dropdown');
    const actions = wrapper.querySelector('.profile-actions');

    /* =================================
       PROFILE DROPDOWN
    ================================= */

    function closeProfileMenu() {
        dropdown.hidden = true;
        avatar.setAttribute('aria-expanded', 'false');
    }

    avatar.addEventListener('click', function (event) {
        event.stopPropagation();

        const isOpen = dropdown.hidden;

        dropdown.hidden = !isOpen;

        avatar.setAttribute(
            'aria-expanded',
            String(isOpen)
        );
    });

    dropdown.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    document.addEventListener('click', function (event) {
        if (!wrapper.contains(event.target)) {
            closeProfileMenu();
        }
    });

    /* =================================
       PROFILE ACTIONS
    ================================= */

    function addAction(label, href, icon) {
        const link = document.createElement('a');

        link.className = 'profile-action';
        link.href = href;
        link.innerHTML = `<span>${icon}</span> ${label}`;

        actions.appendChild(link);

        return link;
    }

    function addMobileActions(links) {
        if (!menu) return;

        const section = document.createElement('div');
        section.className = 'profile-mobile-links';

        links.forEach(([label, href]) => {
            const link = document.createElement('a');

            link.href = href;
            link.textContent = label;

            section.appendChild(link);
        });

        menu.appendChild(section);
    }

    /* =================================
       LOGOUT
    ================================= */

    async function logout() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            alert(error.message);
            return;
        }

        window.location.href = 'index.html';
    }

    /* =================================
       GET SUPABASE USER
    ================================= */

    try {

        const { data, error } = await supabase.auth.getUser();

        if (error) throw error;

        const user = data.user;

        // Guest account
        if (!user) {

            wrapper.querySelector('.profile-name').textContent =
                'Welcome Guest';

            wrapper.querySelector('.profile-email').textContent =
                'Sign in to your account';

            addAction('Sign Up', 'signup.html', '✚');
            addAction('Login', 'login.html', '↪');

            addMobileActions([
                ['Sign Up', 'signup.html'],
                ['Login', 'login.html']
            ]);

            return;
        }

        // Logged-in account
      const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, email, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

        if (profileError) {
            console.error('Profile loading error:', profileError);
        }

        const name =
            profile?.full_name ||
            user.user_metadata?.full_name ||
            'My Account';

        const initial = name.trim().charAt(0).toUpperCase();

      // Display profile photo or default initial
wrapper.querySelectorAll('.profile-avatar').forEach(el => {
    el.innerHTML = '';

    if (profile?.avatar_url) {
        const img = document.createElement('img');

        img.src = profile.avatar_url;
        img.alt = 'Profile Picture';

        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';

        el.appendChild(img);

    } else {
        const span = document.createElement('span');

        span.className = 'profile-initial';
        span.textContent = initial || 'A';

        el.appendChild(span);
    }
});

        wrapper.querySelector('.profile-name').textContent = name;

        wrapper.querySelector('.profile-email').textContent =
            user.email || '';

       addAction('My Orders', 'my-orders.html', '▣');
addAction('Track Order', 'tracking.html', '⌕');
addAction('Account Settings', 'account-settings.html', '⚙');

const logoutLink = addAction('Logout', '#', '↪');

        logoutLink.addEventListener('click', function (event) {
            event.preventDefault();
            logout();
        });

addMobileActions([
    ['My Orders', 'my-orders.html'],
    ['Track Order', 'tracking.html'],
    ['Account Settings', 'account-settings.html']
]);
        if (menu) {

            const logoutItem = document.createElement('div');
            logoutItem.className = 'profile-mobile-logout';

            const logoutButton = document.createElement('button');
            logoutButton.type = 'button';
            logoutButton.textContent = 'Logout';

            logoutButton.addEventListener('click', logout);

            logoutItem.appendChild(logoutButton);
            menu.appendChild(logoutItem);
        }


    } catch (error) {

        console.error('Account menu error:', error);

        // Show Guest Menu if account information cannot be loaded
        wrapper.querySelector('.profile-name').textContent =
            'Welcome Guest';

        wrapper.querySelector('.profile-email').textContent =
            'Sign in to your account';

        addAction('Sign Up', 'signup.html', '✚');
        addAction('Login', 'login.html', '↪');

        addMobileActions([
            ['Sign Up', 'signup.html'],
            ['Login', 'login.html']
        ]);
    }
}


import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', initProfileMenu);

async function initProfileMenu() {

    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const menu = navbar.querySelector('.nav-links');
    const menuToggle = navbar.querySelector('#menuToggle');

    // Mobile hamburger
    if (menu && menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('active');

            menuToggle.setAttribute(
                'aria-expanded',
                String(isOpen)
            );

            menuToggle.innerHTML = isOpen
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });
    }

    // Create profile menu
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

    navbar.appendChild(wrapper);

    const avatar = wrapper.querySelector('.profile-avatar');
    const dropdown = wrapper.querySelector('.profile-dropdown');
    const actions = wrapper.querySelector('.profile-actions');

    function closeMenu() {
        dropdown.hidden = true;
        avatar.setAttribute('aria-expanded', 'false');
    }

    avatar.addEventListener('click', () => {
        dropdown.hidden = !dropdown.hidden;
        avatar.setAttribute(
            'aria-expanded',
            String(!dropdown.hidden)
        );
    });

    document.addEventListener('click', event => {
        if (!wrapper.contains(event.target)) closeMenu();
    });

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

    async function logout() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            alert(error.message);
            return;
        }

        window.location.href = 'index.html';
    }

    const { data: { user }, error } =
        await supabase.auth.getUser();

    if (error) console.error(error);

    // Guest user
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

    // Logged-in user
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .maybeSingle();

    const name =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        'My Account';

    const initial = name.trim().charAt(0).toUpperCase();

    wrapper.querySelectorAll('.profile-initial')
        .forEach(el => {
            el.textContent = initial || 'A';
        });

    wrapper.querySelector('.profile-name').textContent = name;
    wrapper.querySelector('.profile-email').textContent =
        user.email || '';

    addAction('My Orders', 'my-orders.html', '▣');
    addAction('Track Order', 'tracking.html', '⌕');

    const logoutLink = addAction('Logout', '#', '↪');

    logoutLink.addEventListener('click', event => {
        event.preventDefault();
        logout();
    });

    addMobileActions([
        ['My Orders', 'my-orders.html'],
        ['Track Order', 'tracking.html']
    ]);

    if (menu) {
        const logoutItem = document.createElement('div');
        logoutItem.className = 'profile-mobile-logout';

        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = 'Logout';
        button.addEventListener('click', logout);

        logoutItem.appendChild(button);
        menu.appendChild(logoutItem);
    }
}

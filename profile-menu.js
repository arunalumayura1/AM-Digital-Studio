
import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', initProfileMenu);

async function initProfileMenu() {
    const navbar = document.querySelector(
        '.navbar, .store-navbar, .site-header nav'
    );

    if (!navbar) return;

    const menu = navbar.querySelector(
        '.nav-links, .nav-menu, .am-nav, .tools-nav-links'
    );

    // Create profile button
    const wrapper = document.createElement('div');
    wrapper.className = 'profile-wrapper';

    wrapper.innerHTML = `
        <button class="profile-avatar" type="button"
                aria-label="Open account menu"
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

    document.addEventListener('click', (event) => {
        if (!wrapper.contains(event.target)) closeMenu();
    });

    // Account menu links
    function addAction(label, href, icon) {
        const link = document.createElement('a');
        link.className = 'profile-action';
        link.href = href;
        link.innerHTML = `<span>${icon}</span> ${label}`;
        actions.appendChild(link);
        return link;
    }

    const { data: { user }, error } =
        await supabase.auth.getUser();

    if (error) console.error(error);

    if (!user) {
        wrapper.querySelector('.profile-initial').textContent = '?';
        wrapper.querySelector('.profile-name').textContent =
            'Welcome Guest';

        wrapper.querySelector('.profile-email').textContent =
            'Sign in to your account';

        addAction('Sign Up', 'signup.html', '✚');
        addAction('Login', 'login.html', '↪');

        addMobileActions(menu, [
            ['Sign Up', 'signup.html'],
            ['Login', 'login.html']
        ]);

        return;
    }

    // Get customer's profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .maybeSingle();

    const name =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        'My Account';

    const email = user.email || '';

    const initial = name.trim().charAt(0).toUpperCase();

    wrapper.querySelectorAll('.profile-initial')
        .forEach(el => el.textContent = initial || 'A');

    wrapper.querySelector('.profile-name').textContent = name;
    wrapper.querySelector('.profile-email').textContent = email;

    addAction('My Orders', 'my-orders.html', '▣');
    addAction('Track Order', 'tracking.html', '⌕');

    const logout = addAction('Logout', '#', '↪');

    logout.addEventListener('click', async (event) => {
        event.preventDefault();

        const { error } = await supabase.auth.signOut();

        if (error) {
            alert(error.message);
            return;
        }

        window.location.href = 'index.html';
    });

    addMobileActions(menu, [
        ['My Orders', 'my-orders.html'],
        ['Track Order', 'tracking.html']
    ]);

    if (menu) {
        const logoutItem = document.createElement('li');
        logoutItem.className = 'profile-mobile-logout';

        const logoutButton = document.createElement('button');
        logoutButton.type = 'button';
        logoutButton.textContent = 'Logout';

        logoutButton.addEventListener('click', async () => {
            const { error } = await supabase.auth.signOut();

            if (error) {
                alert(error.message);
                return;
            }

            window.location.href = 'index.html';
        });

        logoutItem.appendChild(logoutButton);
        menu.appendChild(logoutItem);
    }
}

function addMobileActions(menu, links) {
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

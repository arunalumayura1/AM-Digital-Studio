
document.addEventListener('DOMContentLoaded', () => {

    // Smooth page entrance
    document.body.classList.add('page-loaded');

    // Prevent accidental double-click navigation
    const startButton = document.querySelector('.get-started-btn');

    if (startButton) {
        startButton.addEventListener('click', () => {
            startButton.classList.add('loading');
        });
    }

    // Current year in footer
    const footerYear = document.querySelector('.welcome-footer');

    if (footerYear) {
        footerYear.innerHTML = footerYear.innerHTML.replace(
            '© 2026',
            `© ${new Date().getFullYear()}`
        );
    }

});


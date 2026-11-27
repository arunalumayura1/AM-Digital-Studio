const savedTheme = localStorage.getItem('amds-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('accountThemeToggle');
  if (!button) return;
  const paint = () => { const dark = document.documentElement.getAttribute('data-theme') === 'dark'; button.textContent = dark ? '☀ Light Mode' : '☾ Dark Mode'; };
  paint();
  button.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('amds-theme', next);
    paint();
  });
});

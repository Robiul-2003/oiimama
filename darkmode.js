function applyDarkMode(enabled) {
    document.body.classList.toggle('dark-mode', enabled);
}

// পেজ খুললেই আগের সেটিংস চালু হবে
applyDarkMode(localStorage.getItem('darkMode') === 'true');

// Settings-এর checkbox থাকলে কাজ করবে
document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('darkToggle');

    if (toggle) {
        toggle.checked = localStorage.getItem('darkMode') === 'true';

        toggle.addEventListener('change', function () {
            localStorage.setItem('darkMode', this.checked);
            applyDarkMode(this.checked);
        });
    }
});
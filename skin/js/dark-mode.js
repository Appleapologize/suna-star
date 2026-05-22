// Function to apply theme based on local storage
function applyThemeFromStorage() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
        document.documentElement.classList.add('theme--dark');
        toggleButton.firstElementChild.classList.add('dark-mode-toggle__icon--moon');
    } else {
        document.documentElement.classList.remove('theme--dark');
        toggleButton.firstElementChild.classList.remove('dark-mode-toggle__icon--moon');
    }
}

// Select the button element
const toggleButton = document.querySelector('button');

// Apply theme on page load
applyThemeFromStorage();

// Add an event listener for the button
toggleButton.addEventListener('click', (e) => {
    // Toggle the moon icon class on the button
    e.currentTarget.firstElementChild.classList.toggle('dark-mode-toggle__icon--moon');

    // Toggle the dark theme on the body
    document.documentElement.classList.toggle('theme--dark');

    // Save the current theme state to local storage
    if (document.documentElement.classList.contains('theme--dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// Load existing users from localStorage
const loadUsersFromLocalStorage = () => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
        return JSON.parse(storedUsers);
    }
    return [];
};

// Initialize the users array with data from localStorage
const users = loadUsersFromLocalStorage();

// Function to handle form submission
function handleFormSubmit(event, player) {
    event.preventDefault(); // Prevent the default form submission

    const form = event.target;
    const username = form.querySelector('input[name="username"]').value;
    const password = form.querySelector('input[name="password"]').value;

    // Create a user object
    const user = {
        username,
        password,
        player
    };

    // Add user to the array
    users.push(user);

    // Save users array to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Optionally, reset the form
    form.reset();
}

// Add event listeners to sign-up forms
document.getElementById('player1-signup-form').addEventListener('submit', (event) => handleFormSubmit(event, 'Player 1'));
document.getElementById('player2-signup-form').addEventListener('submit', (event) => handleFormSubmit(event, 'Player 2'));

// Optionally, add event listeners for login forms if needed
document.getElementById('player1-login-form').addEventListener('submit', (event) => handleFormSubmit(event, 'Player 1'));
document.getElementById('player2-login-form').addEventListener('submit', (event) => handleFormSubmit(event, 'Player 2'));

// Handle switching between sign-up and login forms
document.getElementById('player1-switch-to-login').addEventListener('click', () => {
    document.getElementById('player1-signup-container').classList.add('hidden');
    document.getElementById('player1-login-container').classList.remove('hidden');
});

document.getElementById('player1-switch-to-signup').addEventListener('click', () => {
    document.getElementById('player1-login-container').classList.add('hidden');
    document.getElementById('player1-signup-container').classList.remove('hidden');
});

document.getElementById('player2-switch-to-login').addEventListener('click', () => {
    document.getElementById('player2-signup-container').classList.add('hidden');
    document.getElementById('player2-login-container').classList.remove('hidden');
});

document.getElementById('player2-switch-to-signup').addEventListener('click', () => {
    document.getElementById('player2-login-container').classList.add('hidden');
    document.getElementById('player2-signup-container').classList.remove('hidden');
});
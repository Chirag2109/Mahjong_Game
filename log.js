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

// Function to handle form submission (signup)
function handleSignupForm(event, score) {
    event.preventDefault(); // Prevent the default form submission

    const form = event.target;
    const username = form.querySelector('input[name="username"]').value;
    const password = form.querySelector('input[name="password"]').value;

    // Function to validate username availability
    const isUsernameAvailable = !users.some(existingUser => existingUser.username === username);

    // Function to validate username (validity and uniqueness)
    function isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._]{2,}$/; // Starts with a letter, min 3 characters, allows letters, digits, dots, underscores
        const consecutiveDotUnderscoreRegex = /[._]{2}/; // No consecutive dots or underscores
        return usernameRegex.test(username) && !consecutiveDotUnderscoreRegex.test(username);
    }

    // Function to validate the password strength
    function isStrongPassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return passwordRegex.test(password);
    }

    // Validate username availability
    if (!isUsernameAvailable) {
        alert('Username is already taken. Please choose a different one.');
        return;
    }

    // Validate username strength
    if (!isValidUsername(username)) {
        alert('Invalid username! Username must be at least 3 characters long, start with a letter, and can contain letters, numbers, dots, or underscores. No consecutive dots or underscores allowed.');
        return;
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
        alert('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
        return;
    }

    // If all checks pass, create the user object
    const user = {
        username,
        password,
        score
    };

    // Add user to the array
    users.push(user);

    // Save users array to localStorage
    localStorage.setItem('users', JSON.stringify(users));

    // Optionally, reset the form
    form.reset();

    // Show success message
    alert('Signup successful!');
}

// Add event listeners to sign-up forms
document.getElementById('player1-signup-form').addEventListener('submit', (event) => handleSignupForm(event, 0));
document.getElementById('player2-signup-form').addEventListener('submit', (event) => handleSignupForm(event, 0));

// Variables to track logged-in players
let loggedInPlayers = [];

// Function to handle form submission (login)
function handleLoginForm(event) {
    event.preventDefault(); // Prevent the default form submission

    const form = event.target;
    const username = form.querySelector('input[name="username"]').value;
    const password = form.querySelector('input[name="password"]').value;

    // Check if the submitted user exists in the users array
    const existingUser = users.find(user => user.username === username && user.password === password);

    if (existingUser) {
        // Check if the user is already logged in
        if (loggedInPlayers.some(player => player.username === existingUser.username)) {
            alert('This player is already logged in.');
            return;
        }

        // Add logged-in user to the loggedInPlayers array
        loggedInPlayers.push(existingUser);

        // Store player1 and player2 data in localStorage when both players have logged in
        if (loggedInPlayers.length === 1) {
            localStorage.setItem('player1', JSON.stringify(loggedInPlayers[0]));
            alert(`Player 1: ${loggedInPlayers[0].username} logged in`);
        } else if (loggedInPlayers.length === 2) {
            localStorage.setItem('player2', JSON.stringify(loggedInPlayers[1]));
            alert(`Player 2: ${loggedInPlayers[1].username} logged in`);
            window.location.href = 'game.html';
        }
    } else {
        // If user is not found, show an alert
        alert('Invalid username or password. Please try again.');
    }

    // Optionally, reset the form
    form.reset();
}

// Optionally, add event listeners for login forms if needed
document.getElementById('player1-login-form').addEventListener('submit', (event) => handleLoginForm(event));
document.getElementById('player2-login-form').addEventListener('submit', (event) => handleLoginForm(event));

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
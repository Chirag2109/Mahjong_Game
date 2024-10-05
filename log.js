const loadUsersFromLocalStorage = () => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
        return JSON.parse(storedUsers);
    }
    return [];
};

function showCustomAlert(message, duration = 5000) {
    const alertElement = document.getElementById('customAlert');
    alertElement.textContent = message;
    alertElement.style.display = 'block';
    alertElement.style.opacity = '1';

    setTimeout(() => {
        alertElement.style.opacity = '0';
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 300);
    }, duration);
}

const users = loadUsersFromLocalStorage();

function handleSignupForm(event, score) {
    event.preventDefault();

    const form = event.target;
    const username = form.querySelector('input[name="username"]').value;
    const password = form.querySelector('input[name="password"]').value;

    const isUsernameAvailable = !users.some(existingUser => existingUser.username === username);

    function isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._]{2,}$/;
        const consecutiveDotUnderscoreRegex = /[._]{2}/;
        return usernameRegex.test(username) && !consecutiveDotUnderscoreRegex.test(username);
    }

    function isStrongPassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return passwordRegex.test(password);
    }

    if (!isUsernameAvailable) {
        showCustomAlert('Username is already taken. Please choose a different one.');
        return;
    }

    if (!isValidUsername(username)) {
        showCustomAlert('Invalid username! Username must be at least 3 characters long, start with a letter, and can contain letters, numbers, dots, or underscores. No consecutive dots or underscores allowed.');
        return;
    }

    if (!isStrongPassword(password)) {
        showCustomAlert('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
        return;
    }

    const user = {
        username,
        password,
        score
    };

    users.push(user);

    localStorage.setItem('users', JSON.stringify(users));

    form.reset();

    showCustomAlert('Signup successful!');
}

document.getElementById('player1-signup-form').addEventListener('submit', (event) => handleSignupForm(event, 0));
document.getElementById('player2-signup-form').addEventListener('submit', (event) => handleSignupForm(event, 0));

let loggedInPlayers = [];

function handleLoginForm(event) {
    event.preventDefault();

    const form = event.target;
    const username = form.querySelector('input[name="username"]').value;
    const password = form.querySelector('input[name="password"]').value;

    const existingUser = users.find(user => user.username === username && user.password === password);

    if (existingUser) {

        if (loggedInPlayers.some(player => player.username === existingUser.username)) {
            showCustomAlert('This player is already logged in.');
            return;
        }

        loggedInPlayers.push(existingUser);

        if (loggedInPlayers.length === 1) {
            loggedInPlayers[0].category = Math.floor(Math.random() * 2) + 1 === 1 ? 'symbol' : 'number';
            loggedInPlayers[0].count = 0;
            gameState.player1 = loggedInPlayers[0];
            localStorage.setItem('gameState', JSON.stringify(gameState));
            showCustomAlert(`Player 1: ${loggedInPlayers[0].username} logged in`);
        } else if (loggedInPlayers.length === 2) {
            loggedInPlayers[1].category = loggedInPlayers[0].category === 'symbol' ? 'number' : 'symbol';
            loggedInPlayers[1].count = 0;
            gameState.player2 = loggedInPlayers[1];
            localStorage.setItem('gameState', JSON.stringify(gameState));
            showCustomAlert(`Player 2: ${loggedInPlayers[1].username} logged in`);
        }
    } else {

        showCustomAlert('Invalid username or password. Please try again.');
    }

    form.reset();
}

document.getElementById('player1-login-form').addEventListener('submit', (event) => handleLoginForm(event));
document.getElementById('player2-login-form').addEventListener('submit', (event) => handleLoginForm(event));

function handleGuestLogin(playerNumber) {
    let gameState = JSON.parse(localStorage.getItem('gameState'));
    const guestUser = {
        username: `Guest${playerNumber}`,
        password: '',
        score: 0
    };

    if (loggedInPlayers.some(player => player.username === guestUser.username)) {
        handleGuestLogin(Math.floor(1000 + Math.random() * 9000));
        return;
    }

    loggedInPlayers.push(guestUser);

    if (loggedInPlayers.length === 1) {
        loggedInPlayers[0].category = Math.floor(Math.random() * 2) + 1 === 1 ? 'symbol' : 'number';
        loggedInPlayers[0].count = 0;
        gameState.player1 = loggedInPlayers[0];
        localStorage.setItem('gameState', JSON.stringify(gameState));
        showCustomAlert(`Player 1 (Guest${playerNumber}) logged in`);
    } else if (loggedInPlayers.length === 2) {
        loggedInPlayers[1].category = loggedInPlayers[0].category === 'symbol' ? 'number' : 'symbol';
        loggedInPlayers[1].count = 0;
        gameState.player2 = loggedInPlayers[1];
        localStorage.setItem('gameState', JSON.stringify(gameState));
        showCustomAlert(`Player 2 (Guest${playerNumber}) logged in`);
    }
}

document.getElementById('player1-guest-login').addEventListener('click', () => handleGuestLogin(Math.floor(1000 + Math.random() * 9000)));
document.getElementById('player2-guest-login').addEventListener('click', () => handleGuestLogin(Math.floor(1000 + Math.random() * 9000)));

document.getElementById('play-button').addEventListener('click', () => {
    if (loggedInPlayers.length === 2) {
        localStorage.removeItem('tiles');
        localStorage.removeItem('previousStates');
        window.location.href = 'game.html';
    } else {
        showCustomAlert('Both players need to be logged in to start the game.');
    }
});

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
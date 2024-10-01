document.getElementById('play').addEventListener('click', () => {
    let gameState = {
        currentPlayer: null,
        currentPlayerData: null,
        validSet: null,
        player1: null,
        player2: null,
        extraTile: null,
        originalPosition: null
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
    window.location.href = 'log.html';
});
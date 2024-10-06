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

document.getElementById('demo-video').addEventListener('click', () => {
    document.getElementById('container').classList.add('hidden'); // Hide the main entrance
    document.querySelector('.video-container').classList.remove('hidden'); // Show the video container
});

document.getElementById('close-video').addEventListener('click', () => {
    document.querySelector('.video-container').classList.add('hidden'); // Hide the video container
    document.getElementById('container').classList.remove('hidden'); // Show the main entrance again
    const demoVideo = document.getElementById('demoVideo');
    demoVideo.pause(); // Pause the video
    demoVideo.currentTime = 0; // Reset video to the start
});
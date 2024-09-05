document.getElementById('play').addEventListener('click', () => {
    // Simulate loading
    const loader = document.createElement('div');
    const container = document.getElementById('container');
    loader.classList.add('loader');
    document.body.appendChild(loader);
    loader.style.display = 'block';
    container.style.display = 'none';

    setTimeout(() => {
        loader.style.display = 'none';
        // Redirect or show content after loading
        window.location.href = 'home.html'; // Adjust to your actual page
    }, 1000); // 3 seconds loading time
});

window.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('backgroundMusic');
    const unmuteButton = document.getElementById('unmute');

    // Set event listener for unmuting audio
    unmuteButton.addEventListener('click', () => {
        audio.muted = false;
    });
});
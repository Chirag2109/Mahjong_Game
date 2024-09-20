// Define symbols and numbers
const symbols = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

// Shuffle function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Generate or load tiles from localStorage
function generateOrLoadTiles() {
    let set1 = document.getElementById('set1');
    let set2 = document.getElementById('set2');
    let extraTileContainer = document.getElementById('extraTile');

    let savedTiles = localStorage.getItem('tiles');
    if (savedTiles) {
        const tilesData = JSON.parse(savedTiles);
        const { set1Array, set2Array, extraTile } = tilesData;

        // Load the saved tiles into set1 and set2
        loadTiles(set1, set1Array);
        loadTiles(set2, set2Array);

        // Load the extra tile
        extraTileContainer.innerText = extraTile.name;

    } else {
        generateTiles();
    }
}

// Helper function to load tiles into the DOM
function loadTiles(container, tileArray) {
    container.innerHTML = ""; // Clear any existing tiles
    tileArray.forEach(row => {
        row.forEach(tile => {
            let tileDiv = document.createElement('div');
            tileDiv.classList.add('tile');
            tileDiv.innerText = tile.name;
            container.appendChild(tileDiv);
        });
    });
}

let previousStates = [];

// Save the current state before any major change
function saveCurrentState() {
    const currentState = localStorage.getItem('tiles');
    previousStates.push(currentState); // Save the state to the stack
    if (previousStates.length > 10) { // Limit the stack size if necessary
        previousStates.shift(); // Remove the oldest state if the stack exceeds 10
    }
}

// Undo functionality to revert the game to the previous state
function undoLastMove() {
    if (previousStates.length === 0) {
        alert("No moves to undo!");
        return;
    }
    
    const lastState = previousStates.pop();
    if (lastState) {
        localStorage.setItem('tiles', lastState);
        generateOrLoadTiles(); // Reload the tiles from the reverted state
        alert("Undo successful!");
    }
}

// Attach the undo function to the undo button
const undoButton = document.getElementById('undoButton');
undoButton.addEventListener('click', undoLastMove);

// Generate new tiles and save them in localStorage as 2D arrays
function generateTiles() {
    saveCurrentState();
    let set1 = document.getElementById('set1');
    let set2 = document.getElementById('set2');
    let extraTileContainer = document.getElementById('extraTile');

    let temp = [];
    symbols.forEach(symbol => {
        for (let i = 0; i < 4; i++) temp.push({ name: symbol });
    });
    numbers.forEach(number => {
        for (let i = 0; i < 4; i++) temp.push({ name: number });
    });

    let shuffledTemp = shuffle(temp);
    let set1Array = [], set2Array = [];

    // Split shuffled tiles into two sets
    for (let i = 0; i < 36; i += 9) set1Array.push(shuffledTemp.slice(i, i + 9));
    for (let i = 36; i < 72; i += 9) set2Array.push(shuffledTemp.slice(i, i + 9));

    // Add tiles to set1 and set2
    loadTiles(set1, set1Array);
    loadTiles(set2, set2Array);

    // Random extra tile
    let randomTile = shuffledTemp[Math.floor(Math.random() * shuffledTemp.length)];
    extraTileContainer.innerText = randomTile.name;

    const tileData = { set1Array, set2Array, extraTile: randomTile };
    localStorage.setItem('tiles', JSON.stringify(tileData));
}

// Drag functionality for the extra tile
dragElement(document.getElementById("extra"));

function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    elmnt.onmousedown = function(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    };

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        checkDropColumn(elmnt);
    }
}

// Check where the extra tile was dropped and trigger tile shifting
function checkDropColumn(extraTile) {
    const tileSets = [document.getElementById('set1'), document.getElementById('set2')];
    let dropped = false;

    tileSets.forEach((set, setIndex) => {
        const columns = set.children;
        Array.from(columns).forEach((tile, index) => {
            const rect = tile.getBoundingClientRect();

            // If the extra tile was dropped within the bounds of this column
            if (extraTile.offsetLeft >= rect.left && extraTile.offsetLeft <= rect.right && extraTile.offsetTop >= rect.top && extraTile.offsetTop <= rect.bottom)
            {
                shiftColumn(setIndex, index % 9); // Shift tiles in the detected column
                dropped = true;
            }
        });
    });
}

// Shift the tiles in the specified column down and update localStorage
function shiftColumn(setIndex, colIndex) {
    saveCurrentState();
    const tileData = JSON.parse(localStorage.getItem('tiles'));
    const { set1Array, set2Array, extraTile } = tileData;

    let setArray = setIndex === 0 ? set1Array : set2Array;
    let columnTiles = Array.from(document.getElementById(`set${setIndex + 1}`).children);

    // Get the column to shift down
    let shiftedTile = setArray.map(row => row[colIndex]);
    let lastTile = shiftedTile.pop(); // Remove the last tile
    shiftedTile.unshift(extraTile); // Insert extra tile at the top

    // Apply downward movement animation to each tile
    shiftedTile.forEach((tileName, rowIndex) => {
        const tileElement = columnTiles[rowIndex * 9 + colIndex];
        tileElement.classList.add('move-down');
    });

    // After the animation, update the tiles in the DOM and localStorage
    setTimeout(() => {
        shiftedTile.forEach((tileName, rowIndex) => {
            const tileElement = columnTiles[rowIndex * 9 + colIndex];
            tileElement.classList.remove('move-down');
            tileElement.innerText = tileName.name;
        });

        document.getElementById('extraTile').innerText = lastTile.name;

        setArray.forEach((row, rowIndex) => {
            row[colIndex] = shiftedTile[rowIndex];
        });

        const updatedTileData = {
            set1Array: setIndex === 0 ? setArray : set1Array,
            set2Array: setIndex === 1 ? setArray : set2Array,
            extraTile: lastTile
        };

        localStorage.setItem('tiles', JSON.stringify(updatedTileData));
    }, 500); // 0.5s wait for the animation to complete
}

// Initialize the board and tiles
generateOrLoadTiles();

// Mute button functionality
const muteButton = document.getElementById('playButton');
const muteIcon = document.getElementById('sound');
const audio = document.getElementById('backgroundMusic');

// Function to update the mute status
function updateMuteStatus() {
    const isMuted = localStorage.getItem('audioMuted') === 'true';
    audio.muted = isMuted;
    muteIcon.src = isMuted ? '/logo/mute.png' : '/logo/sound.png';
    muteIcon.alt = isMuted ? 'Unmute' : 'Mute';
}

// Event listener to toggle mute
muteButton.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteIcon.src = audio.muted ? '/logo/mute.png' : '/logo/sound.png';
    muteIcon.alt = audio.muted ? 'Unmute' : 'Mute';

    // Save the mute status to localStorage
    localStorage.setItem('audioMuted', audio.muted);
});

// Initialize the mute status when the page loads
window.addEventListener('load', updateMuteStatus);

// Event listener to refresh tiles (clearing storage for a new shuffle)
const restartButton = document.getElementById('reStart');
const loader = document.getElementById('loader');
const table = document.getElementById('Table');

restartButton.addEventListener('click', () => {
    loader.style.display = 'block';
    table.style.display = 'none';

    localStorage.removeItem('tiles');

    const minDisplayTime = 3000;
    const startTime = Date.now();

    function reloadAfterDelay() {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(minDisplayTime - elapsedTime, 0);

        setTimeout(() => {
            window.location.reload();
            generateOrLoadTiles();
        }, remainingTime);
    }
    reloadAfterDelay();
});

// Function to load player names from localStorage
function loadPlayerNames() {
    const player1Data = JSON.parse(localStorage.getItem('player1'));
    const player2Data = JSON.parse(localStorage.getItem('player2'));

    const player1NameContainer = document.getElementById('player1Name');
    const player2NameContainer = document.getElementById('player2Name');

    // Display player names under their avatars
    if (player1Data && player1Data.username) {
        player1NameContainer.innerText = player1Data.username;
    } else {
        player1NameContainer.innerText = "Player 1"; // Default name if no data found
    }

    if (player2Data && player2Data.username) {
        player2NameContainer.innerText = player2Data.username;
    } else {
        player2NameContainer.innerText = "Player 2"; // Default name if no data found
    }
}

// Call the function to load and display player names when the page loads
window.addEventListener('load', loadPlayerNames);
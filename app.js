const symbols = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

let temp = [];

// Shuffle function remains the same
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to generate or load tiles from localStorage
function generateOrLoadTiles() {
    let set1 = document.getElementById('set1');
    let set2 = document.getElementById('set2');
    let Table = document.getElementById('Table');
    let extraTileContainer = document.getElementById('extraTile');

    // Check if tiles are already saved in localStorage
    let savedTiles = localStorage.getItem('tiles');
    if (savedTiles) {
        const tilesData = JSON.parse(savedTiles);
        const { set1Array, set2Array, extraTile } = tilesData;

        // Load the saved tiles
        set1Array.forEach(tile => {
            let tileDiv = document.createElement('div');
            tileDiv.classList.add('tile');
            tileDiv.innerText = tile.name;
            set1.appendChild(tileDiv);
        });

        set2Array.forEach(tile => {
            let tileDiv = document.createElement('div');
            tileDiv.classList.add('tile');
            tileDiv.innerText = tile.name;
            set2.appendChild(tileDiv);
        });

        // Load the extra tile
        let extraTileDiv = document.createElement('div');
        extraTileDiv.innerText = extraTile.name;
        extraTileContainer.appendChild(extraTileDiv);

    } else {
        // Generate new tiles if none are saved
        temp = [];

        for (let i = 0; i < symbols.length; i++) {
            for (let j = 0; j < 4; j++) {
                let tile = {
                    name: symbols[i],
                    img: symbols[i],
                    category: "symbol"
                };
                temp.push(tile);
            }
        }

        for (let i = 0; i < numbers.length; i++) {
            for (let j = 0; j < 4; j++) {
                let tile = {
                    name: numbers[i],
                    img: numbers[i],
                    category: "number"
                };
                temp.push(tile);
            }
        }

        let shuffledTemp = shuffle(temp);

        let set1Array = shuffledTemp.slice(0, 36);
        let set2Array = shuffledTemp.slice(36, 72);

        // Add tiles to set 1
        set1Array.forEach(tile => {
            let tileDiv = document.createElement('div');
            tileDiv.classList.add('tile');
            tileDiv.innerText = tile.name;
            set1.appendChild(tileDiv);
        });

        // Random extra tile
        let randomTile = shuffledTemp[Math.floor(Math.random() * shuffledTemp.length)];
        let extraTileDiv = document.createElement('div');
        extraTileDiv.innerText = randomTile.name;
        extraTileContainer.appendChild(extraTileDiv);

        // Add tiles to set 2
        set2Array.forEach(tile => {
            let tileDiv = document.createElement('div');
            tileDiv.classList.add('tile');
            tileDiv.innerText = tile.name;
            set2.appendChild(tileDiv);
        });

        // Save the tile configuration in localStorage
        const tileData = {
            set1Array,
            set2Array,
            extraTile: randomTile
        };
        localStorage.setItem('tiles', JSON.stringify(tileData));
    }
    setTimeout(() => {
        loader.style.display = 'none';
        Table.style.display = 'block';
    }, 10000);
}

// Run the function on page load
generateOrLoadTiles();

// Drag functionality for the extra tile
dragElement(document.getElementById("extra"));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "Tile")) {
        document.getElementById(elmnt.id + "Tile").onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Mute button functionality
const muteButton = document.getElementById('playButton');
const muteIcon = document.getElementById('sound');
const audio = document.getElementById('backgroundMusic');

// Function to update the mute status
function updateMuteStatus() {
    const isMuted = localStorage.getItem('audioMuted') === 'true';
    audio.muted = isMuted;
    muteIcon.src = isMuted ? 'mute.png' : 'sound.png';
    muteIcon.alt = isMuted ? 'Unmute' : 'Mute';
}

// Event listener to toggle mute
muteButton.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteIcon.src = audio.muted ? 'mute.png' : 'sound.png';
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
const symbols = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

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
    let extraTileContainer = document.getElementById('extraTile');

    let savedTiles = localStorage.getItem('tiles');
    if (savedTiles) {
        const tilesData = JSON.parse(savedTiles);
        const { set1Array, set2Array, extraTile } = tilesData;

        // Load the saved tiles into set1
        set1Array.forEach(row => {
            row.forEach(tile => {
                let tileDiv = document.createElement('div');
                tileDiv.classList.add('tile');
                tileDiv.innerText = tile.name;
                set1.appendChild(tileDiv);
            });
        });

        // Load the saved tiles into set2
        set2Array.forEach(row => {
            row.forEach(tile => {
                let tileDiv = document.createElement('div');
                tileDiv.classList.add('tile');
                tileDiv.innerText = tile.name;
                set2.appendChild(tileDiv);
            });
        });

        // Load the extra tile
        extraTileContainer.innerText = extraTile.name;

    } else {
        // If no saved tiles, generate them
        generateTiles();
    }
}

// Generate new tiles and save them in localStorage as 2D arrays
function generateTiles() {
    let set1 = document.getElementById('set1');
    let set2 = document.getElementById('set2');
    let extraTileContainer = document.getElementById('extraTile');

    let temp = [];
    for (let i = 0; i < symbols.length; i++) {
        for (let j = 0; j < 4; j++) {
            let tile = { name: symbols[i] };
            temp.push(tile);
        }
    }
    for (let i = 0; i < numbers.length; i++) {
        for (let j = 0; j < 4; j++) {
            let tile = { name: numbers[i] };
            temp.push(tile);
        }
    }

    let shuffledTemp = shuffle(temp);

    // Convert the shuffled array into two 9x4 2D arrays (set1Array and set2Array)
    let set1Array = [];
    let set2Array = [];

    for (let i = 0; i < 36; i += 9) {
        set1Array.push(shuffledTemp.slice(i, i + 9));
    }

    for (let i = 36; i < 72; i += 9) {
        set2Array.push(shuffledTemp.slice(i, i + 9));
    }

    // Add tiles to set1
    set1Array.forEach(row => {
        row.forEach(tile => {
            let tileDiv = document.createElement('div');
            tileDiv.classList.add('tile');
            tileDiv.innerText = tile.name;
            set1.appendChild(tileDiv);
        });
    });

    // Add tiles to set2
    set2Array.forEach(row => {
        row.forEach(tile => {
            let tileDiv = document.createElement('div');
            tileDiv.classList.add('tile');
            tileDiv.innerText = tile.name;
            set2.appendChild(tileDiv);
        });
    });

    // Random extra tile
    let randomTile = shuffledTemp[Math.floor(Math.random() * shuffledTemp.length)];
    extraTileContainer.innerText = randomTile.name;

    // Save the tile data in 2D arrays to localStorage
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
        // checkDropColumn(elmnt);
    }
}

// // Check which column the extra tile was dropped on
// function checkDropColumn(extraTile) {
//     const tileSets = [document.getElementById('set1'), document.getElementById('set2')];
//     let dropped = false;

//     tileSets.forEach((set, setIndex) => {
//         const columns = set.children;
//         Array.from(columns).forEach((tile, index) => {
//             const rect = tile.getBoundingClientRect();

//             // Check if the extra tile was dropped in this column's bounds
//             if (extraTile.offsetLeft >= rect.left && extraTile.offsetLeft <= rect.right &&
//                 extraTile.offsetTop >= rect.top && extraTile.offsetTop <= rect.bottom) {
                
//                 shiftColumn(setIndex, index);
//                 dropped = true;
//             }
//         });
//     });

//     // Reset position if not dropped on a valid column
//     if (!dropped) {
//         extraTile.style.top = "0px";
//         extraTile.style.left = "0px";
//     }
// }

// // Shift the tiles in the specified column down and update localStorage
// function shiftColumn(setIndex, colIndex) {
//     const tileData = JSON.parse(localStorage.getItem('tiles'));
//     const { set1Array, set2Array, extraTile } = tileData;

//     let setArray = setIndex === 0 ? set1Array : set2Array;
//     let columnTiles = Array.from(document.getElementById(`set${setIndex + 1}`).children);

//     // Shift tiles down in the selected column
//     let shiftedTile = setArray[colIndex];
//     for (let i = colIndex; i < setArray.length - 1; i++) {
//         setArray[i] = setArray[i + 1];
//         columnTiles[i].innerText = setArray[i].name;
//     }

//     // The last tile in the column becomes the new extra tile
//     let newExtraTile = setArray[setArray.length - 1];
//     document.getElementById('extraTile').innerText = shiftedTile.name;

//     // Update localStorage
//     const updatedTileData = {
//         set1Array: setIndex === 0 ? setArray : set1Array,
//         set2Array: setIndex === 1 ? setArray : set2Array,
//         extraTile: newExtraTile
//     };
//     localStorage.setItem('tiles', JSON.stringify(updatedTileData));
// }

// Initialize
generateOrLoadTiles();

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
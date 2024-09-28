// Define symbols and numbers
const symbols = ["\u{1F022}", "\u{1F023}", "\u{1F024}", "\u{1F025}", "\u{1F026}", "\u{1F027}", "\u{1F028}", "\u{1F029}", "\u{1F02A}"];
const numbers = ["\u{1F019}", "\u{1F01A}", "\u{1F01B}", "\u{1F01C}", "\u{1F01D}", "\u{1F01E}", "\u{1F01F}", "\u{1F020}", "\u{1F021}"];

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
    container.innerHTML = "";
    tileArray.forEach(row => {
        row.forEach(tile => {
            let tileDiv = document.createElement('div');
            tileDiv.classList.add('tile');
            tileDiv.setAttribute('data-name', tile.flipped ? "\u{1F02B}" : tile.name);
            tileDiv.classList.toggle('flip', tile.flipped === false);
            container.appendChild(tileDiv);
        });
    });
}

function saveCurrentState() {
    const currentState = localStorage.getItem('tiles');

    // Check if the previous state is different from the current state
    let previousStates = JSON.parse(localStorage.getItem('previousStates')) || [];
    const previousState = previousStates[previousStates.length - 1];

    // Only push the new state if it's different from the last stored state
    if (currentState !== previousState) {
        previousStates.push(currentState);

        // Limit the number of stored states to 10 (adjustable)
        if (previousStates.length > 100) {
            previousStates.shift(); // Remove the oldest state if exceeding the limit
        }

        // Update localStorage with the new list of previous states
        localStorage.setItem('previousStates', JSON.stringify(previousStates));
    }
}


// Undo functionality to revert the game to the previous state
function undoLastMove() {
    // Initialize previous states from localStorage or set an empty array
    let previousStates = JSON.parse(localStorage.getItem('previousStates')) || [];

    if (previousStates.length === 0) {
        alert("No moves to undo!");
        return;
    }

    const lastState = previousStates.pop();

    if (lastState && lastState != localStorage.getItem('tiles')) {
        // Update localStorage with the reverted tiles state
        localStorage.setItem('tiles', lastState);

        // Also update localStorage for the list of previous states
        localStorage.setItem('previousStates', JSON.stringify(previousStates));

        // Reload the tiles to reflect the previous state
        generateOrLoadTiles();

        alert("Undo successful!");
    }
}

// Generate new tiles and save them in localStorage as 2D arrays
function generateTiles() {
    let set1 = document.getElementById('set1');
    let set2 = document.getElementById('set2');
    let extraTileContainer = document.getElementById('extra');

    let temp = [];
    symbols.forEach(symbol => {
        for (let i = 0; i < 4; i++) temp.push({ name: symbol, flipped: true, category: "symbol" });
    });
    numbers.forEach(number => {
        for (let i = 0; i < 4; i++) temp.push({ name: number, flipped: true, category: "number" });
    });
    temp.push({ name: "\u{1F005}", flipped: true, category: "extra" });

    let shuffledTemp = shuffle(temp);
    let set1Array = [], set2Array = [];

    // Split shuffled tiles into two sets
    for (let i = 0; i < 36; i += 9) set1Array.push(shuffledTemp.slice(i, i + 9));
    for (let i = 36; i < 72; i += 9) set2Array.push(shuffledTemp.slice(i, i + 9));

    // Add tiles to set1 and set2
    loadTiles(set1, set1Array);
    loadTiles(set2, set2Array);

    // Random extra tile
    let randomTile = shuffledTemp[72];
    randomTile.flipped = false;
    shuffledTemp.splice(72, 1);
    extraTileContainer.innerText = randomTile.name;

    const tileData = { set1Array, set2Array, extraTile: randomTile };
    localStorage.setItem('tiles', JSON.stringify(tileData));
}

// Shift the tiles in the specified column down and update localStorage
function shiftColumn(setIndex, colIndex) {
    return new Promise((resolve) => {
        saveCurrentState();
        const tileData = JSON.parse(localStorage.getItem('tiles'));
        const { set1Array, set2Array, extraTile } = tileData;

        let setArray = setIndex === 1 ? set1Array : set2Array;
        let columnTiles = Array.from(document.getElementById(`set${setIndex}`).children);

        // Get the column to shift down
        let shiftedTile = setArray.map(row => row[colIndex]);
        let lastTile = shiftedTile.pop(); // Remove the last tile
        lastTile.flipped = false;
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
            });

            setArray.forEach((row, rowIndex) => {
                row[colIndex] = shiftedTile[rowIndex];
            });

            const updatedTileData = {
                set1Array: setIndex === 1 ? setArray : set1Array,
                set2Array: setIndex === 2 ? setArray : set2Array,
                extraTile: lastTile
            };

            localStorage.setItem('tiles', JSON.stringify(updatedTileData));

            generateOrLoadTiles();
            resolve();
        }, 100);
    });
}

function checkDropColumn(allowedSet, dropTarget) {
    return new Promise((resolve) => {
        if (dropTarget) {
            // Check if the drop target is a tile within one of the sets
            if (allowedSet.contains(dropTarget)) {
                const columns = Array.from(allowedSet.children);
                const colIndex = columns.indexOf(dropTarget);
                if (colIndex !== -1) {
                    let setIndex = allowedSet === document.getElementById('set1') ? 1 : 2;
                    shiftColumn(setIndex, colIndex % 9).then(() => {
                        resolve(true);
                    });
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        } else {
            resolve(false);
        }
    });
}

function dragElement(elmnt, allowedSet) {
    let originalPosition = JSON.parse(localStorage.getItem('originalPosition'));
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    return new Promise((resolve) => {
        elmnt.onmousedown = function (e) {
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

            setTimeout(() => {
                const centerX = elmnt.offsetLeft + (elmnt.offsetWidth / 2);
                const centerY = elmnt.offsetTop + (elmnt.offsetHeight / 2);
                const dropTarget = document.elementFromPoint(centerX, centerY);

                if (allowedSet.contains(dropTarget)) {
                    console.log(allowedSet.contains(dropTarget));
                    checkDropColumn(allowedSet, dropTarget).then((result) => {

                        // Animate the extra tile back to its original position
                        elmnt.style.transition = "top 0.5s ease, left 0.5s ease";
                        elmnt.style.top = originalPosition.top + "px";
                        elmnt.style.left = originalPosition.left + "px";

                        // Optional: Remove the transition after it completes
                        setTimeout(() => {
                            elmnt.style.transition = "";
                        }, 500);
                        resolve(result);
                    });
                } else {
                    alert("Invalid drop! You can only drop the extra tile within the specified tile sets.");

                    // Animate the extra tile back to its original position
                    elmnt.style.transition = "top 0.5s ease, left 0.5s ease";
                    elmnt.style.top = originalPosition.top + "px";
                    elmnt.style.left = originalPosition.left + "px";

                    // Optional: Remove the transition after it completes
                    setTimeout(() => {
                        elmnt.style.transition = "";
                    }, 500);
                    resolve(false);
                }
            }, 100);
        }
    });
}

// Mute button functionality
const muteButton = document.getElementById('playButton');
const muteIcon = document.getElementById('sound');
const audio = document.getElementById('backgroundMusic');

const undoButton = document.getElementById('undoButton');

const restartButton = document.getElementById('reStart');
const loader = document.getElementById('loader');
const table = document.getElementById('Table');

// Function to update the mute status
function updateMuteStatus() {
    const isMuted = localStorage.getItem('audioMuted') === 'true';
    audio.muted = isMuted;
    muteIcon.src = isMuted ? '/logo/mute.png' : '/logo/sound.png';
    muteIcon.alt = isMuted ? 'Unmute' : 'Mute';
}

function loadPlayerNames() {
    const player1Data = JSON.parse(localStorage.getItem('player1'));
    const player2Data = JSON.parse(localStorage.getItem('player2'));

    const player1NameContainer = document.getElementById('player1Name');
    const player2NameContainer = document.getElementById('player2Name');

    player1NameContainer.innerHTML = `Username: ${player1Data?.username || 'Player1'}<br>Category: ${player1Data?.category || 'Unknown'}`;
    player2NameContainer.innerHTML = `Username: ${player2Data?.username || 'Player1'}<br>Category: ${player2Data?.category || 'Unknown'}`;
}

// Event listener to toggle mute
muteButton.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteIcon.src = audio.muted ? '/logo/mute.png' : '/logo/sound.png';
    muteIcon.alt = audio.muted ? 'Unmute' : 'Mute';

    // Save the mute status to localStorage
    localStorage.setItem('audioMuted', audio.muted);
});

undoButton.addEventListener('click', undoLastMove);

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

function PLAY() {
    updateMuteStatus();
    loadPlayerNames();
    saveCurrentState();
    generateOrLoadTiles();

    let player1 = JSON.parse(localStorage.getItem('player1'));
    let player2 = JSON.parse(localStorage.getItem('player2'));
    let extraTile2 = JSON.parse(localStorage.getItem('tiles')).extraTile;
    let extraTilediv = document.getElementById("extra");
    const originalPosition = { top: extraTilediv.offsetTop, left: extraTilediv.offsetLeft };
    let currentPlayer = player1.category === extraTile2.category ? 1 : 2;
    localStorage.setItem('originalPosition', JSON.stringify(originalPosition));

    // Helper function to check for game end
    function checkGameEnd() {
        if (player1.count >= 36) {
            alert(`${player1.username} wins!`);
            return true;
        } else if (player2.count >= 36) {
            alert(`${player2.username} wins!`);
            return true;
        }
        return false;
    }

    // Helper function to toggle turn between players
    function toggleTurn() {
        if (!checkGameEnd()) {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            alert(`It's now Player ${currentPlayer}'s turn.`);
        }
    }

    // Function to update player count
    function updatePlayerCount(player) {
        player.count++;
        localStorage.setItem(`player${currentPlayer}`, JSON.stringify(player));
    }

    // Function to handle player turn and update state
    async function handlePlayerTurn() {
        let currentPlayerData = currentPlayer === 1 ? player1 : player2;
        let validSet = currentPlayer === 1 ? document.getElementById('set1') : document.getElementById('set2');

        let isDropped = await dragElement(extraTilediv, validSet);

        // Fetch the latest tile data from localStorage after the drag operation is complete
        let tileData1 = JSON.parse(localStorage.getItem('tiles'));
        // Re-fetch the updated extraTile value from the latest tileData
        let extraTile1 = tileData1.extraTile;

        // Continue with the player turn logic after drag is completed
        if (isDropped) {
            updatePlayerCount(currentPlayerData);
            if (currentPlayerData.category === extraTile1.category) {
                alert(`Player${currentPlayer} gets another turn!`);
            } else {
                toggleTurn();
            }
        }
    }

    // Set up the event listener for the extra tile dragging
    document.getElementById("extra").addEventListener('mouseup', (e) => {
        handlePlayerTurn();
        e.preventDefault();
    });

    // Initialize the first player's turn
    alert(`It's Player ${currentPlayer}'s turn.`);
}

window.addEventListener('load', PLAY);
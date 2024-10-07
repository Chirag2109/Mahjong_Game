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
      showCustomAlert("No moves to undo!");
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

      showCustomAlert("Undo successful!");
   }
}

// Generate new tiles and save them in localStorage as 2D arrays
function generateTiles() {
   let set1 = document.getElementById('set1');
   let set2 = document.getElementById('set2');
   let extraTileContainer = document.getElementById('extraTile');

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
               const tiles = JSON.parse(localStorage.getItem('tiles'));
               const set = allowedSet === document.getElementById('set1') ? tiles.set1Array : tiles.set2Array;
               const isSametile = set[0][colIndex % 9].name === tiles.extraTile.name;
               console.log(isSametile);
               const isTopTileFlipped = set[0][colIndex % 9].flipped;
               console.log(isTopTileFlipped);
               const isExtraTile = tiles.extraTile.category === "extra" || set[0][colIndex % 9].category === "extra";
               console.log(isExtraTile);

               // Check if the top tile is flipped or the tiles match or the extra tile is dropped
               if (isTopTileFlipped) {
                  let setIndex = allowedSet === document.getElementById('set1') ? 1 : 2;
                  shiftColumn(setIndex, colIndex % 9).then(() => {
                     resolve(true);
                  });
               } else if (isSametile) {
                  let setIndex = allowedSet === document.getElementById('set1') ? 1 : 2;
                  shiftColumn(setIndex, colIndex % 9).then(() => {
                     resolve(true);
                  });
               } else if (isExtraTile) {
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
      } else {
         resolve(false);
      }
   });
}

function dragElement(elmnt, allowedSet) {
   // Store the current allowed set in a constant to avoid changes during the drag
   // let currentAllowedSet = allowedSet;
   let originalPosition = JSON.parse(localStorage.getItem('gameState')).originalPosition;
   let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

   return new Promise((resolve) => {
      elmnt.onmousedown = function (e) {
         e.preventDefault();
         pos3 = e.clientX;
         pos4 = e.clientY;

         // Ensure we keep the allowedSet at the start of the drag
         // const startAllowedSet = currentAllowedSet;
         document.onmouseup = () => closeDragElement();
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
               checkDropColumn(allowedSet, dropTarget).then((result) => {

                  // Animate the extra tile back to its original position
                  elmnt.style.transition = "top 0.5s ease, left 0.5s ease";
                  elmnt.style.top = originalPosition.top + "px";
                  elmnt.style.left = originalPosition.left + "px";

                  // Optional: Remove the transition after it completes
                  setTimeout(() => {
                     elmnt.style.transition = "";
                  }, 50);
                  if (!result) {
                     showCustomAlert("Invalid drop! You can only drop the extra tile in the column where either the top tile is flipped or the tiles match.");
                     resolve(false);
                  }
                  resolve(result);
               });
            } else {
               showCustomAlert("Invalid drop! You can only drop the extra tile within the specified tile sets.");

               // Animate the extra tile back to its original position
               elmnt.style.transition = "top 0.5s ease, left 0.5s ease";
               elmnt.style.top = originalPosition.top + "px";
               elmnt.style.left = originalPosition.left + "px";

               // Optional: Remove the transition after it completes
               setTimeout(() => {
                  elmnt.style.transition = "";
               }, 50);
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
   muteIcon.src = isMuted ? 'logo/mute.png' : 'logo/sound.png';
   muteIcon.alt = isMuted ? 'Unmute' : 'Mute';
}

function loadPlayerNames() {
   const gameState = JSON.parse(localStorage.getItem('gameState'));
   const player1Data = gameState.player1;
   const player2Data = gameState.player2;

   const player1NameContainer = document.getElementById('player1Name');
   const player2NameContainer = document.getElementById('player2Name');

   player1NameContainer.innerHTML = `Username: ${player1Data?.username || 'Player1'}<br>Category: ${player1Data?.category || 'Unknown'}`;
   player2NameContainer.innerHTML = `Username: ${player2Data?.username || 'Player2'}<br>Category: ${player2Data?.category || 'Unknown'}`;
}

// Event listener to toggle mute
muteButton.addEventListener('click', () => {
   audio.muted = !audio.muted;
   muteIcon.src = audio.muted ? 'logo/mute.png' : 'logo/sound.png';
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

function showCustomAlert(message, duration = 3000) {
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


function PLAY() {
   updateMuteStatus();
   loadPlayerNames();
   saveCurrentState();
   generateOrLoadTiles();

   const extraTilediv = document.getElementById("extra");
   let gameState = JSON.parse(localStorage.getItem('gameState'));

   // Update game state with extra tile information
   gameState.extraTile = JSON.parse(localStorage.getItem('tiles')).extraTile;
   gameState.currentPlayer = (gameState.player1.category === gameState.extraTile.category) ? 1 : 2;
   gameState.currentPlayerData = (gameState.currentPlayer === 1) ? gameState.player1 : gameState.player2;
   gameState.originalPosition = { top: extraTilediv.offsetTop, left: extraTilediv.offsetLeft };
   localStorage.setItem('gameState', JSON.stringify(gameState));

   // Helper function to check for game end
   function checkGameEnd() {
      let tiles = JSON.parse(localStorage.getItem('tiles'));
      let users = JSON.parse(localStorage.getItem('users'));
      let currentGameState = JSON.parse(localStorage.getItem('gameState'));
   
      if (currentGameState.player1.count >= 36 && !tiles.set1Array.some(tile => tile.category === "extra")) {
         if (users[currentGameState.player1.username] && users[currentGameState.player2.username]) {
            users[currentGameState.player1.username].score += currentGameState.player2.score;
            users[currentGameState.player2.username].score /= 2;
            localStorage.setItem('users', JSON.stringify(users));
         }
         displayGameEndModal(`${currentGameState.player1.username} wins!`);
         return true;
      } else if (currentGameState.player2.count >= 36 && !tiles.set2Array.some(tile => tile.category === "extra")) {
         if (users[currentGameState.player1.username] && users[currentGameState.player2.username]) {
            users[currentGameState.player2.username].score += currentGameState.player1.score;
            users[currentGameState.player1.username].score /= 2;
            localStorage.setItem('users', JSON.stringify(users));
         }
         displayGameEndModal(`${currentGameState.player2.username} wins!`);
         return true;
      } else {
         return false;
      }
   }
   
   function displayGameEndModal(message) {
      const modal = document.getElementById('game-end-modal');
      const messageElement = document.getElementById('game-end-message');
      const playAgainBtn = document.getElementById('play-again-btn');
      const leaderboardBtn = document.getElementById('leaderboard-btn');
      const closeBtn = document.getElementById('close-btn');
   
      messageElement.textContent = message;
      modal.classList.remove('hidden');
   
      // Add event listeners for buttons
      playAgainBtn.onclick = function() {
         modal.classList.add('hidden');
         // Logic to restart the game
         localStorage.removeItem('tiles');
         PLAY();
      };
   
      leaderboardBtn.onclick = function() {
         modal.classList.add('hidden');
         // Redirect to the leaderboard page
         window.location.href = 'leader.html';
      };
   
      closeBtn.onclick = function() {
         modal.classList.add('hidden');
      };
   }   

   // Helper function to update the player count
   function updatePlayerCount() {
      let currentGameState = JSON.parse(localStorage.getItem('gameState'));
      if (currentGameState.currentPlayerData.username === currentGameState.player1.username) {
         currentGameState.player1.count += 1;
      } else {
         currentGameState.player2.count += 1;
      }
      localStorage.setItem('gameState', JSON.stringify(currentGameState));
   }

   // Helper function to toggle turn between players
   function toggleTurn() {
      if (!checkGameEnd()) {
         let currentGameState = JSON.parse(localStorage.getItem('gameState'));
         currentGameState.currentPlayer = (currentGameState.currentPlayer === 1) ? 2 : 1;
         currentGameState.currentPlayerData = (currentGameState.currentPlayer === 1) ? currentGameState.player1 : currentGameState.player2;
         localStorage.setItem('gameState', JSON.stringify(currentGameState));
         showCustomAlert(`It's now Player ${currentGameState.currentPlayer}'s turn.`);
      } else {
         throw new Error("Game has ended");
      }
   }

   async function handlePlayerTurn() {
      let currentGameState = JSON.parse(localStorage.getItem('gameState'));

      // Determine the correct set based on the current player
      const currentSet = document.getElementById(`set${currentGameState.currentPlayer}`);

      // Wait for the drag to complete
      let isDropped = await dragElement(extraTilediv, currentSet);

      // After drag, update the state with the latest tile data
      currentGameState = JSON.parse(localStorage.getItem('gameState'));
      currentGameState.extraTile = JSON.parse(localStorage.getItem('tiles')).extraTile;
      localStorage.setItem('gameState', JSON.stringify(currentGameState));

      // Continue with the player turn logic after drag is completed
      if (isDropped) {
         updatePlayerCount();

         // Re-fetch the currentGameState after player count is updated
         currentGameState = JSON.parse(localStorage.getItem('gameState'));

         // Check if player gets another turn
         if (currentGameState.currentPlayerData.category === currentGameState.extraTile.category || currentGameState.extraTile.category === "extra") {
            showCustomAlert(`Player ${currentGameState.currentPlayer} gets another turn!`);
         } else {
            try {
               // Toggle turn if conditions for another turn are not met
               toggleTurn();
               currentGameState = JSON.parse(localStorage.getItem('gameState'));
            } catch (error) {
               // Optional: Provide feedback if game has ended
               showCustomAlert(`${error.message}. No further moves.`);
            }
         }
      }
   }


   // Set up the event listener for the extra tile dragging
   extraTilediv.addEventListener('mousedown', (e) => {
      e.preventDefault();
      handlePlayerTurn();
   });

   // Initialize the first player's turn
   showCustomAlert(`It's Player ${gameState.currentPlayer}'s turn.`);
}

window.addEventListener('load', PLAY);

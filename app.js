const symbols = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

let temp = [];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateTiles() {
    let set1 = document.getElementById('set1');
    let set2 = document.getElementById('set2');
    let extraTileContainer = document.getElementById('extraTile');


    set1.innerHTML = '';
    set2.innerHTML = '';
    extraTileContainer.innerHTML = '';


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


    set1Array.forEach(tile => {
        let tileDiv = document.createElement('div');
        tileDiv.classList.add('tile');
        tileDiv.innerText = tile.name;
        set1.appendChild(tileDiv);
    });


    let randomTile = shuffledTemp[Math.floor(Math.random() * shuffledTemp.length)];
    let extraTileDiv = document.createElement('div');
    extraTileDiv.innerText = randomTile.name;
    extraTileContainer.appendChild(extraTileDiv);


    set2Array.forEach(tile => {
        let tileDiv = document.createElement('div');
        tileDiv.classList.add('tile');
        tileDiv.innerText = tile.name;
        set2.appendChild(tileDiv);
    });
}

if (!localStorage.getItem('firstTimeLoad')) {
    generateTiles();
    localStorage.setItem('firstTimeLoad', 'true');
}

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

const muteButton = document.getElementById('playButton');
const muteIcon = document.getElementById('sound');
const audio = document.getElementById('backgroundMusic');

// Event listener to toggle mute
muteButton.addEventListener('click', () => {
    audio.muted = !audio.muted;

    muteIcon.src = audio.muted ? 'mute.png' : 'sound.png';
    muteIcon.alt = audio.muted ? 'Unmute' : 'Mute';
});

const restartButton = document.getElementById('reStart');

// Event listener to refresh tiles
restartButton.addEventListener('click', () => {
    generateTiles();
});
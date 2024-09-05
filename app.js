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
    extraTileDiv.classList.add('tile');
    extraTileDiv.innerText = randomTile.name;
    extraTileContainer.appendChild(extraTileDiv);


    set2Array.forEach(tile => {
        let tileDiv = document.createElement('div');
        tileDiv.classList.add('tile');
        tileDiv.innerText = tile.name;
        set2.appendChild(tileDiv);
    });
}

generateTiles();
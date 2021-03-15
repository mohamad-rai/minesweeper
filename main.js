const mineLocations = [];
const boardCells = [];
const mines = [];
const spaces = [];
const neighborsToCheck = [];
const result = document.getElementById("result");
const body = document.getElementById("body");
const beep = document.getElementById("beep");
const explode = document.getElementById("explode");
const victory = document.getElementById("victory");
let endGame = false;
//timer ↓
let timerText = document.getElementById('time'),
    seconds = 0, minutes = 0, hours = 0,
    t;
// start timer
const startTime = () => {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    timerText.textContent =
        (hours ? (hours > 9 ? hours : "0" + hours) : "00")
        + ":" +
        (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00")
        + ":" +
        (seconds > 9 ? seconds : "0" + seconds);
    timer();
}
const timer = () => {
    t = setTimeout(startTime, 1000);
}
// show mines
const saveIfIsMine = (row, col, td) => {
    let currentLocation = (row * 9) + col;
    if (mineLocations.includes(currentLocation)) {
        mines.push(td);
        td.classList.add("mine");
        return true;
    }
    return false;
}
// show mines and stop the game
const finishGame = (userExplode = 1) => mines.forEach(v => {
    endGame = true;
    beep.pause();
    userExplode === 1 ? explode.play() : victory.play();
    let score = document.getElementsByClassName("uncovered").length - mines.length + 1;
    result.innerText = `your score: ${score}`;
    clearTimeout(t);
    timerText.innerText = `in ${hours <= 9 ? "0" + hours : hours}:${minutes <= 9 ? "0" + minutes : minutes}:${seconds <= 9 ? "0" + seconds : seconds}`
    v.classList.add("uncovered");
});
// pick mine location
const pickMineFromBoard = mineCount => {
    for (let i = 0; i < mineCount; i++) {
        //                ↓ because after delete values will be different with indexes
        let index = random(boardCells.length);
        mineLocations.push(boardCells[index]);
        boardCells.splice(index, 1);
    }
}
// random number
const random = max => Math.floor(Math.random() * max);
// create logical cells of board
const makeMineCup = (row, col) => {
    for (let i = 0; i < (row * col); i++)
        boardCells.push(i);
}
// find neighbors
const validNeighbors = (rowIndex, columnIndex) => {
    let previousRow = spaces[rowIndex - 1] || [];
    let nextRow = spaces[rowIndex + 1] || [];
    let currentRow = spaces[rowIndex];
    let invalidNeighbors = [
        currentRow[columnIndex - 1], // west
        currentRow[columnIndex + 1], // east
        previousRow[columnIndex - 1], // southwest
        previousRow[columnIndex], // south
        previousRow[columnIndex + 1], // southeast
        nextRow[columnIndex - 1], // northwest
        nextRow[columnIndex], // north
        nextRow[columnIndex + 1] // northeast
    ];
    let neighbors = invalidNeighbors.filter(neighbor => neighbor != null && !neighbor.visit && !neighbor.flag);
    return neighbors;
}
/*
* create board for game and make mine location holder based on (row,col)
* param:
*   row (int) => for rows of board
*   col (int) => for cells of board
*/
const createTable = (row, col) => {
    let tr;
    let td;
    let table = document.createElement("table");
    table.setAttribute("id", "board");
    body.appendChild(table);
    for (let i = 0; i < row; i++) {
        tr = document.createElement("tr");
        table.appendChild(tr);
        spaces[i] = [];
        for (let j = 0; j < col; j++) {
            td = document.createElement("td");
            let isMine = saveIfIsMine(i, j, td);

            spaces[i][j] = {
                y: i,
                x: j,
                isMine: isMine,
                flag: false,
                visit: false,
                element: td
            };

            tr.appendChild(td);
        };
    }
}
// uncover and explode
const checkSpaces = (rowIndex, colIndex) => {
    spaces[rowIndex][colIndex].visit = true;
    let col = spaces[rowIndex][colIndex].element;
    let neighbors = validNeighbors(rowIndex, colIndex);
    let neighborMines = neighbors.filter(neighbor => neighbor.isMine);
    let neighborMinesCount = neighborMines.length;
    if (neighborMinesCount > 0) {
        col.classList.add("uncovered");
        col.innerText = neighborMinesCount;
        return;
    }
    else {
        col.classList.add("uncovered");
        neighbors.forEach(v => checkSpaces(v.y, v.x));
    }
}
// start and config the game
const start = (row, col, mineCount) => {
    makeMineCup(row, col);
    pickMineFromBoard(mineCount);
    createTable(row, col);
    timer();
    beep.play();

    // add listener
    spaces.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
            col.element.addEventListener("click", function () {
                if (endGame) {
                    alert("you finished the game!");
                    return false;
                }
                if (this.classList.contains('flag')) return false;
                let isMine = mineLocations.includes((rowIndex * 9) + colIndex);
                if (isMine) finishGame();
                else {
                    checkSpaces(rowIndex, colIndex, col.element);
                    let visitedCols = 0;
                    spaces.map(rowSpace => {
                        rowSpace.map(colSpace=>{
                            if(colSpace.visit) visitedCols++;
                        })
                    })
                    if(visitedCols === (spaces.length * 9) - mineCount) finishGame(0);
                }
            });
            col.element.addEventListener("contextmenu", function(e) {
                e.preventDefault();
                if (endGame) {
                    alert("you finished the game!");
                    return false;
                }
                this.classList.toggle('flag');
                spaces[rowIndex][colIndex].flag = !spaces[rowIndex][colIndex].flag;
            });
        });
    });
}
// restart the game
const restart = (row, col, mineCount) => {
    mineLocations.length = 0;
    boardCells.length = 0;
    mines.length = 0;
    spaces.length = 0;
    neighborsToCheck.length = 0;
    seconds = 0;
    minutes = 0;
    hours = 0;
    endGame = false;
    clearTimeout(t);
    body.innerHTML = "";
    start(row, col, mineCount);
}
const configGame = () => {
    let row = prompt("enter row:");
    let col = prompt("enter col:");
    let mineCount = prompt("enter mines count");
    restart(row,col,mineCount);
}
window.onload = restart(9,9,10);
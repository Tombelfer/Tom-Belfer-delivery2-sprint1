'use strict'
const MINE = '💣'
const EMPTY = ''
const FLAG = '🚩'
const LIVE = '❤️'
const BUTTON = '<button class="btn-field"> </button>';


var gBoard
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    cellsMarked: 0,
    cellsClicked: 0,
    life: 0
}
var gTimeInterval


var gLevels = [
    { size: 4, mines: 2, life: 1 },
    { size: 8, mines: 12, life: 2 },
    { size: 12, mines: 30, life: 3 }
]


function initGame(level = 0) {
    resetGame(level)
    gBoard = buildBoard(gLevels[level])
    renderBoard(gBoard, '.board-container')
    renderLife(gLevels[level])
}
function buildBoard(level = 0) {
    var board = []
    for (var i = 0; i < level.size; i++) {
        board[i] = []
        for (var j = 0; j < level.size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    setMinesOnBoard(level.mines, board)
    setMinesNegsCount(board)
    return board
}
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = countNeighbors(i, j, board)
        }
    }
}
function renderBoard(board, selector) {
    var strHTML = '<table border="1"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = (board[i][j].isMarked) ?
                FLAG :
                (!board[i][j].isShown) ? BUTTON :
                    (board[i][j].isMine) ? MINE : (board[i][j].minesAroundCount === 0) ?
                        EMPTY : board[i][j].minesAroundCount;
            var className = 'cell cell' + i + '-' + j;
            // var dataId = `data-i="${i}" data-j="${j}"`;  ${dataId}
            strHTML += `<td class="${className}" onClick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j})"> ${cell} </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}
function cellClicked(elCell, i, j) {
    console.log(gGame.shownCount)
    if (!gGame.isOn && gGame.shownCount > 0) return
    gGame.cellsClicked++
    if (gGame.cellsClicked === 1) {
        gTimeInterval = setInterval(() => {
            timer()
        }, 1000);
    }
    var dataCell = gBoard[i][j]
    if (dataCell.isMarked) return
    if (dataCell.isShown) return
    renderCell({ i, j }, (dataCell.minesAroundCount) ? dataCell.minesAroundCount : EMPTY)
    //in case of mine clicked
    if (dataCell.isMine) {
        if (!gGame.shownCount > 0) {
            onFirstClick({ i, j }, dataCell)
        } else {
            dataCell.isShown = true
            gGame.life--
            elCell.innerHTML = MINE
            if (gGame.life === 0) checkGameOver(true)
            document.querySelector('.life').innerText = gGame.life
            renderLife()
        }
    }
    // in case of non mind clicked
    if (gBoard[i][j].minesAroundCount === 0) {
        expandShown(gBoard, i, j)
        // gGame.shownCount++
        dataCell.isShown = true
    }
    gGame.shownCount++
    elCell.classList.add('shown')
    dataCell.isShown = true

    // elCell.classList.remove('btn-field')
    if (!gGame.isOn && gGame.lives > 0) {
        gGame.isOn = true;
        document.querySelector('.set-mines').classList.add('btn-disabled');
        startTimer();
    }
    checkGameOver()
}
function renderLife() {
    var elLives = document.querySelector('.life');
    var strHTML = LIVE.repeat(gGame.life);
    elLives.innerText = 'LIVES:' + strHTML;
}
function expandShown(board, cellI, cellJ) {
    var elNegsCell
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            // if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            elNegsCell = document.querySelector(`.cell${i}-${j}`)
            if (elNegsCell.innerHTML === `${FLAG}`) {
                continue
            }
            if (board[i][j].isShown) continue
            if (board[i][j].minesAroundCount !== 0 && !board[i][j].isShown) {
                renderCell({ i, j }, board[i][j].minesAroundCount)
                board[i][j].isShown = true
                gGame.shownCount++
                // expandShown(board, i, j)
            }
            if (board[i][j].minesAroundCount === 0 &&
                !board[i][j].isShown &&
                !board[i][j].isMine) {
                board[i][j].isShown = true
                gGame.shownCount++
                renderCell({ i, j }, EMPTY)
                expandShown(board, i, j)
            }
            var elNegsCell = document.querySelector(`.cell${i}-${j}`)
            elNegsCell.classList.add('shown')
        }
    }
}
function cellMarked(elCell, i, j) {
    if (!gGame.isOn) return
    var dataCell = gBoard[i][j]
    if (!dataCell.isShown) {
        if (dataCell.isMarked) {
            dataCell.isMarked = false
            elCell.innerHTML = BUTTON
            gGame.cellsMarked--

        } else {
            dataCell.isMarked = true
            elCell.innerHTML = FLAG
            gGame.cellsMarked++
        }
    }
    console.log(gGame.cellsMarked);
    console.log(dataCell);
}
function checkGameOver(isDead) {

    if (isDead) {
        renderFlags();
        gameOver()
        gGame.isOn = false;
    }
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var dataCell = gBoard[i][j]
            if (gBoard[i][j].isShown && !gBoard[i][j].isMine) {
                return false
            }
            if (gGame.life === 0) {
                if (dataCell.isMine && !dataCell.isShown) {
                    dataCell.isShown = true
                    document.querySelector(`.cell${i}-${j}`).innerHTML = MINE
                }
            }
        }
    }
    console.log(openCells)
}
function gameOver() {
    stopTimer()
    gGame.isOn = false
    console.log('Game over')
}
function setMinesOnBoard(mines, board) {
    for (var i = 0; i < mines; i++) {
        var cell = {
            i: getRandomInt(0, board.length),
            j: getRandomInt(0, board[0].length)
        }
        board[cell.i][cell.j].isMine = (board[cell.i][cell.j].isMine) ? setMinesOnBoard(1, board) : true
    }
}
function timer() {
    gGame.secsPassed++
    var x = document.querySelector('.timer')
    // console.log(x.innerHTML)
    x.innerHTML = `Timer    : ${gGame.secsPassed} sec`
}
function stopTimer() {
    clearInterval(gTimeInterval)
}
function onFirstClick(cell, dataCell) {
    console.log(dataCell)
    dataCell.isMine = false
    setMinesOnBoard(1, gBoard);
    setMinesNegsCount(gBoard);
    expandShown(gBoard, cell.i, cell.j)
    gGame.shownCount++;
}
function resetGame(level = 0) {
    gGame = {
        isOn: true,
        shownCount: 0,
        secsPassed: 0,
        cellsMarked: 0,
        cellsClicked: 0,
        life: gLevels[level].life
    }
}
function renderFlags() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine) {
                var cell = document.querySelector(`.cell${i}-${j}`)
                cell.innerHTML = `${FLAG}`
            }
        }
    }
}
window.oncontextmenu = (e) => {
    e.preventDefault();
}
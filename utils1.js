'use strict'

function countNeighbors(cellI, cellJ, board) {
  var neighborsCount = 0;
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue;
      if (j < 0 || j >= board[i].length) continue;
      if (board[i][j].isMine) neighborsCount++;
    }
  }
  return neighborsCount;
}


function renderCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function copyMat(mat) {
  var board = [];
  for(var i = 0; i < mat.length; i++) {
    board[i] = [];
    for(var j = 0; j < mat[i].length; j++) {
      board[i][j] = {
        minesAroundCount: mat[i][j].minesAroundCount,
        isShown: mat[i][j].isShown,
        isMine: mat[i][j].isMine,
        isMarked: mat[i][j].isMarked
      }
    }
  }
  return board;
}


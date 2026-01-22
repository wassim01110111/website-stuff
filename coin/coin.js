const board = document.getElementById("board");
const rows = boardMatrix.length;
let selectedCoin = null;
let allowedMoves = [];

const maxCols = Math.max(...boardMatrix.map((row) => row.length));
board.style.gridTemplateColumns = `repeat(${maxCols}, 60px)`;

let history = [];

function saveHistory() {
  history.push(JSON.parse(JSON.stringify(boardMatrix)));
  if (history.length > 50) history.shift();
}

function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < maxCols; j++) {
      const cell = document.createElement("div");
      cell.classList.add("coin-cell");
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.style.borderTop = "1px solid #333";
      cell.style.borderBottom = "1px solid #333";
      cell.style.borderLeft = "1px solid #333";
      cell.style.borderRight = "1px solid #333";

      const value = boardMatrix[i]?.[j];

      if (value === 1) {
        cell.classList.add("coin-wall");
      } else if (value === 0) {
        cell.classList.add("coin-empty");
      } else if (value === 2) {
        cell.classList.add("coin-empty");
        const coin = document.createElement("img");
        coin.src = "../images/coin.png";
        coin.classList.add("coin");

        const moves = canMove(i, j);
        cell.dataset.canMove = moves.length > 0 ? "true" : "false";
        coin.style.cursor = moves.length > 0 ? "pointer" : "default";
        cell.appendChild(coin);
      } else {
        cell.style.backgroundColor = "transparent";
      }

      cell.addEventListener("click", () => onCellClick(cell));
      board.appendChild(cell);
    }
  }
}

function canMove(i, j) {
  const moves = [];
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];
  for (const [dx, dy] of directions) {
    const ni = i + dx * 2;
    const nj = j + dy * 2;
    const midI = i + dx;
    const midJ = j + dy;
    if (
      ni >= 0 &&
      ni < rows &&
      nj >= 0 &&
      nj < (boardMatrix[ni]?.length || 0) &&
      midI >= 0 &&
      midI < rows &&
      midJ >= 0 &&
      midJ < (boardMatrix[midI]?.length || 0)
    ) {
      if (boardMatrix[midI][midJ] === 2 && boardMatrix[ni][nj] === 0) {
        moves.push([ni, nj]);
      }
    }
  }
  return moves;
}

function onCellClick(cell) {
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  const value = boardMatrix[row]?.[col];
  const coinEl = cell.querySelector(".coin");

  if (selectedCoin === null) {
    if (value !== 2) {
      statusDiv.textContent = "Select a coin first.";
      return;
    }
    const moves = canMove(row, col);
    if (moves.length === 0) {
      statusDiv.textContent = "This coin cannot move.";
      return;
    }

    document
      .querySelectorAll(".selected")
      .forEach((c) => c.classList.remove("selected"));
    selectedCoin = [row, col];
    allowedMoves = moves;
    if (coinEl) coinEl.classList.add("selected");

    document
      .querySelectorAll(".highlight")
      .forEach((c) => c.classList.remove("highlight"));
    allowedMoves.forEach(([r, c]) => {
      const target = document.querySelector(
        `.coin-cell[data-row='${r}'][data-col='${c}']`,
      );
      if (target) target.classList.add("highlight");
    });

    statusDiv.textContent = "Select a highlighted cell to move the coin.";
  } else {
    if (selectedCoin[0] === row && selectedCoin[1] === col) {
      selectedCoin = null;
      allowedMoves = [];
      document
        .querySelectorAll(".highlight")
        .forEach((c) => c.classList.remove("highlight"));
      document
        .querySelectorAll(".selected")
        .forEach((c) => c.classList.remove("selected"));
      statusDiv.textContent = "Coin deselected.";
      return;
    }

    if (!allowedMoves.some(([r, c]) => r === row && c === col)) {
      statusDiv.textContent = "Cannot move coin to that position.";
      return;
    }

    const fromRow = selectedCoin[0];
    const fromCol = selectedCoin[1];
    const midRow = (fromRow + row) / 2;
    const midCol = (fromCol + col) / 2;

    saveHistory();
    boardMatrix[fromRow][fromCol] = 0;
    boardMatrix[midRow][midCol] = 0;
    boardMatrix[row][col] = 2;

    selectedCoin = null;
    allowedMoves = [];
    document
      .querySelectorAll(".highlight")
      .forEach((c) => c.classList.remove("highlight"));
    document
      .querySelectorAll(".selected")
      .forEach((c) => c.classList.remove("selected"));
    createBoard();
    statusDiv.textContent = "Coin moved.";
    checkWin();
    updateMoveCount?.();
  }
}

function checkWin() {
  let coinCount = 0;
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < (boardMatrix[i]?.length || 0); j++)
      if (boardMatrix[i][j] === 2) coinCount++;
  if (coinCount === 1)
    showwinMessage("You have successfully scammed the Lord of Toilets!");
}

createBoard();

document.getElementById("undo").addEventListener("click", () => {
  if (history.length > 0) {
    const prev = history.pop();
    for (let i = 0; i < rows; i++)
      for (let j = 0; j < (boardMatrix[i]?.length || 0); j++)
        boardMatrix[i][j] = prev[i][j];
    createBoard();
    statusDiv.textContent = "Undo performed.";
  }
});

// rotation: 0 = up   1 = right   2 = down  3 = left
const gridElement = document.getElementById("grid");
const undoButton = document.getElementById("undo");

let undoCount = 5;
undoButton.textContent = `Undo (${undoCount} left)`;
const playerImg = document.createElement("img");
playerImg.src = "../images/amon.png";
playerImg.classList.add("player");

if (typeof LEVEL_MATRIX === "undefined") {
  throw new Error("LEVEL_MATRIX not defined in HTML");
}

const DIRS = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

let grid;
let player;
let history = [];
let firstRender = false;
function reset() {
  grid = JSON.parse(JSON.stringify(LEVEL_MATRIX));
  player = { x: 0, y: 0 };
  history = [];
  render();
}

reset();

function render() {
  moveSpan.textContent = moveCount;
  gridElement.innerHTML = "";
  gridElement.style.gridTemplateColumns = `repeat(${grid[0].length}, 150px)`;

  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      const div = document.createElement("div");
      div.classList.add("cell");

      if (cell.type === "solid") {
        div.classList.add("solid");
      } else if (cell.type === "clock") {
        div.classList.add("clock", cell.color);

        cell.directions.forEach((d) => {
          const hand = document.createElement("div");
          hand.classList.add("hand");
          hand.style.color = cell.color;
          hand.style.transform = `rotate(${d * 90}deg)`;
          if (player.x === x && player.y === y) {
            hand.classList.add("active");
          }
          div.appendChild(hand);
        });
      } else if (cell.type === "win" && !firstRender) {
        const foolImage = document.createElement("img");
        foolImage.src = "../images/fool.png";
        foolImage.classList.add("winblock");
        div.appendChild(foolImage);
      } else if (cell.type === "death") {
        div.classList.add("death");
      }
      if (player.x === x && player.y === y) {
        div.appendChild(playerImg);
      }

      gridElement.appendChild(div);
    });
  });
}

function getClockDirections(cell) {
  if (cell.hands === 1) return [cell.rotation];
  return [cell.rotation, (cell.rotation + 2) % 4];
}

function rotateClocks() {
  grid.forEach((row) =>
    row.forEach((cell) => {
      if (cell.type === "clock") {
        const delta = cell.color === "purple" ? -1 : 1;

        cell.directions = cell.directions.map((d) => (d + delta + 4) % 4);
      }
    }),
  );
}

function move(dir) {
  if (gameOver) return;
  statusDiv.textContent = "";
  const cell = grid[player.y][player.x];

  if (cell.type === "clock") {
    if (!cell.directions.includes(dir)) {
      statusDiv.textContent = "The clock doesn't allow you to move this way";
      return;
    }
  }
  moveCount++;

  history.push({
    grid: JSON.parse(JSON.stringify(grid)),
    player: { ...player },
  });

  const nx = player.x + DIRS[dir].x;
  const ny = player.y + DIRS[dir].y;

  if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length) {
    showDeathMessage("You accidentally lost connection to Sefirah Castle.");
    gameOver = true;
    return;
  }

  player.x = nx;
  player.y = ny;

  const landingCell = grid[player.y][player.x];
  if (landingCell.type === "win") {
    showwinMessage("Congratulations! You stole Sefirah Castle!");
    gameOver = true;
  } else if (landingCell.type === "death") {
    showDeathMessage("Klein killed you!");
    gameOver = true;
  } else if (moveCount > maxMove) {
    showDeathMessage("Klein caught you! You weren't fast enough...");
    gameOver = true;
  }
  rotateClocks();
  render();
}

window.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"].includes(e.key)) {
    e.preventDefault();

    if (e.key === "ArrowUp") move(0);
    if (e.key === "ArrowRight") move(1);
    if (e.key === "ArrowDown") move(2);
    if (e.key === "ArrowLeft") move(3);
  }
  if (e.key === "Backspace") {
    e.preventDefault();
    undo();
  }
});
document.getElementById("up").addEventListener("click", () => move(0));
document.getElementById("right").addEventListener("click", () => move(1));
document.getElementById("down").addEventListener("click", () => move(2));
document.getElementById("left").addEventListener("click", () => move(3));
function undo() {
  if (gameOver) return;
  if (undoCount < 1) {
    statusDiv.textContent = "Out of undo's!";
    return;
  }
  undoCount--;
  undoButton.textContent = `Undo (${undoCount} left)`;
  if (!history.length) return;
  moveCount--;
  const prev = history.pop();
  grid = prev.grid;
  player = prev.player;
  render();
}
undoButton.onclick = undo;

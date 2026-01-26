const board = document.getElementById("board");
const rows = boardMatrix.length;
const maxCols = Math.max(...boardMatrix.map((row) => row.length));
const undoButton = document.getElementById("undo");
const gameGrid = document.getElementById("game-grid");
let selectedCoin = null;
let allowedMoves = [];
let gotoOffset = 0;

const previousPuzzle = htmlFile.replace(
  /^maze(\d+)\.html$/,
  (_, n) => "maze" + (+n - 1) + ".html",
);
const characterSet = [];
const kamikazeSet = [];
const playable = new Set(["kamikaze", "character"]);
const characters = {
  klein: ["Klein", "../images/klein.png"],
  xio: ["Xio", "../images/xio.png"],
  fors: ["Fors", "../images/fors.png"],
  kemeow: ["Kemeow", "../images/kemeow.png"],
  cuttlefish: ["CuttleFish", "../images/cuttlefish.png"],
  derrick: ["Derrick", "../images/derrickemote.png"],
  gehrman: ["Gehrman", "../images/gehrmanemote.png"],
  lumian: ["Lumian", "../images/lumianemote.png"],
};
const introRules = [
  "The Celestial Worthy of Heaven and Earth for blessings has frozen the floors of Sefirah Castle.",
  "'He' has started awakening and is about to take control of the Castle.",
  `You only have ${maxMove} moves before he fully awakens to stop him!`,
];
const directions = { 0: "top", 1: "bottom", 2: "left", 3: "right" };
let moving = false;
const boardPadding = 20;
let cleanMaze = [];
let characterID = 0;
const objDefault = { spring: { bounces: 4 } };
const collisionTime = 1;
function cellMaker(cellDict) {
  const cellInfo = {
    ground: { type: "empty", obj: null },
    walls: [0, 0, 0, 0],
    character: null,
    obj: null,
    hazard: null,
    destination: null,
  };
  const directAssign = new Set(["obj", "hazard"]);
  for (const key in cellDict) {
    if (cellDict[key] !== null) {
      if (playable.has(key)) {
        const [name, image] = characters[cellDict[key]];
        cellInfo.character = {
          who: cellDict[key],
          type: key,
          name,
          image,
          obj: { ...{ name: cellDict.obj }, ...objDefault[cellDict.obj] },
        };
      } else if (key === "destination") {
        const [name, image] = characters[cellDict[key]];
        characterSet.push(name);
        cellInfo[key] = { who: cellDict[key], name };
      } else if (directAssign.has(key)) {
        cellInfo[key] = cellDict[key];
      } else if (key === "ground") {
        cellInfo.ground.type = cellDict[key];
      } else if (key === "walls") {
        if (cellDict.walls.length === 2) {
          cellInfo.walls = [0, cellDict.walls[0], 0, cellDict.walls[1]];
        } else {
          cellInfo.walls = cellDict[key];
        }
      }
    }
  }
  if (cellInfo.obj !== null && cellInfo.character === null) {
    cellInfo.ground.obj = cellInfo.obj;
  }
  return cellInfo;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function equalArray(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
const undoHistory = [];
let selectedCharacter = null;
function saveHistory() {
  undoHistory.push(structuredClone(cleanMaze));
  if (undoHistory.length > 50) undoHistory.shift();
}
function movableCharacter(position, character) {
  const imgSrc = character.image;
  const charID = character.who;
  const movable = document.createElement("div");
  const gridChar = document.createElement("img");
  gridChar.src = imgSrc;
  movable.style.backgroundImage = `url(${imgSrc})`;
  const charName = document.createElement("span");
  const gridContainer = document.createElement("div");
  charName.textContent = character.name;
  if (character.type === "kamikaze") {
    kamikazeSet.push(character.name);
    charName.style.color = "red";
  }
  gridContainer.appendChild(gridChar);
  gridContainer.appendChild(charName);
  gameGrid.appendChild(gridContainer);
  movable.id = charID;
  gridContainer.dataset.id = charID;
  gridContainer.className = "grid-char";

  movable.addEventListener("click", () => {
    selectCharacter(null, charID);
  });
  gridContainer.addEventListener("click", () => {
    selectCharacter(null, charID);
  });
  movable.className = "movable-character";
  if (character.obj !== null) {
    movable.classList.add(`obj-${character.obj.name}`);
    movable.dataset.obj = character.obj.name;
  }
  movable.dataset.obj = character.obj.name;
  movable.dataset.index = position;
  document.body.appendChild(movable);
  characterID++;
  return movable;
}
function selectCharacter(index = null, charId = null) {
  document.querySelectorAll(".character-selected").forEach((el) => {
    el.classList.remove("character-selected");
  });
  let char;
  if (charId === null) {
    if (index === null) {
      char = document.getElementById(
        Array.from(gameGrid.children).find(
          (el) => !el.classList.contains("dead-char-selec"),
        ).dataset.id,
      );
    } else {
      char = document.querySelector(
        `.movable-character[data-index="${index}"]`,
      );
    }
  } else {
    char = document.getElementById(charId);
  }
  if (char.classList.contains("movable-dead")) {
    writeToStatus(`${characters[char.id][0]} cannot be moved, they have died.`);
  } else {
    char.classList.add("character-selected");
    selectedCharacter = char;
  }
  return char;
}

function goToCell(img, cell, animation = false, speed = 10) {
  const rect = cell.getBoundingClientRect();
  img.classList.remove("movable-dead");
  if (animation) {
    img.style.transition = `left ${speed / 100}s ease, top ${speed / 100}s ease`;
    setTimeout(() => {
      img.style.transition = "";
    }, speed * 10);
  } else {
    img.style.transition = "";
  }
  img.style.left = `${rect.left + window.scrollX + gotoOffset}px`;
  img.style.top = `${rect.top + window.scrollY + gotoOffset}px`;
}
function posToArray(position) {
  return position.split("-").map(Number);
}
async function checkDirection(
  currentCharacter,
  position,
  img,
  direction,
  step = null,
) {
  let landingCell = null;
  const directionVectors = {
    0: [-1, 0],
    1: [1, 0],
    2: [0, -1],
    3: [0, 1],
  };
  const characterName = currentCharacter.name;
  const oppositeDirection = direction ^ 1;
  async function collision(rw, cl, lanCell) {
    selectedCharacter.style.animation = `bump-${directions[direction]} ${collisionTime / 10}s ease-out`;
    await sleep(collisionTime * 100);
    selectedCharacter.style.animation = "";
    if (currentCharacter.obj.name === "spring") {
      if (currentCharacter.obj.bounces > 0) {
        currentCharacter.obj.bounces--;
        return checkDirection(
          currentCharacter,
          [rw, cl],
          img,
          oppositeDirection,
          1,
        );
      } else {
        return [false, null, `${characterName} bounced off the Castle`];
      }
    }
    return lanCell !== null
      ? [[rw, cl], lanCell, ""]
      : [[rw, cl], null, "Something is blocking the path"];
  }
  function wallCollision(row, col, drct, cellWall = null) {
    const currentWall = cleanMaze[row][col].walls[drct];
    if (currentWall === 0) {
      return true;
    } else if (currentWall === 1) {
      return false;
    } else if (currentWall === 2) {
      if (cellWall === null) {
        cellWall = document.querySelector(
          `.maze-cell[data-index="${row}-${col}"]`,
        );
      }
      cleanMaze[row][col].walls[drct] = 0;
      cellWall.classList.remove(`${directions[drct]}Wall`);
      const [rowDelta, colDelta] = directionVectors[drct];
      const adjRow = row + rowDelta;
      const adjCol = col + colDelta;
      const oppositeDir = drct ^ 1;

      if (adjRow >= 0 && adjRow < rows && adjCol >= 0 && adjCol < maxCols) {
        const adjCell = document.querySelector(
          `.maze-cell[data-index="${adjRow}-${adjCol}"]`,
        );
        if (adjCell) {
          adjCell.classList.remove(`${directions[oppositeDir]}Wall`);
          cleanMaze[adjRow][adjCol].walls[oppositeDir] = 0;
        }
      }
      return null;
    }
  }
  let [row, col] = position;
  const [rowDelta, colDelta] = directionVectors[direction];
  while (true) {
    if (!wallCollision(row, col, direction, null)) {
      return await collision(row, col, landingCell);
    }
    row += rowDelta;
    col += colDelta;

    if (
      row < 0 ||
      row >= cleanMaze.length ||
      col < 0 ||
      col >= cleanMaze[0].length
    ) {
      return [false, landingCell, `${characterName} slid off the Castle`];
    }

    const cell = document.querySelector(
      `.maze-cell[data-index="${row}-${col}"]`,
    );
    const cellDictionary = cleanMaze[row][col];
    const cellObj = cellDictionary.ground.obj;
    if (cellObj !== null) {
      if (currentCharacter.obj === null) {
        cell.classList.remove(`obj-${cellObj}`);
        img.classList.add(`obj-${cellObj}`);
        currentCharacter.obj = {
          ...{ name: cellObj },
          ...objDefault[cellObj],
        };
        img.dataset.obj = cellObj;
        cellDictionary.ground.obj = null;
      } else if (currentCharacter.obj.name !== cellObj) {
        cell.classList.remove(`obj-${cellObj}`);
        img.classList.add(`obj-${cellObj}`);
        cellDictionary.ground.obj = currentCharacter.obj.name;
        img.classList.remove(`obj-${currentCharacter.obj.name}`);
        cell.classList.add(`obj-${currentCharacter.obj.name}`);
        img.dataset.obj = cellObj;
        currentCharacter.obj = {
          ...{ name: cellObj },
          ...objDefault[cellObj],
        };
      }
    }
    if (cellDictionary.ground.type === "hole") {
      goToCell(img, cell, true);
      return [false, landingCell, `${characterName} fell in a hole`];
    } else if (cellDictionary.ground.type === "fragile") {
      cleanMaze[row][col].ground.type = "hole";
      cell.classList.remove("maze-fragile");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          cell.classList.add("maze-hole");
        });
      });
      cell.classList.add("maze-hole");
      if (
        !wallCollision(row, col, direction, cell) ||
        cleanMaze[row + rowDelta][col + colDelta].character !== null
      ) {
        if (
          currentCharacter.obj !== null &&
          currentCharacter.obj.name === "spring"
        ) {
          return await collision(row, col, oppositeDirection, cell);
        } else {
          goToCell(img, cell, true);
          return [false, landingCell, `${characterName} fell in a hole`];
        }
      } else if (step === 1) {
        goToCell(img, cell, true);
        return [false, landingCell, `${characterName} fell in a hole`];
      }
    } else if (
      (cellDictionary.character !== null &&
        cellDictionary.character !== currentCharacter) ||
      !wallCollision(row, col, oppositeDirection, cell)
    ) {
      return await collision(row - rowDelta, col - colDelta, landingCell);
    }
    goToCell(img, cell, true);
    landingCell = cell;
    if (step !== null) {
      step--;
      if (step < 1) return [[row, col], cell, ""];
    }
  }
}
function checkWin() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < maxCols; j++) {
      const value = cleanMaze[i][j];
      if (value.character !== null && value.character.type === "kamikaze") {
        return false;
      }
      if (value.destination !== null) {
        if (
          value.character === null ||
          value.destination.who !== value.character.who
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

async function move(direction) {
  if (moving || gameOver) return;
  moving = true;
  const selectedPosition = posToArray(selectedCharacter.dataset.index);
  const mazePos = cleanMaze[selectedPosition[0]][selectedPosition[1]];
  const currentCharacter =
    cleanMaze[selectedPosition[0]][selectedPosition[1]].character;
  const [result, cell, reason] = await checkDirection(
    currentCharacter,
    selectedPosition,
    selectedCharacter,
    direction,
  );
  if (mazePos.character.obj !== null) {
    mazePos.character.obj = {
      ...{ name: mazePos.character.obj.name },
      ...objDefault[mazePos.character.obj.name],
    };
  }
  writeToStatus(reason);
  if (result === false) {
    document
      .querySelector(`.grid-char[data-id="${mazePos.character.who}"]`)
      .classList.add("dead-char-selec");
    selectedCharacter.style.transition = "opacity 0.5s ease-out";
    selectedCharacter.classList.add("movable-dead");
    setTimeout(() => {
      selectedCharacter.style.transition = "";
    }, 500);
    const wasImportant = document.querySelector(
      `.maze-cell[data-who="${mazePos.character.who}"]`,
    );
    const charName = mazePos.character.name;
    mazePos.character = null;
    if (wasImportant) {
      showDeathMessage(
        `${charName} was needed to stop the Celestial Worthy, he has now awoken!` +
          (undoCounter > 0
            ? `<br><br><button onclick="gameNotOver()">Use Yesterday Once More Charm</button>`
            : ""),
      );
    } else if (checkWin()) {
      showwinMessage(
        "You managed to stop the Celestial Worthy from awakening!",
      );
    } else {
      selectCharacter();
    }
  } else if (!equalArray(result, selectedPosition)) {
    const [rowCell, Colcell] = result;
    cleanMaze[rowCell][Colcell].character = structuredClone(mazePos.character);
    mazePos.character = null;
    selectedCharacter.dataset.index = cell.dataset.index;
    if (checkWin()) {
      showwinMessage(
        "You managed to stop the Celestial Worthy from awakening!",
      );
    }
  }
  if (
    JSON.stringify(cleanMaze) !==
    JSON.stringify(undoHistory[undoHistory.length - 1])
  ) {
    updateMoveCount();
    if (moveCount > maxMove) {
      showDeathMessage(
        `You weren't fast enough. The Celestial Worthy has awoken!!!` +
          (undoCounter > 0
            ? `<br><br><button onclick="gameNotOver()">Use Yesterday Once More Charm</button>`
            : ""),
      );
    }

    saveHistory();
  }
  moving = false;
}
function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < rows; i++) {
    const row = document.createElement("div");
    row.className = "maze-row";
    cleanMaze.push([]);
    for (let j = 0; j < maxCols; j++) {
      const cell = document.createElement("div");
      function buildWalls(wallsArr) {
        const [top, bottom, left, right] = wallsArr;

        const values = { top, bottom, left, right };

        for (const dir in values) {
          const dirName = `${dir}Wall`;
          cell.dataset[dirName] = values[dir];
          if (values[dir] !== 0) {
            cell.classList.add(dirName);
            if (values[dir] === 2) {
              cell.classList.add(`${dir}BreakableWall`);
            }
          }
        }
      }

      cell.className = "maze-cell";
      cell.dataset.index = `${i}-${j}`;
      cell.dataset.row = i;
      cell.dataset.col = j;

      const value = cellMaker(boardMatrix[i][j]);
      if (i > 0) {
        value.walls[0] = cleanMaze[i - 1][j].walls[1];
      }
      if (j > 0) {
        value.walls[2] = cleanMaze[i][j - 1].walls[3];
      }
      cleanMaze[i][j] = value;
      if (value.character !== null) {
        const character = movableCharacter(cell.dataset.index, value.character);
      }
      if (value.destination !== null) {
        const platform = document.createElement("div");
        platform.classList.add("maze-platform");
        platform.textContent = value.destination.name;
        cell.dataset.who = value.destination.who;
        cell.appendChild(platform);
      }
      if (value.ground.obj !== null) {
        cell.classList.add(`obj-${value.obj}`);
      }
      cell.classList.add(`maze-${value.ground.type}`);
      buildWalls(value.walls);
      row.appendChild(cell);
      board.appendChild(row);
    }
  }
}

createBoard();

board.style.padding = `${boardPadding}px`;
function setCellSize() {
  const boardRect = board.getBoundingClientRect();

  const cellSize = Math.floor(
    Math.min(
      (boardRect.width - boardPadding) / maxCols,
      (boardRect.height - boardPadding) / rows,
    ),
  );
  gotoOffset = cellSize / 10;
  document.querySelectorAll(".maze-cell").forEach((cell) => {
    cell.style.width = cellSize + "px";
  });
  document.querySelectorAll(".movable-character").forEach((el) => {
    const cell = document.querySelector(
      `.maze-cell[data-index="${el.dataset.index}"]`,
    );
    goToCell(el, cell);
    el.style.width = `${cellSize - gotoOffset * 2}px`;
  });
  document.documentElement.style.setProperty(
    "--bump-length",
    cellSize / 3 + "px",
  );
  return cellSize;
}
window.addEventListener("resize", () => {
  setCellSize();
});
const allRules = [...introRules, ...iniRules];
if (
  previousPuzzle !== "maze0.html" &&
  !playerData.completedLevels[previousPuzzle]
) {
  allRules.push(
    `<a 
      href="${previousPuzzle}" 
      style="text-decoration: none; color: inherit; cursor: pointer;" 
      onclick="window.location.href='${previousPuzzle}'" 
      onmouseover="this.style.color='yellow'" 
      onmouseout="this.style.color='inherit'">
    These puzzles are better when played in order; you should complete the previous puzzle before this one: <strong>Click on this to go to the previous puzzle.</strong>
  </a>`,
  );
}
if (characterSet.length > 0) {
  allRules.push(
    `Help ${characterSet.join(", ")} reach their destination safely.`,
  );
}
if (kamikazeSet.length > 0) {
  allRules.push(`Help ${kamikazeSet.join(", ")} leave Sefirah Castle!`);
}
generateRules(allRules);
selectCharacter();
saveHistory();
setCellSize();
undoButton.textContent = `Yesterday Once More Charm${undoCounter > 1 ? "s" : ""} (${undoCounter} left)`;
function fixBoard(dict) {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < maxCols; j++) {
      const value = dict[i][j];
      const oldValue = cleanMaze[i][j];
      if (JSON.stringify(value) === JSON.stringify(oldValue)) {
        continue;
      }
      const cell = document.querySelector(`.maze-cell[data-index="${i}-${j}"]`);
      if (value.character !== null) {
        const charac = document.getElementById(value.character.who);
        document
          .querySelector(`.grid-char[data-id="${value.character.who}"]`)
          .classList.remove("dead-char-selec");
        if (charac.dataset.obj !== "null") {
          charac.classList.remove(`obj-${charac.dataset.obj}`);
          charac.dataset.obj = "null";
        }
        if (value.character.obj !== null) {
          charac.classList.add(`obj-${value.character.obj.name}`);
        }
        charac.dataset.obj = value.character.obj.name;
        charac.classList.remove("movable-dead");
        charac.dataset.index = `${i}-${j}`;
        goToCell(charac, cell, false);
      }
      if (value.ground.type !== oldValue.ground.type) {
        cell.classList.add(`maze-${value.ground.type}`);
        cell.classList.remove(`maze-${oldValue.ground.type}`);
      }
      if (value.ground.obj !== oldValue.ground.obj) {
        cell.classList.remove(`obj-${oldValue.ground.obj}`);
        cell.classList.add(`obj-${value.ground.obj}`);
      }
      value.walls.forEach((wall, index) => {
        if (wall === 2 && wall !== oldValue.walls[index]) {
          const dir = directions[index];
          cell.classList.add(`${dir}Wall`);
          cell.classList.add(`${dir}BreakableWall`);
        }
      });
    }
  }
}

function gameNotOver() {
  gameOver = false;
  deathOverlay.classList.remove("show");
  undo();
}

function undo() {
  if (moveCount === 0) {
    writeToStatus("Nothing to Reverse", "yellow");
    return;
  }
  if (undoCounter < 1) return;
  undoCounter--;
  undoButton.textContent = `Yesterday Once More Charm${undoCounter > 1 ? "s" : ""} (${undoCounter} left)`;
  if (undoCounter < 1) {
    undoButton.style.display = "none";
  }
  updateMoveCount(true);
  undoHistory.pop();
  const lastMaze = undoHistory[undoHistory.length - 1];
  fixBoard(lastMaze);
  cleanMaze = JSON.parse(JSON.stringify(lastMaze));
  writeToStatus("Yesterday Once More Charm used.");
}
undoButton.addEventListener("click", undo);

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (!gameOver) {
    if (["arrowup", "arrowright", "arrowdown", "arrowleft"].includes(key)) {
      e.preventDefault();

      if (key === "arrowup") move(0);
      else if (key === "arrowdown") move(1);
      else if (key === "arrowleft") move(2);
      else if (key === "arrowright") move(3);
    } else if (key === "backspace" || key === "z") {
      e.preventDefault();
      undo();
    } else if (key === "tab") {
      e.preventDefault();
      getNextAliveChar();
    }
  }

  if (key === "r") {
    e.preventDefault();
    location.reload();
  }
});

function getNextAliveChar() {
  const currentChar = document.querySelector(
    `.grid-char[data-id="${selectedCharacter.id}"]`,
  );
  const allChars = Array.from(document.querySelectorAll(".grid-char"));
  const currentIndex = allChars.indexOf(currentChar);

  for (let i = 1; i <= allChars.length; i++) {
    const nextIndex = (currentIndex + i) % allChars.length;
    const nextChar = allChars[nextIndex];

    if (!nextChar.classList.contains("dead-char-selec")) {
      console.log(nextChar);
      selectCharacter(null, nextChar.dataset.id);
      return;
    }
  }
}
document.getElementById("up").addEventListener("click", () => move(0));
document.getElementById("down").addEventListener("click", () => move(1));
document.getElementById("left").addEventListener("click", () => move(2));
document.getElementById("right").addEventListener("click", () => move(3));

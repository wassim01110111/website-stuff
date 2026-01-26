const grid = document.getElementById("grid");
const undoButton = document.getElementById("undo");
let selectedImage = null;
const chairMap = {
  klein: "The Fool",
  audrey: "Justice",
  fors: "The Magician",
  gehrman: "The World",
  lumian: "The Chariot",
  derrick: "The Sun",
};
const moveHistory = [];

const tarotMembers = gridData
  .map((row) => row[0])
  .filter((str) => typeof str === "string" && str !== "")
  .map((str) => capitalize(str))
  .join(", ");
allRules.push(
  ...[
    `Your task is to guide ${tarotMembers} respectively back to their correct seats by following these rules carefully:`,

    "They may move to any <strong>Empty Chair</strong> directly next to them.",
    "If an <strong>Empty Chair</strong> is exactly one <strong>Tarot Member</strong> away, they may jump over that single member to reach it.",
    "<strong>Jumping</strong> over two <strong>Tarot Members</strong> at once is strictly forbidden.",
    "Tap a <strong>Tarot Member</strong>, then move them according to the <strong>Rules</strong> to restore order.",
    `Hurry! They only have <strong>${maxMove}</strong> <strong>Moves</strong> left before the clock strikes <strong>3 O'clock</strong> and the <strong>Tarot Gathering</strong> begins.`,
  ],
);
generateRules(allRules);
function highlightEmpty(pos, original) {
  const img = grid.querySelector(`img[data-position="${pos}"]`);
  if (img.dataset.name === "") {
    grid.children[pos].classList.add("chair-highlight");
    selectedImage = original;
    return true;
  } else {
    return false;
  }
}
function checkWin() {
  const cells = document.querySelectorAll(".chair-cell");
  return Array.from(cells).every((cell) => {
    const imgName = cell.querySelector("img")?.dataset.name || "";
    const platformName =
      cell.querySelector(".chair-platform")?.dataset.name || "";
    return imgName === platformName;
  });
}

gridData.forEach(([name, place], index) => {
  const cell = document.createElement("div");
  cell.classList.add("chair-cell");
  cell.dataset.name = name || "";
  cell.dataset.index = index;
  const img = document.createElement("img");
  img.dataset.position = index;
  img.dataset.name = name;
  if (name) {
    img.src = `../images/${name}emote.png`;
  }
  cell.appendChild(img);
  cell.addEventListener("click", (e) => {
    if (selectedImage !== null) {
      const selImg = grid.querySelector(
        `img[data-position="${selectedImage}"]`,
      );
      if (cell.classList.contains("chair-highlight")) {
        updateMoveCount();
        writeToStatus("");

        moveHistory.push(
          structuredClone({
            from: {
              index: selectedImage,
              name: selImg.dataset.name,
              src: selImg.dataset.src,
            },
            to: {
              index: parseInt(cell.dataset.index),
            },
          }),
        );
        img.src = selImg.src;
        img.dataset.name = selImg.dataset.name;
        selImg.dataset.name = "";
        selImg.src = "";
        if (checkWin()) {
          showwinMessage(
            "You made it just in time before the Tarot Gathering!",
          );
        } else if (moveCount >= maxMove) {
          showDeathMessage(
            "The clock struck three yet the chairs remain in disarray..." +
              (undoCount > 0
                ? `<br><br><button onclick="gameNotOver()">Use Yesterday Once More Charm</button>`
                : ""),
          );
        }
      } else if (selectedImage === parseInt(cell.dataset.index)) {
        writeToStatus("");
      } else {
        writeToStatus(
          `You cannot place ${capitalize(selImg.dataset.name)} there.`,
        );
      }
      document
        .querySelectorAll(".chair-highlight")
        .forEach((c) => c.classList.remove("chair-highlight"));
      selectedImage = null;
    } else if (img.dataset.name !== "") {
      const position = parseInt(img.dataset.position);
      if (position > 0) {
        if (highlightEmpty(position - 1, position)) {
        } else if (position - 1 > 0) {
          highlightEmpty(position - 2, position);
        }
      }
      if (position < gridData.length - 1) {
        if (highlightEmpty(position + 1, position)) {
        } else if (position < gridData.length - 2) {
          highlightEmpty(position + 2, position);
        }
      }
      if (selectedImage !== null) {
        writeToStatus(`Where should ${capitalize(img.dataset.name)} go?`);
      } else {
        writeToStatus(
          `There is nowhere for ${capitalize(img.dataset.name)} to go.`,
        );
      }
    }
  });
  if (place !== "") {
    const platform = document.createElement("div");
    platform.classList.add("chair-platform");
    platform.dataset.name = place;
    platform.textContent = chairMap[place];
    cell.appendChild(platform);
  }

  grid.appendChild(cell);
});
function gameNotOver() {
  gameOver = false;
  deathOverlay.classList.remove("show");
  undoMove();
}
function undoMove() {
  if (undoCount < 1) {
    writeToStatus("Out of Yesterday Once More charms");
    return;
  }
  if (moveHistory.length < 1) {
    writeToStatus("Nothing to Revert");
    return;
  }
  undoCount--;
  undoButton.textContent = `Use a Yesterday Once More Charm (${undoCount} left)`;
  const lastMove = moveHistory.pop();

  const fromImg = grid.querySelector(
    `img[data-position="${lastMove.from.index}"]`,
  );
  const toImg = grid.querySelector(`img[data-position="${lastMove.to.index}"]`);

  fromImg.src = toImg.src;
  fromImg.dataset.name = toImg.dataset.name;
  toImg.src = "";
  toImg.dataset.name = "";

  updateMoveCount(true);
  writeToStatus("Reverted action.");
}
undoButton.addEventListener("click", undoMove);
undoButton.textContent = `Use a Yesterday Once More Charm (${undoCount} left)`;

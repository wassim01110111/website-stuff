document
  .querySelectorAll(".maxMove")
  .forEach((el) => (el.textContent = maxMove));
let gameOver = false;
let moveCount = 0;
const path = document.location.pathname;
const htmlFile = path.substring(path.lastIndexOf("/") + 1);

const timeCounter = document.getElementById("time_played");
const titleDoc = document.getElementById("title_name");
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
const xpFiles = {
  "raft1.html": { xpGained: 2, title: "Trip to Sefirah Castle" },
  "raft2.html": { xpGained: 2, title: "Avoid the Ban" },
  "raft3.html": { xpGained: 3, title: "Two men and three lurkers" },
  "raft4.html": { xpGained: 4, title: "Coi-Completed Emergency" },
  "potion1.html": { xpGained: 4, title: "Low-Sequence Potion" },
  "potion2.html": { xpGained: 5, title: "Mid-Sequence Potion" },
  "potion3.html": { xpGained: 6, title: "High-Sequence Potion" },
  "clock1.html": { xpGained: 2, title: "Sefirah Castle Theft 1" },
  "clock2.html": { xpGained: 4, title: "Sefirah Castle Theft 2" },
  "stack1.html": { xpGained: 3, title: "Stacking Volumes" },
  "stack2.html": { xpGained: 4, title: "Stacking LoTM" },
  "stack3.html": { xpGained: 6, title: "Stacking CoI" },
};
const levels = {
  0: { name: "Mundane Human", xp_max: 1 },

  1: { name: "Sequence 9", xp_max: 3 },
  2: { name: "Sequence 8", xp_max: 5 },
  3: { name: "Sequence 7", xp_max: 10 },
  4: { name: "Sequence 6", xp_max: 14 },
  5: { name: "Sequence 5", xp_max: 18 },
  6: { name: "Sequence 4", xp_max: 23 },
  7: { name: "Sequence 3", xp_max: 28 },
  8: { name: "Sequence 2", xp_max: 34 },
  9: { name: "Sequence 1", xp_max: 40 },
  10: { name: "Sequence 0", xp_max: 46 },

  11: { name: "Above the Sequences", xp_max: 52 },
};
if (htmlFile[htmlFile]) {
  const pageTitle = xpFiles[htmlFile].title;
  titleDoc.textContent = pageTitle;
  document.title = pageTitle;
}
function loadPlayerData() {
  return (
    JSON.parse(localStorage.getItem("playerData")) ?? {
      completedLevels: {},
      stats: {
        sequence: levels[0].name,
        time_played: 0,
        totalXP: 0,
        level: 0,
      },
    }
  );
}
const playerData = loadPlayerData();
console.log(playerData);
let playedTime = 0;
if (timeCounter) {
  setInterval(() => {
    playedTime++;
    timeCounter.textContent = formatTime(playedTime);
  }, 1000);
}
function savePlayerData(data) {
  localStorage.setItem("playerData", JSON.stringify(data));
}

function getLevel(currentLevel, totalXp) {
  let didAscend = false;
  if (currentLevel < 11) {
    while (totalXp > levels[currentLevel].xp_max) {
      didAscend = true;
      currentLevel++;
      if (currentLevel > 11) {
        return getLevel(currentLevel, totalXp);
      }
    }
    return {
      name: levels[currentLevel].name,
      level: currentLevel,
      ascended: didAscend,
    };
  }

  const baseXp = levels[11].xp_max;
  const step = levels[11].xp_max - levels[10].xp_max;

  const atsLevel = Math.floor((totalXp - baseXp) / step);

  const plus = Math.max(1, atsLevel);

  return {
    name: `Above the Sequences +${plus}`,
    level: 11 + plus,
    ascended: plus > 0,
  };
}

const moveSpan = document.getElementById("moveCount");
const statusDiv = document.getElementById("status");

const winOverlay = document.createElement("div");
winOverlay.id = "winOverlay";

const winText = document.createElement("div");
winText.id = "winText";

const winButton = document.createElement("button");
winButton.textContent = "Try another challenge";

winOverlay.append(winText, winButton);
document.body.appendChild(winOverlay);
const deathOverlay = document.createElement("div");
deathOverlay.id = "deathOverlay";
const deathText = document.createElement("div");
deathText.id = "deathText";
const deathButton = document.createElement("button");
deathButton.id = "deathButton";
deathButton.textContent = "Try Again";
deathOverlay.append(deathText, deathButton);
document.body.appendChild(deathOverlay);
function showAscendAnimation(sequenceName) {
  console.log("ascended to", sequenceName);
  const ascendEl = document.createElement("div");
  ascendEl.className = "ascendMessage";
  ascendEl.textContent = `You ascended to ${sequenceName}!`;
  winOverlay.appendChild(ascendEl);
  requestAnimationFrame(() => {
    ascendEl.classList.add("show");
  });
  setTimeout(() => {
    ascendEl.classList.remove("show");
    setTimeout(() => winOverlay.removeChild(ascendEl), 400);
  }, 2500);
}

function showwinMessage(message) {
  gameOver = true;
  winText.textContent = message;
  winOverlay.classList.add("show");

  if (playerData.completedLevels[htmlFile]) {
    return;
  }

  playerData.completedLevels[htmlFile] = true;

  playerData.stats.totalXP += xpFiles[htmlFile].xpGained;
  playerData.stats.time_played += playedTime;

  const levelData = getLevel(playerData.stats.level, playerData.stats.totalXP);

  if (levelData.ascended) {
    showAscendAnimation(levelData.name);
    playerData.stats.sequence = levelData.name;
    playerData.stats.level = levelData.level;
  }
  console.log(playerData, "playerdata");
  savePlayerData(playerData);
}
function showDeathMessage(message) {
  gameOver = true;
  deathText.textContent = message;
  deathOverlay.classList.add("show");
}
deathButton.onclick = () => location.reload();
winButton.onclick = () => (location = "../index.html");

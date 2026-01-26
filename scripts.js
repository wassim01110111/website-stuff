const maxmoves = document.querySelectorAll(".maxMove");
if (maxmoves.length > 0) {
  maxmoves.forEach((el) => (el.textContent = maxMove));
  if (maxMove === null) {
    const maxMoveDiv = document.getElementById("maxMove");
    if (maxMoveDiv) {
      maxMoveDiv.style.display = "none";
    }
  }
}
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

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
}

function generateRules(rulesArray) {
  const container = document.querySelector(".rules");

  rulesArray.forEach((rule) => {
    const li = document.createElement("li");
    li.innerHTML = rule;
    container.appendChild(li);
  });
}

const xpFiles = {
  "raft1.html": { xpGained: 2, title: "Trip to Sefirah Castle" },
  "raft2.html": { xpGained: 2, title: "Avoid the Ban" },
  "raft3.html": { xpGained: 3, title: "Two men and three lurkers" },
  "raft4.html": { xpGained: 4, title: "Coi-Completed Emergency" },
  "potion1.html": { xpGained: 4, title: "Low-Sequence Potion" },
  "potion2.html": { xpGained: 5, title: "Mid-Sequence Potion" },
  "potion3.html": { xpGained: 6, title: "High-Sequence Potion" },
  "potion4.html": { xpGained: 7, title: "Apotheosis Potion" },
  "clock1.html": { xpGained: 2, title: "Sefirah Castle Theft 1" },
  "clock2.html": { xpGained: 4, title: "Sefirah Castle Theft 2" },
  "stack1.html": { xpGained: 3, title: "Stacking Volumes" },
  "stack2.html": { xpGained: 4, title: "Stacking LoTM" },
  "stack3.html": { xpGained: 6, title: "Stacking CoI" },
  "placement1.html": { xpGained: 3, title: "Tarot Divination 1" },
  "placement2.html": { xpGained: 4, title: "Tarot Divination 2" },
  "placement3.html": { xpGained: 5, title: "Tarot Divination 3" },
  "placement4.html": { xpGained: 5, title: "Tarot Divination 4" },
  "placement5.html": { xpGained: 6, title: "Tarot Divination 5" },
  "placement6.html": { xpGained: 3, title: "Tarot Divination 6" },
  "coin1.html": { xpGained: 3, title: "Coin's Gambit 1" },
  "coin2.html": { xpGained: 6, title: "Coin's Gambit 2" },
  "coin3.html": { xpGained: 9, title: "Coin's Gambit 3" },
  "numberguess1.html": { xpGained: 2, title: "Cryptologist's Trial" },
  "numberguess2.html": { xpGained: 6, title: "Cryptologist's Duty" },
  "numberguess3.html": { xpGained: 9, title: "Cryptologist's Mission" },
  "scale1.html": { xpGained: 2, title: "Parasite Scale" },
  "scale2.html": { xpGained: 4, title: "Power Scaling" },
  "scale3.html": { xpGained: 7, title: "Fragile Balance" },
  "misc1.html": { xpGained: 3, title: "Grand Theft Chanis" },
  "misc2.html": { xpGained: 3, title: "Hand of Order" },
  "misc3.html": { xpGained: 4, title: "Fraud of Steam's Homework" },
  "chairhop1.html": { xpGained: 3, title: "Chaos in Sefirah Castle" },
  "chairhop2.html": { xpGained: 5, title: "Seats of Fate" },
  "slicing1.html": { xpGained: 3, title: "Concealed Fan Art 1" },
  "slicing2.html": { xpGained: 4, title: "Concealed Fan Art 2" },
  "slicing3.html": { xpGained: 5, title: "Concealed Fan Art 3" },
  "slicing4.html": { xpGained: 6, title: "Concealed Fan Art 4" },
  "slicing5.html": { xpGained: 9, title: "Concealed Fan Art 5" },
  "riddles1.html": { xpGained: 3, title: "Arrodes's Riddles 1" },
  "riddles2.html": { xpGained: 3, title: "Arrodes's Riddles 2" },
  "riddles3.html": { xpGained: 3, title: "Arrodes's Riddles 3" },
  "riddles4.html": { xpGained: 3, title: "Arrodes's Riddles 4" },
  "riddles5.html": { xpGained: 3, title: "Arrodes's Riddles 5" },
  "riddles6.html": { xpGained: 3, title: "Arrodes's Riddles 6" },
  "riddles7.html": { xpGained: 5, title: "Arrodes's Riddles 7" },
  "riddles8.html": { xpGained: 4, title: "Arrodes's Riddles 8" },
  "maze1.html": { xpGained: 2, title: "Slippery Sefirah 1" },
  "maze2.html": { xpGained: 2, title: "Slippery Sefirah 2" },
  "maze3.html": { xpGained: 3, title: "Slippery Sefirah 3" },
  "maze4.html": { xpGained: 4, title: "Slippery Sefirah 4" },
  "maze5.html": { xpGained: 5, title: "Slippery Sefirah 5" },
  "maze6.html": { xpGained: 5, title: "Slippery Sefirah 6" },
  "maze7.html": { xpGained: 6, title: "Slippery Sefirah 7" },
  "maze8.html": { xpGained: 3, title: "Slippery Sefirah 8" },
  "maze9.html": { xpGained: 5, title: "Slippery Sefirah 9" },
  "maze10.html": { xpGained: 6, title: "Slippery Sefirah 10" },
  "maze11.html": { xpGained: 6, title: "Slippery Sefirah 11" },
  "maze12.html": { xpGained: 7, title: "Slippery Sefirah 12" },
  "maze13.html": { xpGained: 6, title: "Slippery Sefirah 13" },
  "maze14.html": { xpGained: 7, title: "Slippery Sefirah 14" },
  "maze15.html": { xpGained: 8, title: "Slippery Sefirah 15" },
  "maze16.html": { xpGained: 7, title: "Slippery Sefirah 16" },
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
  10: { name: "King of Angels", xp_max: 46 },
  11: { name: "King of King of Angels", xp_max: 52 },
  12: { name: "Activated Uniqueness", xp_max: 58 },
  13: { name: "Sequence 0", xp_max: 64 },
  14: { name: "Dual-Sequence 0", xp_max: 70 },
  15: { name: "Above the Sequences", xp_max: 76 },
  16: { name: "Great Old One", xp_max: 82 },
  17: { name: "Pillar", xp_max: 88 },
  18: { name: "Above Pillar", xp_max: 94 },
};
const maxLevel = Math.max(...Object.keys(levels).map(Number));
if (xpFiles[htmlFile]) {
  const pageTitle = xpFiles[htmlFile].title;
  titleDoc.textContent = pageTitle;
  document.title = pageTitle;
}
const defaultData = {
  completedLevels: {},
  stats: {
    sequence: levels[0].name,
    time_played: 0,
    totalXP: 0,
    level: 0,
  },
  version: 2,
};
function loadPlayerData() {
  return JSON.parse(localStorage.getItem("playerData")) ?? defaultData;
}

function updateMoveCount(neg = false) {
  if (neg) {
    moveCount--;
  } else {
    moveCount++;
  }
  moveSpan.textContent = moveCount;
}
function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
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
function fixStats() {
  if ((playerData?.version ?? 0) === defaultData.version) return false;
  let fixedXP = 0;
  for (const level in playerData.completedLevels) {
    fixedXP += xpFiles[level].xpGained;
  }
  playerData.stats.totalXP = fixedXP;
  const {
    name: fixedSequence,
    level: fixedLevel,
    ascended: fixedBool,
  } = getLevel(0, fixedXP);

  playerData.stats.sequence = fixedSequence;
  playerData.stats.level = fixedLevel;

  console.log("Fixed stats");
  playerData.version = defaultData.version;
  savePlayerData(playerData);
  return true;
}

function getLevel(currentLevel, totalXp) {
  let didAscend = false;
  if (currentLevel < maxLevel) {
    while (totalXp > levels[currentLevel].xp_max) {
      didAscend = true;
      currentLevel++;
      if (currentLevel > maxLevel) {
        return getLevel(currentLevel, totalXp);
      }
    }
    return {
      name: levels[currentLevel].name,
      level: currentLevel,
      ascended: didAscend,
    };
  }

  const baseXp = levels[maxLevel].xp_max;
  const step = levels[maxLevel].xp_max - levels[maxLevel - 1].xp_max;

  const atsLevel = Math.floor((totalXp - baseXp) / step);

  const plus = Math.max(1, atsLevel);

  return {
    name: `${levels[maxLevel].name} +${plus}`,
    level: maxLevel + plus,
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
const nextChallenge = document.createElement("button");
nextChallenge.textContent = "Go to the Next Puzzle";
const nextPuzzle = (() => {
  const f = htmlFile.replace(/(\d+)(?=\.html$)/, (x) => +x + 1);
  if (xpFiles[f]) {
    nextChallenge.addEventListener("click", () => {
      window.location.href = f;
    });
    return f;
  } else {
    nextChallenge.style.display = "none";
    return null;
  }
})();
winOverlay.append(winText, winButton, nextChallenge);
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

function writeToStatus(message = "", color = null, focus = false) {
  statusDiv.textContent = message;
  if (color !== null) {
    statusDiv.style.color = color;
  } else {
    statusDiv.style.color = "white";
  }
  if (focus) {
    statusDiv.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

function showwinMessage(message) {
  gameOver = true;
  winText.innerHTML = message;
  winOverlay.classList.add("show");

  if (playerData.completedLevels[htmlFile]) {
    return;
  }

  playerData.completedLevels[htmlFile] = true;
  fixStats();
  playerData.stats.totalXP += xpFiles[htmlFile].xpGained;
  playerData.stats.time_played += playedTime;

  const levelData = getLevel(playerData.stats.level, playerData.stats.totalXP);

  if (levelData.ascended) {
    showAscendAnimation(levelData.name);
    playerData.stats.sequence = levelData.name;
    playerData.stats.level = levelData.level;
  }
  savePlayerData(playerData);
  const rect = winText.getBoundingClientRect();
  window.scrollTo(0, window.scrollY + rect.top);
}
function showDeathMessage(message) {
  gameOver = true;
  winOverlay.classList.remove("show");
  deathText.innerHTML = message;
  deathOverlay.classList.add("show");
  const rect = deathText.getBoundingClientRect();
  window.scrollTo(0, window.scrollY + rect.top);
}
deathButton.onclick = () => location.reload();
winButton.onclick = () => (location = "../index.html");
document.querySelectorAll(".hint-title").forEach((title) => {
  title.addEventListener("click", () => {
    title.parentElement.classList.toggle("open");
  });
});

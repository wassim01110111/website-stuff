const containerWrapper = document.getElementById("potion-container-wrapper");

let selectedContainer = null;
const maxCapacity = Math.max(...potionContainers.map((item) => item.capacity));
const baseHeight = 200;

potionContainers.forEach((potion, index) => {
  const { capacity, color, current } = potion;
  const wrapper = document.createElement("div");
  wrapper.classList.add("potion-container-wrapper-inner");

  const label = document.createElement("div");
  label.classList.add("label");
  label.textContent = "Max: " + capacity + "L";
  wrapper.appendChild(label);
  const liquidDiv = document.createElement("div");

  const container = document.createElement("div");
  container.classList.add("potion-container");
  container.dataset.max = capacity;
  container.dataset.current = current;
  if (current > 0) {
    container.dataset.color = color;
    liquidDiv.classList.add(color);
  } else {
    container.dataset.color = "empty";
  }
  container.style.height = (capacity / maxCapacity) * baseHeight + "px";

  liquidDiv.classList.add("liquid");
  liquidDiv.style.height = (container.dataset.current / capacity) * 100 + "%";
  liquidDiv.textContent = container.dataset.current;
  container.appendChild(liquidDiv);

  wrapper.appendChild(container);
  containerWrapper.appendChild(wrapper);

  container.addEventListener("click", () => {
    if (selectedContainer === container) {
      container.classList.remove("selected");
      selectedContainer = null;
      return;
    }
    if (selectedContainer) {
      pourLiquid(selectedContainer, container);
      selectedContainer.classList.remove("selected");
      selectedContainer = null;
    } else {
      selectedContainer = container;
      container.classList.add("selected");
    }
  });
});

function pourLiquid(from, to) {
  let fromCurrent = parseInt(from.dataset.current);
  let toCurrent = parseInt(to.dataset.current);
  let toMax = parseInt(to.dataset.max);
  let spaceAvailable = toMax - toCurrent;
  let amountToPour = Math.min(fromCurrent, spaceAvailable);
  if (amountToPour === 0 || spaceAvailable === 0) {
    from.classList.remove("selected");
    selectedContainer = null;
    return;
  }
  updateMoveCount();
  const mixAllowed = new Set(["red", "blue"]);
  fromCurrent -= amountToPour;
  toCurrent += amountToPour;
  changeColor = from.dataset.color;
  if (from.dataset.color !== to.dataset.color && to.dataset.color !== "empty") {
    if (
      mixAllowed.has(from.dataset.color) &&
      mixAllowed.has(to.dataset.color) &&
      from.dataset.current === to.dataset.current
    ) {
      changeColor = "green";
    } else {
      changeColor = "black";
      showDeathMessage("The potion was a mess and you lost control!");
    }
  }
  if (moveCount > maxMove) {
    showDeathMessage("The potion was a mess and you lost control!");
  }
  to.classList.add("pour-animation");
  from.classList.add("pour-animation");
  setTimeout(() => {
    to.classList.remove("pour-animation");
    from.classList.remove("pour-animation");
  }, 300);

  from.dataset.current = fromCurrent;
  to.dataset.current = toCurrent;
  updateLiquidVisual(from);
  updateLiquidVisual(to, changeColor);
  checkWinningCondition();
}
function checkWinningCondition() {
  const containers = document.querySelectorAll(".potion-container");
  const volume = parseInt(containers[0].dataset.current);
  const maxVolume = parseInt(containers[0].dataset.max);
  const color = containers[0].dataset.color;
  if (color === "green" && volume === maxVolume) {
    showwinMessage(`You have successfully ascended to ${winningSeq}! 🎉`);
    return true;
  }
  return false;
}
function updateLiquidVisual(container, color = null) {
  const liquidDiv = container.querySelector(".liquid");
  const current = parseInt(container.dataset.current);
  const max = parseInt(container.dataset.max);
  liquidDiv.style.height = (current / max) * 100 + "%";
  liquidDiv.textContent = current;
  if (current === 0) {
    liquidDiv.classList.remove(container.dataset.color);
    container.dataset.color = "empty";
  }
  if (color !== null) {
    liquidDiv.classList.remove(container.dataset.color);
    container.dataset.color = color;
    liquidDiv.classList.add(color);
  }
}

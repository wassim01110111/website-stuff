const containerWrapper = document.getElementById("potion-container-wrapper");
const winSpan = document.getElementById("winCon");
winSpan.textContent = winningCondition;

let selectedContainer = null;
const maxCapacity = Math.max(...potionContainers);
const baseHeight = 200;

potionContainers.forEach((capacity, index) => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("potion-container-wrapper-inner");

  const label = document.createElement("div");
  label.classList.add("label");
  label.textContent = "Max: " + capacity + "L";
  wrapper.appendChild(label);

  const container = document.createElement("div");
  container.classList.add("potion-container");
  container.dataset.max = capacity;
  container.dataset.current = index === 0 ? capacity : 0;
  container.style.height = (capacity / maxCapacity) * baseHeight + "px";

  const liquidDiv = document.createElement("div");
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
    container.classList.remove("selected");
    selectedContainer = null;
    return;
  }
  updateMoveCount();
  if (moveCount > maxMove) {
    showDeathMessage("The potion was a mess and you lost control!");
  }
  to.classList.add("pour-animation");
  from.classList.add("pour-animation");
  setTimeout(() => {
    to.classList.remove("pour-animation");
    from.classList.remove("pour-animation");
  }, 300);
  fromCurrent -= amountToPour;
  toCurrent += amountToPour;
  from.dataset.current = fromCurrent;
  to.dataset.current = toCurrent;
  updateLiquidVisual(from);
  updateLiquidVisual(to);
  checkWinningCondition();
}
function checkWinningCondition() {
  const containers = document.querySelectorAll(".potion-container");
  const first = parseInt(containers[0].dataset.current);
  const second = parseInt(containers[1].dataset.current);
  console.log(first, second, winningCondition);
  if (first === second && first == winningCondition) {
    showwinMessage(`You have successfully ascended to ${winningSeq}! 🎉`);
    return true;
  }
  return false;
}
function updateLiquidVisual(container) {
  const liquidDiv = container.querySelector(".liquid");
  const current = parseInt(container.dataset.current);
  const max = parseInt(container.dataset.max);
  liquidDiv.style.height = (current / max) * 100 + "%";
  liquidDiv.textContent = current;
}

(function (arr) {
  const scaleGame = document.getElementById("game");
  const scaleContainer = document.createElement("div");
  scaleContainer.className = "scale-container";
  const scaleWin = document.createElement("div");
  scaleWin.className = "scale-win";
  scaleWin.textContent = "Junk Pile";

  const scale = document.createElement("div");
  scale.className = "scale";

  const beam = document.createElement("div");
  beam.className = "beam";

  const scaleLeft = document.createElement("div");
  scaleLeft.className = "pan";

  const scaleRight = document.createElement("div");
  scaleRight.className = "pan pan--right";

  const scalePivot = document.createElement("div");
  scalePivot.className = "pivot";

  beam.append(scaleLeft, scaleRight);
  scale.append(beam, scalePivot);

  const scaleButton = document.createElement("button");
  scaleButton.textContent = "Weigh";
  scaleButton.className = "scale-button";
  scale.appendChild(scaleButton);

  const pieces = document.createElement("div");
  pieces.className = "pieces";
  let leftSide = 0;
  let rightSide = 0;
  const itemMap = {};

  function checkWin(item) {
    if (itemMap[item.dataset.index] == 2) return false;
    return true;
  }

  arr.forEach((v, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "stare-wrapper";

    const item = document.createElement("img");
    item.src = "../images/xio.png";
    item.className = "stare";
    itemMap[String(index)] = v;
    const label = document.createElement("span");
    label.className = "stare-index";
    label.textContent = index + 1;

    wrapper.appendChild(item);
    wrapper.appendChild(label);
    wrapper.dataset.index = index;
    pieces.appendChild(wrapper);
  });

  scaleContainer.append(pieces);
  scaleContainer.append(scaleWin);
  scaleGame.appendChild(scale);
  scaleGame.appendChild(scaleContainer);
  [pieces, scaleLeft, scaleRight, scaleWin].forEach((el) => {
    new Sortable(el, {
      group: "stares",
      animation: 150,
      onAdd: (evt) => {
        const val = itemMap[evt.item.dataset.index];
        if (evt.to === scaleLeft) leftSide += val;
        else if (evt.to === scaleRight) rightSide += val;
        else if (evt.to === scaleWin) {
          if (checkWin(evt.item)) {
            showwinMessage("You have found Amon!");
          } else {
            showDeathMessage(
              "One of the Xio pulled out a monocle and wore it on her right eye...",
            );
          }
        }
      },
      onRemove: (evt) => {
        const val = itemMap[evt.item.dataset.index];
        if (evt.from === scaleLeft) leftSide -= val;
        else if (evt.from === scaleRight) rightSide -= val;
      },
    });
  });

  scaleButton.onclick = () => {
    updateMoveCount();
    scaleButton.style.display = "none";
    if (leftSide > rightSide) beam.style.transform = "rotate(-10deg)";
    else if (rightSide > leftSide) beam.style.transform = "rotate(10deg)";
    else if (beam.style.transform === "") {
      beam.style.animation = "twitch 0.5s ease";
    } else beam.style.transform = "";
    setTimeout(() => {
      beam.style.animation = "";
      if (moveCount < maxMove) {
        scaleButton.style.display = "block";
      }
    }, 500);
  };
})(generateArray(arr));

function generateArray(param) {
  const [arrSize, light] = param;
  const arr = Array(arrSize).fill(2);
  const randomIndex = Math.floor(Math.random() * arrSize);
  if (light === null || light === undefined) {
    arr[randomIndex] = Math.random() < 0.5 ? 1 : 3;
  } else {
    arr[randomIndex] = light ? 1 : 3;
  }
  return arr;
}

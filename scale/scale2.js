(function (arr) {
  function shuffle(arrS) {
    return arrS.sort(() => Math.random() - 0.5);
  }
  function assignShuffledValues(arrS) {
    const values = shuffle([...Array(arrS.length).keys()].map((i) => i + 1));
    const nameValues = {};
    arrS.forEach((item, index) => {
      nameValues[item] = values[index];
    });
    return nameValues;
  }

  const nameValues = assignShuffledValues(arr);
  function makeGroups(names) {
    const [n1, n2, n3, n4] = shuffle([...names]);

    return [
      [n2, n3, nameValues[n2] + nameValues[n3]],
      [n1, n1, nameValues[n1] * 2],
      [n4, n2, nameValues[n4] + nameValues[n2]],
      [n3, n4, nameValues[n3] + nameValues[n4]],
    ];
  }
  const groups = makeGroups(arr);
  const scaleGame = document.getElementById("game");
  const scaleContainer = document.createElement("div");
  scaleContainer.className = "scale-container";
  const scaleWin = document.createElement("div");
  scaleWin.className = "scale-win";
  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Confirm";
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

  groups.forEach((group, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "stare-multi-wrapper";
    const [name1, name2, v] = group;
    const item1 = document.createElement("img");
    item1.src = `../images/${name1}.png`;
    item1.className = "stare";
    itemMap[String(index)] = v;
    const item2 = document.createElement("img");
    item2.src = `../images/${name2}.png`;
    item2.className = "stare";
    item2.style.transform = "scaleX(-1)";

    wrapper.appendChild(item1);
    wrapper.appendChild(item2);
    wrapper.dataset.index = index;
    pieces.appendChild(wrapper);
  });

  arr.forEach((itm) => {
    console.log(itm);
    const imgEl = document.createElement("img");
    imgEl.src = `../images/${itm}.png`;
    imgEl.className = "stare";
    imgEl.dataset.name = itm;
    scaleWin.appendChild(imgEl);
  });
  confirmButton.addEventListener("click", () => {
    const currentOrder = Array.from(scaleWin.children).map(
      (img) => img.dataset.name,
    );
    const currentValues = currentOrder.map((name) => nameValues[name]);
    const isCorrect = currentValues.every((v, i, arr) => {
      return i === 0 || v >= arr[i - 1];
    });

    if (isCorrect) {
      showwinMessage("And the Power Scales!");
    } else {
      showDeathMessage("Incorrect power scaling.");
    }
  });
  scaleContainer.append(pieces);
  const winDivs = document.createElement("div");
  winDivs.append(scaleWin);
  winDivs.appendChild(confirmButton);
  winDivs.className = "scale-win-container";
  scaleContainer.appendChild(winDivs);
  scaleGame.appendChild(scale);
  scaleGame.appendChild(scaleContainer);
  [pieces, scaleLeft, scaleRight].forEach((el) => {
    new Sortable(el, {
      group: "stares",
      animation: 150,
      onAdd: (evt) => {
        const val = itemMap[evt.item.dataset.index];
        const target = evt.to;
        const existing = Array.from(target.children).find(
          (child) => child !== evt.item,
        );

        if (existing) {
          const existingVal = itemMap[existing.dataset.index];
          if (target === scaleLeft) leftSide -= existingVal;
          else if (target === scaleRight) rightSide -= existingVal;
          pieces.appendChild(existing);
        }

        if (target === scaleLeft) leftSide += val;
        else if (target === scaleRight) rightSide += val;
      },
      onRemove: (evt) => {
        const val = itemMap[evt.item.dataset.index];
        if (evt.from === scaleLeft) leftSide -= val;
        else if (evt.from === scaleRight) rightSide -= val;
      },
    });
  });
  Sortable.create(scaleWin, {
    animation: 150,
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
})(arr);

const cardsContainer = document.getElementById("cards");
const isMatrix = Array.isArray(original_order[0]);

if (!isMatrix) {
  original_order.forEach((name) => {
    const img = document.createElement("img");
    img.src = `../images/${name}.jpg`;
    img.alt = name;
    img.className = "card";
    cardsContainer.appendChild(img);
  });

  Sortable.create(cardsContainer, {
    animation: 200,
    onEnd: () => checkOrder(),
  });
} else {
  cardsContainer.style.flexDirection = "column";
  const rows = original_order;
  rows.forEach((row, rIdx) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "cards-row";
    cardsContainer.appendChild(rowDiv);

    row.forEach((name) => {
      const img = document.createElement("img");
      img.src = `../images/${name}.jpg`;
      img.alt = name;
      img.className = "card";
      rowDiv.appendChild(img);
    });

    Sortable.create(rowDiv, {
      animation: 200,
      group: { name: "matrix", pull: true, put: true },
      swap: true,
      swapClass: "swap-highlight",
      onEnd: () => checkOrder(),
    });
  });
}

function checkOrder() {
  updateMoveCount();
  if (moveCount > maxMove) {
    showDeathMessage("The woman placed a crystal monocle on her right eye.");
    return;
  }

  let current;
  if (!isMatrix) {
    current = Array.from(cardsContainer.children).map((c) => c.alt);
  } else {
    current = Array.from(cardsContainer.children).map((rowDiv) =>
      Array.from(rowDiv.children).map((c) => c.alt),
    );
  }

  const target = isMatrix ? final_order : final_order;
  if (JSON.stringify(current) === JSON.stringify(target)) {
    showwinMessage("The divination was granted...");
  }
}

const spots = {
  left: document.getElementById("left"),
  middle: document.getElementById("middle"),
  right: document.getElementById("right"),
};
let selectedBook = null;
for (let i = numberBooks; i >= 1; i--) {
  const book = document.createElement("div");
  book.className = "book";
  book.dataset.size = i;
  book.style.backgroundImage = "url('../images/book.png')";
  book.style.width = 40 + i * 20 + "px";
  spots.left.appendChild(book);
}
for (const key in spots) {
  spots[key].addEventListener("click", () => {
    const topBook = spots[key].lastElementChild;
    if (selectedBook) {
      if (
        !topBook ||
        parseInt(selectedBook.dataset.size) < parseInt(topBook.dataset.size)
      ) {
        moveCount++;
        moveSpan.textContent = moveCount;
        statusDiv.textContent = "";
        spots[key].appendChild(selectedBook);
        if (key === "right" && spots.right.children.length === numberBooks) {
          showwinMessage("You successfully managed to stack every chapter!");
        }
        if (moveCount > maxMove) {
          showDeathMessage(
            "Nekros caught you lacking, you have been banned...",
          );
        }
      } else {
        statusDiv.textContent =
          "Cannot stack a bigger chapter on top of a smaller one";
      }
      selectedBook.classList.remove("selected");
      selectedBook = null;
    } else {
      if (topBook) {
        selectedBook = topBook;
        selectedBook.classList.add("selected");
      }
    }
  });
}

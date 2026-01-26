(function () {
  const allNumbers = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const guessContainer = document.getElementById("numberguess");
  const hintHistory = document.getElementById("hint-history");
  const hintHistorySpan = document.createElement("span");
  const inputContainer = document.getElementById("input-container");
  hintHistorySpan.textContent = "Hint History:";
  hintHistory.appendChild(hintHistorySpan);
  const noteReset = document.getElementById("noteReset");
  const defaultColor = "#5c5cff";
  const noteUndo = document.getElementById("noteUndo");
  const noteHistory = [];
  function pickRandomFromSet(set) {
    const index = Math.floor(Math.random() * set.size);
    let i = 0;
    for (const value of set) {
      if (i === index) return value;
      i++;
    }
  }

  const goalNumber = [];
  const numberLength = numberHints.length;
  const indexSet = new Set([]);
  const goalMap = {};
  const allWrong = new Set(allNumbers);

  function generateGoalNumbers() {
    const goalSet = new Set(allNumbers);
    for (let i = 0; i < numberLength; i++) {
      const num = pickRandomFromSet(goalSet);
      goalSet.delete(num);
      goalNumber.push(num);
      goalMap[goalNumber[i]] = i;
      indexSet.add(i);
      allWrong.delete(num);
    }
  }

  generateGoalNumbers();

  function pickRandomExcluding(set, excludeValue) {
    const values = [...set];
    let item;
    if (set.size === 1 && set.has(excludeValue)) return null;
    if (excludeValue !== null) {
      do {
        const index = Math.floor(Math.random() * values.length);
        item = values[index];
      } while (item === excludeValue);
    } else {
      const index = Math.floor(Math.random() * values.length);
      item = values[index];
    }
    return item;
  }

  function pickRandomFromDict(dict) {
    const keys = Object.keys(dict);
    const randomIndex = Math.floor(Math.random() * keys.length);
    const key = keys[randomIndex];
    const value = dict[key];

    delete dict[key];

    return { item: key, index: value };
  }
  function giveHint(hint) {
    const finalHint = new Array(numberLength).fill(null);
    const possibleRight = { ...goalMap };
    const possibleWrong = new Set(allWrong);
    const currentIndexSet = new Set(indexSet);
    let right = hint[0];
    let misplaced = hint[1];
    const wrong = numberLength - right - misplaced;
    for (let i = 0; i < right; i++) {
      const { item: rightItem, index: rightIndex } =
        pickRandomFromDict(possibleRight);
      currentIndexSet.delete(rightIndex);
      finalHint[rightIndex] = rightItem;
    }
    for (let i = 0; i < misplaced; i++) {
      const { item: misItem, index: misIndex } =
        pickRandomFromDict(possibleRight);

      const misplacedIndex = pickRandomExcluding(currentIndexSet, misIndex);
      if (misplacedIndex === null) {
        console.log("logic exclusion happened");
        right++;
        misplaced--;
        currentIndexSet.delete(misIndex);
        finalHint[misIndex] = misItem;
      } else {
        currentIndexSet.delete(misplacedIndex);
        finalHint[misplacedIndex] = misItem;
      }
    }
    for (let i = 0; i < wrong; i++) {
      const wrongItem = pickRandomFromSet(possibleWrong);
      const wrongIndex = pickRandomExcluding(currentIndexSet, null);
      possibleWrong.delete(wrongItem);
      currentIndexSet.delete(wrongIndex);
      finalHint[wrongIndex] = wrongItem;
    }

    return {
      final: finalHint,
      right: right,
      wrong: wrong,
      misplaced: misplaced,
    };
  }

  const rules = [
    `The code is hidden in ${numberLength} clues.`,
    "Each clue displays a random number along with information about how many digits are correct and in the right position, how many are correct but misplaced, and how many are not in the code at all.",
    "The final code contains no duplicate numbers.",
    `You must decipher the code in ${maxMove} guesses or else the Church will fire you.`,
    `One of your seniors, taking pity on you, is offering ${maxGuess} hint${maxGuess > 1 ? "s" : ""} to assist you.`,
    `<strong>Note:</strong> You can hover or click a digit in the clues to mark it with a color as a note. You can also drag and reorder the clues to help organize your guesses.`,
  ];
  generateRules(rules);
  numberHints.forEach((hint) => {
    const { final, right, wrong, misplaced } = giveHint(hint);
    createHint(final, right, wrong, misplaced);
  });

  function createStats(right, wrong, misplaced) {
    const statsDiv = document.createElement("div");
    statsDiv.className = "hint-stats";

    const rightDiv = document.createElement("div");
    rightDiv.className = "hint-stat right";
    rightDiv.textContent = `✔ ${right}`;

    const wrongDiv = document.createElement("div");
    wrongDiv.className = "hint-stat wrong";
    wrongDiv.textContent = `✖ ${wrong}`;

    const misplacedDiv = document.createElement("div");
    misplacedDiv.className = "hint-stat misplaced";
    misplacedDiv.textContent = `➔ ${misplaced}`;

    statsDiv.appendChild(rightDiv);
    statsDiv.appendChild(wrongDiv);
    statsDiv.appendChild(misplacedDiv);
    return statsDiv;
  }

  function createHint(final, right, wrong, misplaced) {
    const hintDiv = document.createElement("div");
    hintDiv.className = "hint";
    final.forEach((num, i) => {
      const numDiv = document.createElement("div");
      numDiv.className = "hint-number";
      numDiv.dataset.index = i;
      numDiv.dataset.value = num;
      const numSpan = document.createElement("span");
      numSpan.textContent = num;

      numSpan.style.color = "black";
      numSpan.style.marginRight = "4px";
      numDiv.appendChild(numSpan);
      const numBtns = document.createElement("div");
      numBtns.className = "colorButtons";

      function createColorButton(color) {
        const btn = document.createElement("button");
        btn.style.backgroundColor = color;
        btn.addEventListener("click", () => {
          saveHistory();
          if (color === "red") {
            guessContainer
              .querySelectorAll(
                `.hint-number[data-value='${numDiv.dataset.value}']`,
              )
              .forEach((el) => {
                el.style.backgroundColor = color;
              });
          } else if (color === "green") {
            const input = inputContainer.querySelector(
              `input[data-index='${i}']`,
            );
            input.value = num;
            guessContainer
              .querySelectorAll(
                `.hint-number[data-index='${numDiv.dataset.index}'], .hint-number[data-value='${numDiv.dataset.value}']`,
              )
              .forEach((el) => {
                if (
                  el.dataset.value == numDiv.dataset.value &&
                  el.dataset.index == numDiv.dataset.index
                ) {
                  el.style.backgroundColor = color;
                } else {
                  el.style.backgroundColor = "yellow";
                }
              });
          } else if (color === "yellow") {
            guessContainer
              .querySelectorAll(
                `.hint-number[data-index='${numDiv.dataset.index}'][data-value='${numDiv.dataset.value}']`,
              )
              .forEach((el) => {
                el.style.backgroundColor = color;
              });
          } else {
            numDiv.style.backgroundColor = color;
          }
        });
        return btn;
      }

      numBtns.appendChild(createColorButton("green"));
      numBtns.appendChild(createColorButton("red"));
      numBtns.appendChild(createColorButton("yellow"));
      numBtns.appendChild(createColorButton(defaultColor));

      numDiv.addEventListener("mouseenter", () => {
        numBtns.style.visibility = "visible";

        const input = inputContainer.querySelector(`input[data-index='${i}']`);
        input.classList.add("active");
        guessContainer
          .querySelectorAll(
            `.hint-number[data-index='${numDiv.dataset.index}'], .hint-number[data-value='${numDiv.dataset.value}']`,
          )
          .forEach((el) => {
            if (el.dataset.index === numDiv.dataset.index) {
              el.classList.add("active");
            }
            if (el.dataset.value === numDiv.dataset.value) {
              el.classList.add("selected");
            }
          });
      });

      numDiv.addEventListener("mouseleave", () => {
        numBtns.style.visibility = "hidden";
        const input = inputContainer.querySelector(`input[data-index='${i}']`);
        input.classList.remove("active");
        document
          .querySelectorAll(
            `.hint-number[data-index='${numDiv.dataset.index}'], .hint-number[data-value='${numDiv.dataset.value}']`,
          )
          .forEach((el) => {
            if (el.dataset.index === numDiv.dataset.index) {
              el.classList.remove("active");
            }
            if (el.dataset.value === numDiv.dataset.value) {
              el.classList.remove("selected");
            }
          });
      });
      numDiv.appendChild(numBtns);
      hintDiv.appendChild(numDiv);
    });

    const statsDiv = createStats(right, wrong, misplaced);

    hintDiv.appendChild(statsDiv);
    guessContainer.appendChild(hintDiv);
  }

  function checkGuess(userInput) {
    let right = 0;
    let misplaced = 0;
    let wrong = 0;

    userInput.forEach((num, i) => {
      if (goalNumber[i] === num) {
        right++;
      } else if (goalNumber.includes(num)) {
        misplaced++;
      } else {
        wrong++;
      }
    });

    return { right, wrong, misplaced };
  }

  function createInputArea(length) {
    const inputs = [];
    for (let i = 0; i < length; i++) {
      const input = document.createElement("input");
      input.dataset.index = i;
      const toggleActive = (add) => {
        if (add) {
          input.classList.add("active");
          document
            .querySelectorAll(`.hint-number[data-index='${i}']`)
            .forEach((el) => el.classList.add("active"));
        } else {
          input.classList.remove("active");
          document
            .querySelectorAll(`.hint-number[data-index='${i}']`)
            .forEach((el) => el.classList.remove("active"));
        }
      };

      input.addEventListener("mouseenter", () => toggleActive(true));
      input.addEventListener("mouseleave", () => toggleActive(false));

      input.addEventListener("focus", () => toggleActive(true));
      input.addEventListener("blur", () => toggleActive(false));
      input.type = "text";
      input.inputMode = "numeric";
      input.pattern = "[0-9]*";

      input.addEventListener("input", (e) => {
        const lastChar = e.data.replace(/[^0-9]/g, "");
        e.target.value = lastChar;
        if (lastChar && i + 1 < inputs.length && inputs[i + 1]) {
          inputs[i + 1].focus();
        }
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
          e.preventDefault();
          if (input.value) {
            input.value = "";
          } else if (i > 0 && inputs[i - 1]) {
            inputs[i - 1].focus();
          }
        }
      });
      inputContainer.appendChild(input);
      inputs.push(input);
    }

    const button = document.createElement("button");
    const hintButton = document.createElement("button");
    button.textContent = "Guess";
    const hintButtonSpan = document.createElement("span");
    hintButtonSpan.innerHTML = `Receive Hint <br> (${maxGuess} left)`;
    inputContainer.appendChild(button);
    hintButton.appendChild(hintButtonSpan);
    inputContainer.appendChild(hintButton);

    button.addEventListener("click", () => {
      if (gameOver) return;
      const guess = inputs.map((i) => parseInt(i.value, 10));
      if (guess.some(isNaN) || guess.length !== goalNumber.length) {
        writeToStatus("Please fill all inputs!", "yellow");
        return;
      }
      updateMoveCount();

      const goalInt = goalNumber.map((n) => parseInt(n, 10));
      if (guess.every((num, i) => num === goalInt[i])) {
        showwinMessage(`You cracked the code with ${maxGuess} hints left!`);
      } else {
        writeToStatus(`Wrong number`, "red", true);
      }

      if (moveCount > maxMove) {
        showDeathMessage(
          `You took too long, your church fired you... (${goalNumber.join("")} was the code)`,
        );
      }
    });
    hintButton.addEventListener("click", () => {
      if (gameOver) return;
      if (maxGuess < 1) {
        writeToStatus("Out of hints!", "red");
        return;
      }
      const guess = inputs.map((i) => parseInt(i.value, 10));
      if (guess.some(isNaN) || guess.length !== goalNumber.length) {
        writeToStatus("Please fill all inputs!", "yellow");
        return;
      }
      maxGuess--;
      hintButtonSpan.innerHTML = `Receive Hint (${maxGuess} left)`;

      const {
        right: hintRight,
        wrong: hintWrong,
        misplaced: hintMisplaced,
      } = checkGuess(guess);
      const hintContainer = document.createElement("div");
      hintContainer.className = "hint-number";
      const statsDiv = createStats(hintRight, hintWrong, hintMisplaced);
      const hintButtonSpan2 = document.createElement("span");
      hintButtonSpan2.textContent = guess.join("");
      hintContainer.appendChild(statsDiv);
      hintContainer.appendChild(hintButtonSpan2);
      hintHistory.appendChild(hintContainer);
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    });
  }
  function saveHistory() {
    const historyItem = [];
    guessContainer.querySelectorAll(`.hint-number`).forEach((el) => {
      historyItem.push(el.style.backgroundColor);
    });
    noteHistory.push(historyItem);
  }
  createInputArea(numberLength);
  Sortable.create(guessContainer, {
    animation: 150,
    ghostClass: "dragging",
  });
  noteReset.addEventListener("click", () => {
    saveHistory();
    guessContainer.querySelectorAll(".hint-number").forEach((el) => {
      el.style.backgroundColor = defaultColor;
    });
  });
  noteUndo.addEventListener("click", () => {
    if (noteHistory.length > 0) {
      const historyItem = noteHistory.pop();
      guessContainer.querySelectorAll(`.hint-number`).forEach((el, index) => {
        el.style.backgroundColor = historyItem[index];
      });
    } else {
      writeToStatus("Nothing to undo");
    }
  });
})();

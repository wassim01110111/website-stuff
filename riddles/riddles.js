generateRules(riddle);
const container = document.getElementById("answer-riddle");

function showRiddle({
  showImage = false,
  answer,
  numbersOnly = false,
  maxChars = false,
  lowercase = false,
  customFunc = null,
}) {
  if (showImage) {
    const img = document.createElement("img");
    img.src = showImage;
    img.className = "riddle-image";
    container.appendChild(img);
  }
  const inputContainer = document.createElement("div");
  inputContainer.id = "input-container";
  const input = document.createElement("input");

  input.type = "text";
  if (numbersOnly) {
    input.inputMode = "numeric";
    input.pattern = "[0-9]*";
  }

  inputContainer.appendChild(input);
  container.appendChild(inputContainer);

  const button = document.createElement("button");
  button.textContent = "Submit";
  button.className = "riddle-button";
  inputContainer.appendChild(button);
  function submit() {
    let inputAnswer = numbersOnly
      ? parseInt(input.value)
      : lowercase
        ? input.value.toLowerCase()
        : input.value;
    if (customFunc !== null) {
      inputAnswer = customFunc(inputAnswer);
    }
    const multiAnswers = answer instanceof Set;
    if (
      (multiAnswers && answer.has(inputAnswer)) ||
      (!multiAnswers && inputAnswer === answer)
    ) {
      showwinMessage("You answered Arrodes's riddle correctly!");
    } else {
      showDeathMessage(
        "Incorrect! Arrodes struck you down with a lightning strike!",
      );
    }
  }
  input.addEventListener("input", (e) => {
    if (numbersOnly) {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
    }
    if (maxChars) {
      e.target.value = e.target.value.slice(-maxChars);
    }
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submit();
    }
  });
  button.addEventListener("click", submit);
}
showRiddle(ans);

function scrollBottom() {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
}
function render() {
  leftDiv.innerHTML = "";
  rightDiv.innerHTML = "";
  raftDiv.innerHTML = "";

  left.forEach((i) => leftDiv.appendChild(makeItem(i, "left")));
  right.forEach((i) => rightDiv.appendChild(makeItem(i, "right")));
  raft.forEach((i) => raftDiv.appendChild(makeItem(i, "raft")));

  raftEl.className = "raft " + raftSide;
  moveSpan.textContent = moveCount;
  scrollBottom();
}

const container = document.getElementById("pizza-container");
function generateSolvableArray(n) {
  const target = Array(n).fill(1);
  const solution = [];
  const solutionSize = Math.floor(n / 2);

  while (solution.length < solutionSize) {
    const r = Math.floor(Math.random() * n);
    if (!solution.includes(r)) solution.push(r);
  }

  const board = [...target];
  solution.forEach((i) => {
    [(i - 1 + n) % n, i, (i + 1) % n].forEach((j) => {
      board[j] ^= 1;
    });
  });

  console.log(solution, board);
  return [board, solution.length];
}
function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

if (!Array.isArray(pizzaData)) {
  [pizzaData, maxMove] = generateSolvableArray(pizzaData);
  document.querySelectorAll(".maxMove").forEach((el) => {
    el.textContent = maxMove;
  });
}

const fanArts = [
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1445703973897109555",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1463245926033264878",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1462442532767010987",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1462359429780602980",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1461960636262125806",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1458778636223254703",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1458778636223254703",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1458778636223254703",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1458778636223254703",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1458778636223254703",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1458778636223254703",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1457362406937198602",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1456987901283008512",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1456626404920918158",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1444319115090202675",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1440380258837856256",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1436783550824317159",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1435464344111677722",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1434258177968443533",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1422934569857847297",
  ],
  [
    "https://discord.com/channels/563405492420870155/678624429932019732/1419677103179436032",
  ],
];
const fanArtIndex = Math.floor(Math.random() * fanArts.length);
const [imgSrc, imgSauce] = [
  `../fanart/fanart${fanArtIndex + 1}.png`,
  fanArts[fanArtIndex][0],
];

console.log("Here is the sauce:", imgSauce);
const slices = pizzaData.length;
const radius = 200;
const svgNS = "http://www.w3.org/2000/svg";
const svg = document.createElementNS(svgNS, "svg");
svg.setAttribute("width", "400");
svg.setAttribute("height", "400");
svg.setAttribute("viewBox", "0 0 400 400");
generateRules([
  `TempestUFraud has shared <a href="${imgSauce}" target="_blank" style="color:yellow;text-decoration:none;">an amazing FanArt</a> with you!`,
  "Some parts got mangled in the process…",
  "Click on the parts to unconceal them.",
  "Be warned: your unconcealment tool is tricky; it also serves as a powerful concealment tool, toggling nearby parts!",
  `You have ${maxMove} moves before the FanArt becomes permanently corrupted.`,
]);
const defs = document.createElementNS(svgNS, "defs");
const grad = document.createElementNS(svgNS, "radialGradient");
grad.setAttribute("id", "disabledGradient");
grad.setAttribute("cx", "50%");
grad.setAttribute("cy", "50%");
grad.setAttribute("r", "50%");
const stop1 = document.createElementNS(svgNS, "stop");
stop1.setAttribute("offset", "0%");
stop1.setAttribute("stop-color", "#6c5ce7");
const stop2 = document.createElementNS(svgNS, "stop");
stop2.setAttribute("offset", "100%");
stop2.setAttribute("stop-color", "#a29bfe");
grad.appendChild(stop1);
grad.appendChild(stop2);
defs.appendChild(grad);
svg.appendChild(defs);

function describeSlice(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

for (let i = 0; i < slices; i++) {
  const angleStep = 360 / slices;
  const startAngle = i * angleStep;
  const endAngle = (i + 1) * angleStep;
  const d = describeSlice(200, 200, radius, startAngle, endAngle);

  const group = document.createElementNS(svgNS, "g");
  group.dataset.index = i;

  const pattern = document.createElementNS(svgNS, "pattern");
  pattern.setAttribute("id", `imgPattern${i}`);
  pattern.setAttribute("patternUnits", "userSpaceOnUse");
  pattern.setAttribute("width", 400);
  pattern.setAttribute("height", 400);
  const image = document.createElementNS(svgNS, "image");
  image.setAttribute("href", imgSrc);
  image.setAttribute("width", 400);
  image.setAttribute("height", 400);
  image.setAttribute("preserveAspectRatio", "none");

  pattern.appendChild(image);
  defs.appendChild(pattern);

  const imgPath = document.createElementNS(svgNS, "path");
  imgPath.setAttribute("d", d);
  imgPath.setAttribute("fill", `url(#imgPattern${i})`);
  imgPath.classList.add("slice-image");
  imgPath.setAttribute("stroke", "black");
  imgPath.setAttribute("stroke-width", "1.5");

  const gradPath = document.createElementNS(svgNS, "path");
  gradPath.setAttribute("d", d);
  gradPath.setAttribute("fill", "url(#disabledGradient)");
  gradPath.classList.add("slice-gradient");
  gradPath.setAttribute("stroke", "black");
  gradPath.setAttribute("stroke-width", "1.5");

  if (pizzaData[i] === 0) {
    group.classList.add("disabled");
  }

  group.appendChild(imgPath);
  group.appendChild(gradPath);

  group.addEventListener("click", () => {
    updateMoveCount();
    const neighbors = [i, (i - 1 + slices) % slices, (i + 1) % slices];
    neighbors.forEach((idx) => {
      const g = svg.querySelector(`g[data-index='${idx}']`);
      g.classList.toggle("disabled");
    });
    if (svg.querySelectorAll(".disabled").length === 0) {
      showwinMessage(`
        Click on the Image to see the source
  <div style="text-align: center; font-family: sans-serif; color: #fff; margin-top: 20px;">
    <a href="${imgSauce}" target="_blank">
      <img src="${imgSrc}" alt="Image Source" style="max-height: 70vh; max-width:100%; cursor: pointer; border: 2px solid #fff; border-radius: 8px;" />
    </a>
  </div>
`);
    } else if (moveCount >= maxMove) {
      showDeathMessage(
        "The delicate parts were mangled beyond repair. The masterpiece is gone.",
      );
    }
  });

  svg.appendChild(group);
}

container.appendChild(svg);

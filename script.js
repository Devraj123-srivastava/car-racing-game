const score = document.querySelector(".score");
const startBtn = document.querySelector(".start");
const gameArea = document.querySelector(".gameArea");
const pauseScreen = document.querySelector("#pauseScreen");
const pauseScore = document.querySelector("#pauseScore");

let player = {
  speed: 5,
  score: 0,
  isGamePaused: false,
  start: false,
};

let lastMilestone = 0; 

let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowRight: false,
  ArrowLeft: false,
  Space: false,
};

let lines = [];
let enemies = [];
let car;
let rafId = null;

startBtn.addEventListener("click", () => start(1));
document.addEventListener("keydown", pressOn);
document.addEventListener("keyup", pressOff);

function pressOn(e) {
  e.preventDefault();
  keys[e.key] = true;
  if (e.code === "Space") {
    player.isGamePaused = !player.isGamePaused;
    if (player.isGamePaused) {
      pauseScreen.classList.remove("hide");
      pauseScore.textContent = `Score: ${player.score}`;
    } else {
      pauseScreen.classList.add("hide");
    }
  }
}

function pressOff(e) {
  e.preventDefault();
  keys[e.key] = false;
}

function moveLines() {
  lines.forEach((item) => {
    if (item.y >= 1500) item.y -= 1500;
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function isCollide(a, b) {
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();
  return !(
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

function moveEnemy() {
  enemies.forEach((item) => {
    if (car && isCollide(car, item)) {
      endGame();
      return;
    }
    if (item.y >= 1500) {
      item.y = -600;
      item.style.left = Math.floor(Math.random() * (gameArea.clientWidth - 50)) + "px";
      item.style.backgroundColor = randomColor();
    }
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function playGame() {
  if (player.isGamePaused || !player.start) {
    rafId = window.requestAnimationFrame(playGame);
    return;
  }

  
  const maxX = gameArea.clientWidth - 50; 
  const maxY = gameArea.clientHeight - 100; 

  // Movement
  if (keys.ArrowUp && player.y > 0) player.y -= player.speed;
  if (keys.ArrowDown && player.y < maxY) player.y += player.speed;

  if (keys.ArrowLeft && player.x > 0) {
    player.x -= player.speed;
    car.style.transform = "rotate(-5deg)";
  } else if (keys.ArrowRight && player.x < maxX) {
    player.x += player.speed;
    car.style.transform = "rotate(5deg)";
  } else {
    car.style.transform = "rotate(0deg)";
  }

  car.style.left = `${player.x}px`;
  car.style.top = `${player.y}px`;

  moveLines();
  moveEnemy();


  player.score++;
  score.textContent = `Score: ${player.score}`;

  
  if (player.score > 0 && player.score % 1000 === 0 && lastMilestone !== player.score) {
    player.speed += 1;
    lastMilestone = player.score;
  }

  rafId = window.requestAnimationFrame(playGame);
}

function endGame() {
  player.start = false;
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  const highScore = Number(localStorage.getItem("highScore") || 0); 
  if (player.score > highScore) {
    localStorage.setItem("highScore", String(player.score));
    score.innerHTML = `New High Score! Score: ${player.score}`;
  } else {
    score.innerHTML = `Game Over<br>Score was ${player.score}`;
  }

  gameArea.classList.add("fadeOut");
  startBtn.classList.remove("hide");
}

function start(level) {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  gameArea.classList.remove("fadeOut");
  startBtn.classList.add("hide");
  gameArea.innerHTML = "";

  
  lines = [];
  enemies = [];


  player.start = true;
  player.isGamePaused = false;
  player.speed = 5;     // always start at 5
  player.score = 0;
  lastMilestone = 0;

  // Road lines
  for (let x = 0; x < 10; x++) {
    const div = document.createElement("div");
    div.classList.add("line");
    div.y = x * 150;
    div.style.top = `${div.y}px`;
    gameArea.appendChild(div);
    lines.push(div);
  }

  // Player car
  car = document.createElement("div");
  car.setAttribute("class", "car");
  gameArea.appendChild(car);

  
  player.x = (gameArea.clientWidth - 50) / 2;
  player.y = gameArea.clientHeight - 100 - 20; // 20px margin from bottom
  car.style.left = `${player.x}px`;
  car.style.top = `${player.y}px`;

  
  const numEnemies = 3 + level;
  for (let i = 0; i < numEnemies; i++) {
    const enemy = document.createElement("div");
    enemy.classList.add("enemy");
    enemy.y = (i + 1) * 600 * -1;
    enemy.style.top = `${enemy.y}px`;
    enemy.style.left = `${Math.floor(Math.random() * (gameArea.clientWidth - 50))}px`;

    
    enemy.style.filter = `hue-rotate(${Math.floor(Math.random() * 360)}deg)`;

    gameArea.appendChild(enemy);
    enemies.push(enemy);
  }

  rafId = window.requestAnimationFrame(playGame);
}

function randomColor() {
  const hex = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + ("000000" + hex).slice(-6);
}

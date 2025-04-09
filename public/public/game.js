const socket = io("https://your-backend-url.up.railway.app"); // Replace this later with your backend

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = { x: 160, y: 500, width: 30, height: 30, color: "orange", id: null };
let otherPlayers = [];
let score = 0;
let streak = 0;
let glasses = [];
let vests = [];
let obstacles = [];
let isInvincible = false;
let invincibilityTimer = 0;
let keys = {};

document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

// Swipe for mobile
let touchStartX = 0;
canvas.addEventListener("touchstart", (e) => touchStartX = e.touches[0].clientX);
canvas.addEventListener("touchend", (e) => {
  let dx = e.changedTouches[0].clientX - touchStartX;
  if (dx > 30) player.x += 50;
  else if (dx < -30) player.x -= 50;
});

function checkCollision(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function drawPlayer(p, isMe = false) {
  ctx.fillStyle = isMe ? player.color : "gray";
  ctx.fillRect(p.x, p.y, p.width, p.height);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move player
  if (keys["ArrowLeft"] && player.x > 0) player.x -= 5;
  if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += 5;

  // Draw all players
  drawPlayer(player, true);
  otherPlayers.forEach(p => drawPlayer(p));

  // Handle glasses
  if (Math.random() < 0.02) {
    glasses.push({ x: Math.random() * (canvas.width - 20), y: -20, width: 20, height: 20 });
  }
  glasses.forEach((g, i) => {
    g.y += 3;
    ctx.fillStyle = "blue";
    ctx.fillRect(g.x, g.y, g.width, g.height);
    if (checkCollision(player, g)) {
      glasses.splice(i, 1);
      streak++;
      if (streak % 3 === 0) player.color = "blue"; // Speed streak
    }
  });

  // Handle vests
  if (Math.random() < 0.01) {
    vests.push({ x: Math.random() * (canvas.width - 30), y: -30, width: 25, height: 25 });
  }
  vests.forEach((v, i) => {
    v.y += 4;
    ctx.fillStyle = "yellow";
    ctx.fillRect(v.x, v.y, v.width, v.height);
    if (checkCollision(player, v)) {
      vests.splice(i, 1);
      isInvincible = true;
      invincibilityTimer = 300;
    }
  });

  // Handle invincibility
  if (isInvincible) {
    invincibilityTimer--;
    ctx.fillStyle = "black";
    ctx.fillText("Invincible!", player.x - 10, player.y - 10);
    if (invincibilityTimer <= 0) isInvincible = false;
  }

  // Handle obstacles
  if (Math.random() < 0.03) {
    obstacles.push({ x: Math.random() * (canvas.width - 20), y: -20, width: 20, height: 20 });
  }
  obstacles.forEach((obs, i) => {
    obs.y += 4;
    ctx.fillStyle = "red";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    if (!isInvincible && checkCollision(player, obs)) {
      endGame();
    }
  });

  // Score increases with time
  score++;
  document.getElementById("score").textContent = `Score: ${score}`;
  document.getElementById("streak").textContent = `Streak: ${streak}`;

  // Send position to server
  socket.emit("playerMove", { x: player.x });

  requestAnimationFrame(gameLoop);
}

function endGame() {
  socket.emit("submitScore", {
    name: player.name || "Anonymous",
    avatar: player.avatar || "",
    score: score
  });
  alert(`Game over! Your score: ${score}`);
  window.location.href = "/";
}

// Connect to server
socket.on("connect", () => {
  player.id = socket.id;
  socket.emit("joinGame");
});

socket.on("updatePlayers", (players) => {
  otherPlayers = Object.values(players).filter(p => p.id !== player.id);
});

gameLoop();

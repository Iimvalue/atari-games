const canvas = document.getElementById("myCanvas");
const ctx    = canvas.getContext("2d");

// —— Game State ——
let gameStarted    = false;
let ballRadius     = 10;
let level          = 1;
let maxLevel       = 3;

let x              = canvas.width / 2;
let y              = canvas.height - 30;
let dx             = 2;
let dy             = -2;
let paddleHeight   = 10;
let paddleWidth    = 75;
let paddleX        = (canvas.width - paddleWidth) / 2;
let paddleSpeed    = 8;
let rightPressed   = false;
let leftPressed    = false;
let score          = 0;
let lives          = 3;

// —— Bricks setup ——
const brickRowCount    = 1;
const brickColumnCount = 1;
const brickWidth       = 100;
const brickHeight      = 20;
const brickPadding     = 10;
const brickOffsetTop   = 30;
const brickOffsetLeft  = 30;
const bricksColors     = ["#ff91b2","#ffc0cb","#ffe4e1","#91e5d6","#4cd5db"];

let bricks = [];
initBricks();

function initBricks() {
  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = {
        x: 0,
        y: 0,
        status: 1,
        color: bricksColors[Math.floor(Math.random() * bricksColors.length)]
      };
    }
  }
}

// —— Input Handlers ——
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") rightPressed = true;
  if (e.key === "ArrowLeft")  leftPressed  = true;
});
document.addEventListener("keyup", e => {
  if (e.key === "ArrowRight") rightPressed = false;
  if (e.key === "ArrowLeft")  leftPressed  = false;
});
document.addEventListener("mousemove", e => {
  const relX = e.clientX - canvas.offsetLeft;
  if (relX > 0 && relX < canvas.width) {
    paddleX = relX - paddleWidth / 2;
  }
});

// —— Collision Detection ——
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status &&
          x > b.x && x < b.x + brickWidth &&
          y > b.y && y < b.y + brickHeight) {
        dy = -dy;
        b.status = 0;
        score++;
        // Play sound if available
        const sound = document.getElementById("sond");
        if (sound) sound.play();
        // Check if level completed
        if (score === brickRowCount * brickColumnCount) {
          if (level < maxLevel) {
            let nextLevelMessage = "CONGRATULATIONS!\nYOU COMPLETED LEVEL ${level}!\n";
            if (level + 1 === 2) {
              nextLevelMessage += "\nLEVEL 2: The paddle will be smaller and faster.";
            } else if (level + 1 === 3) {
              nextLevelMessage += "\nLEVEL 3: The paddle will be even smaller and faster!";
            }
            showMessage(nextLevelMessage, () => {
              level++;
              nextLevel();
            });
          } else {
            showMessage("CONGRATULATIONS!\nYOU COMPLETED ALL LEVELS!", resetGame);
          }
        }
      }
    }
  }
}

// —— Draw Functions ——
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status) {
        b.x = r * (brickWidth + brickPadding) + brickOffsetLeft;
        b.y = c * (brickHeight + brickPadding) + brickOffsetTop;
        ctx.beginPath();
        ctx.rect(b.x, b.y, brickWidth, brickHeight);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
}

function drawLevel() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Level: " + level, canvas.width/2 - 30, 20);
}

function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "32px Arial";
  ctx.fillStyle = "#333";
  ctx.fillText("Click Anywhere to Start", 170, canvas.height / 2);
}

// —— Message Display Function ——
function showMessage(message, callback) {
  gameStarted = false;
  const messageMarker = document.createElement("div");
  messageMarker.className = "message-overlay";
  document.body.appendChild(messageMarker);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "24px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";

  const lines = message.split('\n');
  let yPos = canvas.height/2 - ((lines.length - 1) * 30);
  lines.forEach(line => {
    ctx.fillText(line, canvas.width/2, yPos);
    yPos += 30;
  });

  let clickEnabled = false;
  setTimeout(() => {
    clickEnabled = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";

    let innerY = canvas.height/2 - ((lines.length - 1) * 30);
    lines.forEach(line => {
      ctx.fillText(line, canvas.width/2, innerY);
      innerY += 30;
    });
    ctx.fillText("Click to continue...", canvas.width/2, innerY + 20);
  }, 2000);

  const clickHandler = () => {
    if (!clickEnabled) return;
    canvas.removeEventListener("click", clickHandler);
    document.body.removeChild(messageMarker);
    gameStarted = true;
    if (callback) callback();
  };
  canvas.addEventListener("click", clickHandler);
}

// —— Level Progression ——
function nextLevel() {
  resetBallAndPaddle();
  initBricks();
  score = 0;
  if (level === 2) {
    paddleWidth = 60;
    paddleSpeed = 10;
  } else if (level === 3) {
    paddleWidth = 45;
    paddleSpeed = 12;
  }
}

// —— Reset Helpers ——
function resetBallAndPaddle() {
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2;
  dy = -2;
  paddleX = (canvas.width - paddleWidth) / 2;
}

function resetGame() {
  level = 1;
  lives = 3;
  score = 0;
  paddleWidth = 75;
  paddleSpeed = 8;
  resetBallAndPaddle();
  initBricks();
}

// —— Main Loop ——
function draw() {
  if (gameStarted) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    drawLevel();
    collisionDetection();

    // walls & paddle collisions & lives logic
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    if (y + dy < ballRadius) dy = -dy;
    else if (y + dy > canvas.height - ballRadius) {
      if (x > paddleX && x < paddleX + paddleWidth) dy = -dy;
      else {
        lives--;
        if (lives === 0) {
          showMessage("GAME OVER", resetGame);
        } else {
          resetBallAndPaddle();
        }
      }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
    if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;

    x += dx * 3;
    y += dy * 3;
  } else {
    if (document.querySelector(".message-overlay")) {
    } else {
      drawStartScreen();
    }
  }
  requestAnimationFrame(draw);
}

// —— Start Game on Click ——
canvas.addEventListener("click", () => {
  if (!gameStarted && level === 1 && score === 0 && lives === 3) {
    gameStarted = true;
    resetBallAndPaddle();
  }
});

// —— Initial Render ——
draw();





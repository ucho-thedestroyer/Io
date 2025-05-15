const player = document.getElementById("player");
const bullets = document.getElementById("bullets");
const enemies = document.getElementById("enemies");
const sprite = document.getElementById("sprite");
const bossElement = document.getElementById("boss");
const shootSFX = document.getElementById("shoot-sfx");

let posX = 100;
let velY = 0;
let isJumping = false;
let gravity = 0.8;
const groundY = 80;
const jumpPower = 14;
let keys = {};
let lives = 3;
let score = 0;
let bossHealth = 10;

// Fill in sprite grid
for (let i = 0; i < 256; i++) {
  const pixel = document.createElement("div");
  sprite.appendChild(pixel);
}

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function spawnEnemy() {
  const enemy = document.createElement("div");
  enemy.style.left = window.innerWidth + "px";
  enemies.appendChild(enemy);

  function move() {
    const currentX = parseInt(enemy.style.left);
    if (currentX < -40) {
      enemy.remove();
      decrementLives();
    } else {
      enemy.style.left = currentX - 2 + "px";
      requestAnimationFrame(move);
    }
  }
  move();
}

function shoot() {
  shootSFX.currentTime = 0;
  shootSFX.play();

  const bullet = document.createElement("div");
  bullet.style.left = posX + 32 + "px";
  bullet.style.bottom = player.style.bottom;
  bullets.appendChild(bullet);

  function moveBullet() {
    const bx = parseInt(bullet.style.left);
    if (bx > window.innerWidth) {
      bullet.remove();
    } else {
      bullet.style.left = bx + 8 + "px";
      requestAnimationFrame(moveBullet);
    }
  }

  moveBullet();
}

function decrementLives() {
  lives--;
  updateUI();
  if (lives <= 0) {
    alert("Game Over!");
  }
}

function incrementScore() {
  score += 100;
  updateUI();
}

function updateUI() {
  document.getElementById("lives").textContent = `Lives: ${lives}`;
  document.getElementById("score").textContent = `Score: ${score}`;
}

function checkCollisions() {
  const bulletElements = document.querySelectorAll('.bullets div');
  const enemyElements = document.querySelectorAll('.enemies div');
  const bossRect = bossElement.getBoundingClientRect();

  bulletElements.forEach(bullet => {
    const bulletRect = bullet.getBoundingClientRect();

    enemyElements.forEach(enemy => {
      const enemyRect = enemy.getBoundingClientRect();

      if (
        bulletRect.left < enemyRect.right &&
        bulletRect.right > enemyRect.left &&
        bulletRect.top < enemyRect.bottom &&
        bulletRect.bottom > enemyRect.top
      ) {
        bullet.remove();
        enemy.remove();
        incrementScore();
      }
    });

    if (
      bulletRect.left < bossRect.right &&
      bulletRect.right > bossRect.left &&
      bulletRect.top < bossRect.bottom &&
      bulletRect.bottom > bossRect.top
    ) {
      bullet.remove();
      bossHealth--;
      if (bossHealth <= 0) {
        bossElement.remove();
        alert("You defeated the final boss!");
      }
    }
  });
}

function update() {
  if (keys["ArrowRight"]) posX += 4;
  if (keys["ArrowLeft"]) posX -= 4;
  if (keys["ArrowUp"] && !isJumping) {
    isJumping = true;
    velY = jumpPower;
  }

  if (keys[" "]) {
    keys[" "] = false;
    shoot();
  }

  if (isJumping) {
    let newY = parseInt(player.style.bottom || "80") + velY;
    player.style.bottom = newY + "px";
    velY -= gravity;
    if (newY <= groundY) {
      player.style.bottom = groundY + "px";
      isJumping = false;
      velY = 0;
    }
  }

  player.style.left = posX + "px";
  checkCollisions();
  requestAnimationFrame(update);
}

setInterval(spawnEnemy, 2000);
updateUI();
update();
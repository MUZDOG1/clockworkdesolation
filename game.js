// Game core functionality
const carImage = new Image();
carImage.src = 'car1.png';
let car = null;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const backgroundImage = new Image();
backgroundImage.src = 'house_background.png';

const newBackgroundImage = new Image();
newBackgroundImage.src = 'fr.png';

let currentBackground = backgroundImage;

const playerImage = new Image();
playerImage.src = 'idle.png';

const punchImage = new Image();
punchImage.src = 'punch.png';

const enemyDeadImage = new Image();
enemyDeadImage.src = 'dead.png';

const enemyKneelingImage = new Image();
enemyKneelingImage.src = 'kneeling.png';

const lyingImage = new Image();
lyingImage.src = 'lying.png';

const player = {
  x: 200,
  y: 500,
  width: 50,
  height: 50,
  speed: 5,
  isPunching: false
};

const walls = [
  { x: 1.5, y: 331, width: 250.5, height: 25 },
  { x: 342, y: 330, width: 500, height: 25 },
  { x: 153, y: 0, width: 25, height: 200 },
  { x: 0.5, y: 166, width: 75, height: 25 }
];

const keys = {};
document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

function setupCanvas() {
  canvas.width = 800;
  canvas.height = 600;
}
setupCanvas();

function handleResize() {
  const container = document.getElementById('gameContainer');
  const wrapper = document.getElementById('gameWrapper');
  const scale = Math.min(container.clientWidth / 800, container.clientHeight / 600);
  wrapper.style.setProperty('--game-scale', scale);
}

window.addEventListener('resize', handleResize);
handleResize();

function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function moveEntity(entity, dx, dy) {
  entity.x += dx;
  for (const wall of walls) {
    if (isColliding(entity, wall)) {
      entity.x -= dx;
      break;
    }
  }
  entity.y += dy;
  for (const wall of walls) {
    if (isColliding(entity, wall)) {
      entity.y -= dy;
      break;
    }
  }
}

let lastAttackTime = 0;
// Modified attack() to check both enemyActive and extraApes.
function attack() {
  let targets = [];
  if (enemyActive && !enemyActive.isDead) { targets.push(enemyActive); }
  extraApes.forEach(ape => {
    if (!ape.isDead) { targets.push(ape); }
  });
  if (targets.length === 0) return;
  const now = Date.now();
  if (now - lastAttackTime < 500) return;
  
  targets.forEach(target => {
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;
    const tx = target.x + target.width / 2;
    const ty = target.y + target.height / 2;
    const dx = px - tx;
    const dy = py - ty;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 100) {
      playPunchSound();
      player.isPunching = true;
      setTimeout(() => { player.isPunching = false; }, 200);
      target.isHurt = true;
      const knockbackIntensity = 7.5;
      const knockbackDuration = 15;
      const mag = Math.sqrt(dx * dx + dy * dy);
      target.knockbackVelocity.x = -(dx / mag) * knockbackIntensity;
      target.knockbackVelocity.y = -(dy / mag) * knockbackIntensity;
      target.knockbackDuration = knockbackDuration;
      target.health -= 10;
      
      // Special handling for ape enemy:
      if (target.type === 'ape') {
        if (target.health > 0) {
          target.hitImage.src = 'chimphurt.png';
          target.isFleeing = true;
          target.fleeingDuration = 120;
          setTimeout(() => { target.isHurt = false; }, 2000);
        } else {
          target.health = 0;
          target.isDead = true;
          target.idleImage.src = 'placeholder.jpg';
          // Only for the initial ape (enemyActive), spawn extra apes separated by 100px.
          if (target === enemyActive && !window.firstApeSpawned) {
            window.firstApeSpawned = true;
            spawnApeEnemyWithPosition(target.x - 100, target.y);
            spawnApeEnemyWithPosition(target.x + 100, target.y);
          }
        }
      } else {
        // Handling for non-ape enemies.
        if (target.health <= 0) {
          target.health = 0;
          target.isDead = true;
          if (target.type === 'woman') {
            const womanVideo = document.getElementById('womanExecutionVideo');
            womanVideo.style.display = 'block';
            womanVideo.currentTime = 0;
            womanVideo.play();
            womanVideo.onended = () => {
              target.idleImage.src = "womandead.png";
              womanVideo.style.display = 'none';
              setTimeout(() => {
                playCrashVideo();
              }, 5000);
            };
          } else {
            target.deathState = 'dead';
            setTimeout(() => { target.deathState = 'kneeling'; }, 2500);
            setTimeout(() => {
              showDeathGif();
              setTimeout(() => {
                hideDeathGif();
                target.deathState = 'lying';
                enemyCorpse = target;
                if (target.type === 'default') {
                  spawnNewEnemy();
                }
              }, 5000);
            }, 4000);
          }
        }
      }
      lastAttackTime = now;
    }
  });
  setTimeout(() => { targets.forEach(t => { t.isHurt = false; }); }, 1000);
}

function update() {
  if (!gameStarted || document.getElementById('introVideo').style.display === 'block') return;
  
  let moveX = 0, moveY = 0;
  if (keys['w']) moveY = -player.speed;
  if (keys['s']) moveY = player.speed;
  if (keys['a']) moveX = -player.speed;
  if (keys['d']) moveX = player.speed;
  moveEntity(player, moveX, moveY);
  if (keys[' ']) attack();
  
  if (enemyActive && !enemyActive.isDead) {
    if (enemyActive.knockbackDuration > 0) {
      moveEntity(enemyActive, enemyActive.knockbackVelocity.x, enemyActive.knockbackVelocity.y);
      enemyActive.knockbackVelocity.x *= 0.9;
      enemyActive.knockbackVelocity.y *= 0.9;
      enemyActive.knockbackDuration--;
    } else if (enemyActive.type === 'ape' && enemyActive.isFleeing) {
      const distanceToPlayer = getDistanceBetween(enemyActive, player);
      if (distanceToPlayer >= enemyActive.safeDistance) {
        enemyActive.fleeingDuration -= 2;
      }
      const px = player.x + player.width / 2;
      const py = player.y + player.height / 2;
      const ex = enemyActive.x + enemyActive.width / 2;
      const ey = enemyActive.y + enemyActive.height / 2;
      const dx = ex - px;
      const dy = ey - py;
      const mag = Math.sqrt(dx * dx + dy * dy) || 1;
      const fleespeed = 3.5;
      const moveX = (dx / mag) * fleespeed;
      const moveY = (dy / mag) * fleespeed;
      moveEntity(enemyActive, moveX, moveY);
      enemyActive.fleeingDuration--;
      if (enemyActive.fleeingDuration <= 0) {
        enemyActive.isFleeing = false;
      }
    } else {
      if (enemyActive.type === 'ape') {
        // Ape stands still when not fleeing.
      } else {
        if (Math.random() < 0.02) {
          const randX = Math.random() * 6 - 3;
          const randY = Math.random() * 6 - 3;
          moveEntity(enemyActive, randX, randY);
        }
      }
    }
    enemyActive.x = Math.max(0, Math.min(canvas.width - enemyActive.width, enemyActive.x));
    enemyActive.y = Math.max(0, Math.min(canvas.height - enemyActive.height, enemyActive.y));
  }
  // Update extra ape enemies.
  extraApes.forEach(ape => {
    if (!ape.isDead) {
      if (ape.knockbackDuration > 0) {
        moveEntity(ape, ape.knockbackVelocity.x, ape.knockbackVelocity.y);
        ape.knockbackVelocity.x *= 0.9;
        ape.knockbackVelocity.y *= 0.9;
        ape.knockbackDuration--;
      } else if (ape.isFleeing) {
        const distanceToPlayer = getDistanceBetween(ape, player);
        if (distanceToPlayer >= ape.safeDistance) {
          ape.fleeingDuration -= 2;
        }
        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;
        const ex = ape.x + ape.width / 2;
        const ey = ape.y + ape.height / 2;
        const dx = ex - px;
        const dy = ey - py;
        const mag = Math.sqrt(dx * dx + dy * dy) || 1;
        const fleespeed = 3.5;
        const moveX = (dx / mag) * fleespeed;
        const moveY = (dy / mag) * fleespeed;
        moveEntity(ape, moveX, moveY);
        ape.fleeingDuration--;
        if (ape.fleeingDuration <= 0) {
          ape.isFleeing = false;
        }
      }
      ape.x = Math.max(0, Math.min(canvas.width - ape.width, ape.x));
      ape.y = Math.max(0, Math.min(canvas.height - ape.height, ape.y));
    }
  });
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  if (currentBackground.complete) {
    ctx.drawImage(currentBackground, 0, 0, 800, 600);
  }

  if (enemyCorpse) {
    if (enemyCorpse.deathState === 'lying' && lyingImage.complete) {
      ctx.drawImage(lyingImage, enemyCorpse.x, enemyCorpse.y, enemyCorpse.width, enemyCorpse.height);
    } else if (enemyCorpse.deathState === 'dead' && enemyDeadImage.complete) {
      ctx.drawImage(enemyDeadImage, enemyCorpse.x, enemyCorpse.y, enemyCorpse.width, enemyCorpse.height);
    } else if (enemyCorpse.deathState === 'kneeling' && enemyKneelingImage.complete) {
      ctx.drawImage(enemyKneelingImage, enemyCorpse.x, enemyCorpse.y, enemyCorpse.width, enemyCorpse.height);
    }
  }

  if (car && car.image.complete) {
    ctx.drawImage(car.image, car.x, car.y, car.width, car.height);
  }

  if (enemyActive) {
    if (enemyActive.isDead) {
      if (enemyActive.type === 'woman') {
        if (enemyActive.idleImage.complete) {
          ctx.drawImage(enemyActive.idleImage, enemyActive.x, enemyActive.y, enemyActive.width, enemyActive.height);
        }
      } else if (enemyActive.type === 'ape') {
        if (enemyActive.idleImage.complete) {
          ctx.drawImage(enemyActive.idleImage, enemyActive.x, enemyActive.y, enemyActive.width, enemyActive.height);
        }
      } else {
        if (enemyActive.deathState === 'dead' && enemyDeadImage.complete) {
          ctx.drawImage(enemyDeadImage, enemyActive.x, enemyActive.y, enemyActive.width, enemyActive.height);
        } else if (enemyActive.deathState === 'kneeling' && enemyKneelingImage.complete) {
          ctx.drawImage(enemyKneelingImage, enemyActive.x, enemyActive.y, enemyActive.width, enemyActive.height);
        }
      }
    } else {
      if (enemyActive.isHurt) {
        if (enemyActive.hitImage.complete) {
          ctx.drawImage(enemyActive.hitImage, enemyActive.x, enemyActive.y, enemyActive.width, enemyActive.height);
        }
      } else if (enemyActive.idleImage.complete) {
        ctx.drawImage(enemyActive.idleImage, enemyActive.x, enemyActive.y, enemyActive.width, enemyActive.height);
      }
    }
  }

  // Draw extra ape enemies.
  extraApes.forEach(ape => {
    if (ape.isDead) {
      if (ape.idleImage.complete) {
        ctx.drawImage(ape.idleImage, ape.x, ape.y, ape.width, ape.height);
      }
    } else {
      if (ape.isHurt) {
        if (ape.hitImage.complete) {
          ctx.drawImage(ape.hitImage, ape.x, ape.y, ape.width, ape.height);
        }
      } else if (ape.idleImage.complete) {
        ctx.drawImage(ape.idleImage, ape.x, ape.y, ape.width, ape.height);
      }
    }
  });

  if (player.isPunching && punchImage.complete) {
    ctx.drawImage(punchImage, player.x, player.y, player.width, player.height);
  } else if (playerImage.complete) {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
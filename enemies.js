// Enemy-related code
// In your code the enemy is handled via the single variable "enemyActive".
// We add a flag for the first ape and an array to hold extra apes.
if (!window.firstApeSpawned) { window.firstApeSpawned = false; }
let extraApes = [];

let enemyActive = {
  x: 326.5,
  y: 194,
  width: 50,
  height: 50,
  isHurt: false,
  knockbackVelocity: { x: 0, y: 0 },
  knockbackDuration: 0,
  isDead: false,
  deathState: '',
  health: 300,
  idleImage: new Image(),
  hitImage: new Image(),
  type: 'default'
};
enemyActive.idleImage.src = 'enemyidle.png';
enemyActive.hitImage.src = 'hit.png';

let enemyCorpse = null;

function showDeathGif() {
  document.getElementById('deathGifOverlay').style.display = 'block';
}

function hideDeathGif() {
  document.getElementById('deathGifOverlay').style.display = 'none';
}

function playCrashVideo() {
  const crashVideo = document.getElementById('crashVideo');
  crashVideo.style.display = 'block';
  crashVideo.currentTime = 0;
  crashVideo.volume = 1.0;
  const playPromise = crashVideo.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.error("Error playing crash video:", error);
    });
  }
  crashVideo.onended = () => {
    crashVideo.style.display = 'none';
    currentBackground = newBackgroundImage;
    walls.length = 0;
    car = null;
    enemyCorpse = null;
    spawnApeEnemy(); // spawn the initial ape
  };
}

// This function spawns an ape enemy at the default position (used in playCrashVideo)
function spawnApeEnemy() {
  enemyActive = {
    x: 400,
    y: 300,
    width: 50,
    height: 50,
    isHurt: false,
    knockbackVelocity: { x: 0, y: 0 },
    knockbackDuration: 0,
    isDead: false,
    deathState: '',
    health: 300,
    idleImage: new Image(),
    hitImage: new Image(),
    type: 'ape',
    isFleeing: false,
    fleeingDuration: 0,
    safeDistance: 300
  };
  enemyActive.idleImage.src = 'ape.png';
  enemyActive.hitImage.src = 'chimphurt.png';
}

// New helper function to spawn an extra ape enemy at a given position.
function spawnApeEnemyWithPosition(x, y) {
  let newApe = {
    x: x,
    y: y,
    width: 50,
    height: 50,
    isHurt: false,
    knockbackVelocity: { x: 0, y: 0 },
    knockbackDuration: 0,
    isDead: false,
    deathState: '',
    health: 300,
    idleImage: new Image(),
    hitImage: new Image(),
    type: 'ape',
    isFleeing: false,
    fleeingDuration: 0,
    safeDistance: 300
  };
  newApe.idleImage.src = 'ape.png';
  newApe.hitImage.src = 'chimphurt.png';
  extraApes.push(newApe);
}

function spawnNewEnemy() {
  enemyActive = {
    x: 518,
    y: 475,
    width: 50,
    height: 50,
    isHurt: false,
    knockbackVelocity: { x: 0, y: 0 },
    knockbackDuration: 0,
    isDead: false,
    deathState: '',
    health: 300,
    idleImage: new Image(),
    hitImage: new Image(),
    type: 'woman'
  };
  enemyActive.idleImage.src = 'woman.png';
  enemyActive.hitImage.src = 'womanhit.png';

  car = {
    x: 600,
    y: 460,
    width: 150,
    height: 80,
    image: carImage
  };
}

function getDistanceBetween(entity1, entity2) {
  const x1 = entity1.x + entity1.width / 2;
  const y1 = entity1.y + entity1.height / 2;
  const x2 = entity2.x + entity2.width / 2;
  const y2 = entity2.y + entity2.height / 2;
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}
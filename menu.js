// Menu system variables
let gameStarted = false;
let speedrunEnabled = false;
let startTime = 0;
let timerInterval = null;
const menuMusic = document.getElementById('menuMusic');

document.getElementById('continueBtn').addEventListener('click', function() {
  menuMusic.play().catch(e => console.log("Audio play failed:", e));
  document.getElementById('titleScreen').style.display = 'none';
  document.getElementById('mainMenu').style.display = 'block';
  initAudio();
});

document.getElementById('startBtn').addEventListener('click', function() {
  menuMusic.pause();
  startGame();
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  document.getElementById('settingsMenu').style.display = 
    document.getElementById('settingsMenu').style.display === 'block' ? 'none' : 'block';
});

document.getElementById('speedrunToggle').addEventListener('change', (e) => {
  speedrunEnabled = e.target.checked;
  localStorage.setItem('speedrunEnabled', speedrunEnabled);
});

if (localStorage.getItem('speedrunEnabled') === 'true') {
  document.getElementById('speedrunToggle').checked = true;
  speedrunEnabled = true;
}

function startGame() {
  gameStarted = true;
  document.getElementById('mainMenu').style.display = 'none';
  const introVideo = document.getElementById('introVideo');
  introVideo.style.display = 'block';
  introVideo.play();
  introVideo.addEventListener('ended', () => {
    introVideo.style.display = 'none';
    if(speedrunEnabled) {
      startTime = Date.now();
      document.getElementById('speedrunClock').style.display = 'block';
      updateTimer();
      timerInterval = setInterval(updateTimer, 10);
    }
    handleResize();
    setupCanvas();
    gameLoop();
  });
}

function updateTimer() {
  const elapsed = Date.now() - startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  const milliseconds = Math.floor((elapsed % 1000) / 10);
  document.getElementById('speedrunClock').textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
}
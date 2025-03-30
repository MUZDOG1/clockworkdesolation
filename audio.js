// Audio system initialization
let audioContext;
let punchSoundBuffer;
let audioInitialized = false;
const audioPromises = [];
const menuMusic = document.getElementById('menuMusic');
menuMusic.volume = 0.5;

function initAudio() {
  if (audioInitialized) return;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const loadPunchSound = fetch('punch.mp3')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(buffer => {
      punchSoundBuffer = buffer;
      audioInitialized = true;
    })
    .catch(error => {
      console.error('Error loading audio:', error);
    });
  audioPromises.push(loadPunchSound);
}

function playPunchSound() {
  if (!audioInitialized) {
    console.log("Audio not initialized yet");
    return;
  }
  try {
    const source = audioContext.createBufferSource();
    source.buffer = punchSoundBuffer;
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 3.0;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start(0);
  } catch (error) {
    console.error("Error playing punch sound:", error);
  }
}

// Setup crash video audio
const crashVideo = document.getElementById('crashVideo');
document.addEventListener('click', function enableAudio() {
  crashVideo.volume = 1.0;
  document.removeEventListener('click', enableAudio);
}, { once: true });
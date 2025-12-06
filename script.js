const soundsElement = document.querySelector('#sounds');
const stopButton = document.querySelector('#stopButton');
const players = [];

const keyCodes = [81, 87, 69, 82, 65, 83, 68, 70, 90, 88, 67, 86];
const keyMap = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyZ', 'KeyX', 'KeyC', 'KeyV'];
const keysPressed = new Set();

stopButton.addEventListener('click', stopAll);

// Immediately-Invoked Function Expression (IIFE) to fetch sounds on page load
(async () => {
  const sounds = await getSounds();
  addSoundsToPage(sounds);
})();

async function getSounds() {
  try {
    const response = await fetch('./sounds.json');
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Failed to load sounds.json:', error);
  }
}

function addSoundsToPage(sounds) {
  sounds.forEach(addSoundToPage);

  listenKeyPress();
}


function addSoundToPage(sound, index) {
  const soundDiv = document.createElement('div');
  soundDiv.className = 'sound';
  const soundTitle = document.createElement('h2');
  soundTitle.textContent = sound.title;
  soundDiv.appendChild(soundTitle);

  const key = document.createElement('img');
  key.setAttribute('src', `keys/${keyCodes[index]}.png`);
  soundDiv.appendChild(key);

  const player = document.createElement('audio');
  player.setAttribute('src', `sounds/${sound.src}`)
  soundDiv.appendChild(player);
  players.push({ player, soundDiv, key });

  // When a sound finishes playing on its own, remove the 'playing' class
  player.addEventListener('ended', () => {
    soundDiv.classList.remove('playing');
    // Also remove from keysPressed if it was triggered by a key
  });

  soundDiv.addEventListener('mousedown', () => {
    soundPress(soundDiv, player);
  });

  soundsElement.appendChild(soundDiv);
}

function soundPress(div, player) {
  player.currentTime = 0;
  player.play();
}

function listenKeyPress() {
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') return stopAll();
    if (keysPressed.has(event.code)) return; // Prevent re-triggering on key hold

    const playerIndex = keyMap.indexOf(event.code);
    const playerAndDiv = players[playerIndex];

    if (playerAndDiv) {
      keysPressed.add(event.code);
      playerAndDiv.soundDiv.classList.add('playing');
      soundPress(playerAndDiv.soundDiv, playerAndDiv.player);
    }
  });

  document.addEventListener('keyup', (event) => {
    const playerIndex = keyMap.indexOf(event.code);
    const playerAndDiv = players[playerIndex];
    if (playerAndDiv) {
      keysPressed.delete(event.code);
      playerAndDiv.soundDiv.classList.remove('playing');
    }
  });
}

function stopAll() {
  players.forEach(({player, soundDiv}) => {
    player.pause();
    player.currentTime = 0;
    soundDiv.classList.remove('playing');
  });
  // Clear the set of all currently pressed keys
  keysPressed.clear();
}
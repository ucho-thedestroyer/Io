const video        = document.getElementById('myVideo');
const muteBtn      = document.getElementById('muteToggleBtn');
const crtWrap      = document.getElementById('crtWrap');
const tvOffOverlay = document.getElementById('tvOffOverlay');
const effectSlider1 = document.getElementById('effectSlider1');
const effectSlider2 = document.getElementById('effectSlider2');
const channelKnob  = document.getElementById('channelKnob');
const channelNumber = document.getElementById('channelNumber');
const turnOffLink  = document.getElementById('turnOffLink');

/* ── a) WHITE NOISE AUDIO ─────────────────────
   Replace the src with your actual .mp3 path.
   The Audio element is created in JS so there's
   no extra HTML needed.                         */
const whiteNoise = new Audio('docs/tv/whitenoise.mp3');
whiteNoise.loop  = true;
whiteNoise.volume = 0.4;   // tweak to taste

let noSignal = false; // tracks whether we're in "no signal" mode

function startWhiteNoise() {
  if (noSignal) return;
  noSignal = true;
  video.pause();
  // Show a black screen while white noise plays
  video.style.visibility = 'hidden';
  whiteNoise.muted = video.muted; // honour the user's mute preference
  whiteNoise.play().catch(() => {}); // autoplay guard
}

function stopWhiteNoise() {
  if (!noSignal) return;
  noSignal = false;
  video.style.visibility = '';
  whiteNoise.pause();
  whiteNoise.currentTime = 0;
}

/* Keep white-noise mute in sync with the video mute button */
muteBtn.addEventListener('click', () => {
  video.muted = !video.muted;
  whiteNoise.muted = video.muted;
  muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
});

/* ── b) 6 CHANNELS ────────────────────────────
   Slots with an empty string "" or a URL that
   fails to load will automatically trigger white
   noise. Fill in your real video URLs below.    */
let currentChannel = 1;
const channels = [
  "https://bafybeidkkrpovww5chuu3qd53njgfujg2hkibzbceeyeac4dkgbb3ggvgq.ipfs.w3s.link/Freak%20Analog%20Textures3%20by%20easterntraveler.mp4",
  "https://example.com/video2.mp4",     // ch 2
  "https://example.com/video3.mp4",     // ch 3
  "https://example.com/video4.mp4",     // ch 4
  "",                                    // ch 5 — intentional empty → white noise
  ""                                     // ch 6 — intentional empty → white noise
];

/* Knob detent angles for 6 channels (-90 … +90 spread evenly) */
const detentAngles = [-90, -54, -18, 18, 54, 90];

/* ── c) VIDEO OPTIMISATIONS ──────────────────── */

// 1. Hint the browser this is a streaming resource
video.preload = 'auto';

// 2. Guard against calling play() while already playing / loading
let playPending = false;

function safePlay() {
  if (playPending) return;
  playPending = true;
  video.play()
    .then(() => { playPending = false; })
    .catch((err) => {
      playPending = false;
      console.warn('play() blocked:', err.name);
    });
}

// 3. Initial autoplay (muted for browser policy)
video.muted = true;
video.setAttribute('muted', '');

if (video.readyState >= 2) {
  safePlay();
} else {
  video.addEventListener('canplay', safePlay, { once: true });
}

// 4. Handle broken / missing video URLs → white noise
video.addEventListener('error', () => {
  console.warn('Video error on ch', currentChannel, '— switching to white noise');
  startWhiteNoise();
});

// 5. Pause video when the tab is hidden; resume when visible
//    (saves CPU/bandwidth when user switches tabs)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    video.pause();
    if (noSignal) whiteNoise.pause();
  } else {
    if (!noSignal) safePlay();
    else whiteNoise.play().catch(() => {});
  }
});

/* ── FILTER SLIDERS (unchanged) ──────────────── */
function updateFilters() {
  const val1 = parseInt(effectSlider1.value);
  const val2 = parseInt(effectSlider2.value);
  const grayscale      = Math.min(val1, 33) / 10;
  const sepia          = Math.max(0, Math.min(val1 - 33, 33)) / 10;
  const blur           = Math.min(val2, 33) / 5;
  const brightnessExtra = 1 + (Math.max(0, Math.min(val2 - 33, 33)) / 50);
  const contrastExtra  = 1 + (Math.max(0, val2 - 66) / 50);
  video.style.filter = `
    saturate(1.5) contrast(1.4) brightness(1.1)
    grayscale(${grayscale})
    sepia(${sepia})
    blur(${blur}px)
    brightness(${brightnessExtra})
    contrast(${contrastExtra})
  `;
}
effectSlider1.addEventListener('input', updateFilters);
effectSlider2.addEventListener('input', updateFilters);

/* ── CHANNEL SWITCHING ────────────────────────── */
function setChannelSrc(idx) {
  if (idx < 1 || idx > channels.length) return;
  const src = channels[idx - 1];
  currentChannel = idx;

  if (!src) {
    // Empty slot → white noise immediately
    startWhiteNoise();
    return;
  }

  // Valid URL — stop white noise and load video
  stopWhiteNoise();
  video.src = src;
  video.load();
  safePlay();
}

function setKnobAngle(angle) {
  channelKnob.style.transform = `rotate(${angle}deg)`;
}

function switchChannelTo(targetChannel) {
  if (targetChannel < 1 || targetChannel > channels.length || targetChannel === currentChannel) return;
  runFlicker(500);
  setTimeout(() => {
    setChannelSrc(targetChannel);
    setKnobAngle(detentAngles[targetChannel - 1]);
    channelNumber.textContent = `channel ${targetChannel}`;
  }, 200);
}

function nextChannel() {
  let next = currentChannel + 1;
  if (next > channels.length) next = 1;
  switchChannelTo(next);
}

channelKnob.addEventListener('click', () => { nextChannel(); });

/* ── FLICKER / NOISE (unchanged) ─────────────── */
function runFlicker(duration = 700) {
  const noise = document.getElementById('noiseOverlay');
  if (!noise) return;
  noise.style.opacity = 1;
  setTimeout(() => { noise.style.opacity = 0.35; }, duration);
}

/* ── POWER OFF (unchanged) ───────────────────── */
document.getElementById('hotspot-power').addEventListener('click', () => {
  document.querySelector('.crt-inner').style.animation = 'crt-collapse 900ms ease-in forwards';
  tvOffOverlay.style.opacity = 1;
  tvOffOverlay.style.transition = 'opacity 900ms linear';
  runFlicker(700);
  setTimeout(() => { window.location.href = 'https://thesenoises.online'; }, 950);
});

/* ── RANDOM FLICKER (unchanged) ──────────────── */
function randomFlicker() {
  if (Math.random() < 0.35) runFlicker(Math.random() * 400 + 200);
}
setInterval(randomFlicker, 1500);

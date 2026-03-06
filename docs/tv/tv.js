 /* ─────────────────────────────────────────────
   tv.js
   ───────────────────────────────────────────── */

const video         = document.getElementById('myVideo');
const muteBtn       = document.getElementById('muteToggleBtn');
const crtWrap       = document.getElementById('crtWrap');
const tvOffOverlay  = document.getElementById('tvOffOverlay');
const effectSlider1 = document.getElementById('effectSlider1');
const effectSlider2 = document.getElementById('effectSlider2');
const channelKnob   = document.getElementById('channelKnob');
const channelNumber = document.getElementById('channelNumber');
const turnOffLink   = document.getElementById('turnOffLink');

/* ── WHITE NOISE AUDIO ───────────────────────── */
const whiteNoise = new Audio('https://raw.githubusercontent.com/ucho-thedestroyer/Io/Backup/docs/tv/whitenoise.mp3');
whiteNoise.loop   = true;
whiteNoise.volume = 0.4;

let noSignal = false;

function startWhiteNoise() {
  if (noSignal) return;
  noSignal = true;
  video.pause();
  video.style.visibility = 'hidden';
  whiteNoise.muted = video.muted;
  whiteNoise.play().catch(() => {});
}

function stopWhiteNoise() {
  if (!noSignal) return;
  noSignal = false;
  video.style.visibility = '';
  whiteNoise.pause();
  whiteNoise.currentTime = 0;
}

muteBtn.addEventListener('click', () => {
  video.muted = !video.muted;
  whiteNoise.muted = video.muted;
  muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
});

/* ── CHANNELS ────────────────────────────────── */
let currentChannel = 1;

const channels = [
  "https://bafybeidkkrpovww5chuu3qd53njgfujg2hkibzbceeyeac4dkgbb3ggvgq.ipfs.w3s.link/Freak%20Analog%20Textures3%20by%20easterntraveler.mp4",
  "https://example.com/video2.mp4",    // ch 2  ← roll effect
  "https://example.com/video3.mp4",    // ch 3
  "https://example.com/video4.mp4",    // ch 4
  "",                                   // ch 5  ← roll effect + white noise
  ""                                    // ch 6
];

/* Channels that get the roll effect (1-based) */
const ROLL_CHANNELS = [2, 5];

const detentAngles = [-90, -54, -18, 18, 54, 90];

/* ── ROLL EFFECT ─────────────────────────────────────────────────────
   How it works:
   - A .tv-roller div (200% tall) wraps two stacked copies of the video.
   - @keyframes tv-roll scrolls it from 0 → -50%, creating an infinite
     seamless vertical loop.  One full loop = one "roll".
   - Speed = animationDuration:
       slider  0  →  60s   (one roll per minute — practically invisible)
       slider 100 →  0.3s  (frantic, ~3 rolls/sec)
     Exponential curve so the bottom of the range feels gradual.
   - Active ONLY on channels in ROLL_CHANNELS; fully torn down on others.
   ─────────────────────────────────────────────────────────────────── */

(function injectRollStyles() {
  const s = document.createElement('style');
  s.textContent = `
    /* Roller sits exactly over the CRT surface, clipping handled by parent overflow:hidden */
    .tv-roller {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 200%;
      will-change: transform;
      animation-name: tv-roll;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      /* duration set inline via setRollSpeed() */
    }
    @keyframes tv-roll {
      from { transform: translate3d(0, 0, 0); }
      to   { transform: translate3d(0, -50%, 0); }
    }
    /* Each video half fills 50% of the 200%-tall roller */
    .tv-roller > video {
      position: absolute;
      width: 100%;
      height: 50%;
      object-fit: cover;
      left: 0;
      top: 0;
    }
    .tv-roller > video + video {
      top: 50%;
    }
  `;
  document.head.appendChild(s);
})();

let rollerDiv  = null;
let videoClone = null;
let rollActive = false;

/* Exponential map: 0 → 60s, 100 → 0.3s */
function rollValueToDuration(v) {
  if (v <= 0) return 60;
  const minD = 0.3, maxD = 60;
  return maxD * Math.pow(minD / maxD, v / 100);
}

function syncClone() {
  if (!videoClone || !rollActive) return;
  /* Keep clone within half a second of main video for seamless loop */
  if (Math.abs(videoClone.currentTime - video.currentTime) > 0.5) {
    videoClone.currentTime = video.currentTime;
  }
  videoClone.muted = true;
}

function enableRoll(speedValue) {
  if (rollActive) {
    setRollSpeed(speedValue);
    return;
  }
  rollActive = true;

  const surface = video.parentElement; // .crt-tv-surface

  rollerDiv = document.createElement('div');
  rollerDiv.classList.add('tv-roller');

  /* Move the real video inside the roller */
  surface.insertBefore(rollerDiv, video);
  rollerDiv.appendChild(video);

  /* Duplicate for the seamless bottom half */
  videoClone = video.cloneNode(false); // cloneNode(false) = no child <source> needed, src is direct
  videoClone.src     = video.src || video.currentSrc;
  videoClone.muted   = true;
  videoClone.autoplay = true;
  videoClone.loop    = true;
  videoClone.currentTime = video.currentTime;
  rollerDiv.appendChild(videoClone);
  videoClone.play().catch(() => {});

  video.addEventListener('timeupdate', syncClone);

  setRollSpeed(speedValue);
}

function setRollSpeed(v) {
  if (!rollerDiv) return;
  rollerDiv.style.animationDuration = `${rollValueToDuration(v)}s`;
}

function disableRoll() {
  if (!rollActive) return;
  rollActive = false;

  video.removeEventListener('timeupdate', syncClone);

  if (rollerDiv) {
    const surface = rollerDiv.parentElement;
    /* Restore the real video to its original place before removing the roller */
    surface.insertBefore(video, rollerDiv);
    surface.removeChild(rollerDiv);
    rollerDiv  = null;
    videoClone = null;
  }
}

/* ── ROLL SLIDER ─────────────────────────────────────────────────────
   In tv.html, add inside #controlsWrapper:

     <label for="rollSlider">Roll</label>
     <input type="range" id="rollSlider" min="0" max="100" value="0">

   The slider is always rendered; it only has a visible effect on
   channels 2 and 5 (ROLL_CHANNELS).
   ─────────────────────────────────────────────────────────────────── */
const rollSlider = document.getElementById('rollSlider');

if (rollSlider) {
  rollSlider.addEventListener('input', () => {
    if (ROLL_CHANNELS.includes(currentChannel)) {
      setRollSpeed(parseInt(rollSlider.value));
    }
  });
}

/* ── VIDEO OPTIMISATIONS ─────────────────────── */
video.preload = 'auto';

let playPending = false;
function safePlay() {
  if (playPending) return;
  playPending = true;
  video.play()
    .then(() => { playPending = false; })
    .catch((err) => { playPending = false; console.warn('play() blocked:', err.name); });
}

video.muted = true;
video.setAttribute('muted', '');

if (video.readyState >= 2) {
  safePlay();
} else {
  video.addEventListener('canplay', safePlay, { once: true });
}

video.addEventListener('error', () => {
  console.warn('Video error on ch', currentChannel, '— switching to white noise');
  startWhiteNoise();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    video.pause();
    if (videoClone) videoClone.pause();
    if (noSignal)   whiteNoise.pause();
  } else {
    if (!noSignal) safePlay();
    else whiteNoise.play().catch(() => {});
    if (videoClone) videoClone.play().catch(() => {});
  }
});

/* ── FILTER SLIDERS ──────────────────────────── */
function updateFilters() {
  const val1 = parseInt(effectSlider1.value);
  const val2 = parseInt(effectSlider2.value);
  const grayscale       = Math.min(val1, 33) / 10;
  const sepia           = Math.max(0, Math.min(val1 - 33, 33)) / 10;
  const blur            = Math.min(val2, 33) / 5;
  const brightnessExtra = 1 + (Math.max(0, Math.min(val2 - 33, 33)) / 50);
  const contrastExtra   = 1 + (Math.max(0, val2 - 66) / 50);
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

/* ── CHANNEL SWITCHING ───────────────────────── */
function applyRollForChannel(ch) {
  if (ROLL_CHANNELS.includes(ch)) {
    const speed = rollSlider ? parseInt(rollSlider.value) : 0;
    enableRoll(speed);
  } else {
    disableRoll();
  }
}

function setChannelSrc(idx) {
  if (idx < 1 || idx > channels.length) return;
  const src = channels[idx - 1];
  currentChannel = idx;

  /* Apply or remove roll before touching video src */
  applyRollForChannel(idx);

  if (!src) {
    startWhiteNoise();
    return;
  }

  stopWhiteNoise();
  video.src = src;
  video.load();
  safePlay();

  /* If rolling, sync the clone to the new source too */
  if (rollActive && videoClone) {
    videoClone.src = src;
    videoClone.load();
    videoClone.muted = true;
    videoClone.play().catch(() => {});
  }
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

/* ── FLICKER ─────────────────────────────────── */
function runFlicker(duration = 700) {
  const noise = document.getElementById('noiseOverlay');
  if (!noise) return;
  noise.style.opacity = 1;
  setTimeout(() => { noise.style.opacity = 0.35; }, duration);
}

/* ── POWER OFF ───────────────────────────────── */
document.getElementById('hotspot-power').addEventListener('click', () => {
  document.querySelector('.crt-inner').style.animation = 'crt-collapse 900ms ease-in forwards';
  tvOffOverlay.style.opacity    = 1;
  tvOffOverlay.style.transition = 'opacity 900ms linear';
  runFlicker(700);
  setTimeout(() => { window.location.href = 'https://thesenoises.online'; }, 950);
});

/* ── RANDOM FLICKER ──────────────────────────── */
function randomFlicker() {
  if (Math.random() < 0.35) runFlicker(Math.random() * 400 + 200);
}
setInterval(randomFlicker, 1500);

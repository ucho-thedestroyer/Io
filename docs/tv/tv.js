/* JS mostly unchanged — only ensures overlay references match new IDs */
const video = document.getElementById('myVideo');
const muteBtn = document.getElementById('muteToggleBtn');
const crtWrap = document.getElementById('crtWrap');
const tvOffOverlay = document.getElementById('tvOffOverlay');

const effectSlider1 = document.getElementById('effectSlider1');
const effectSlider2 = document.getElementById('effectSlider2');

const channelKnob = document.getElementById('channelKnob');
const channelNumber = document.getElementById('channelNumber');
const turnOffLink = document.getElementById('turnOffLink');

let currentChannel = 1;
const channels = [
  "https://bafybeidkkrpovww5chuu3qd53njgfujg2hkibzbceeyeac4dkgbb3ggvgq.ipfs.w3s.link/Freak%20Analog%20Textures3%20by%20easterntraveler.mp4",
  "https://example.com/video2.mp4",
  "https://example.com/video3.mp4",
  "https://example.com/video4.mp4"
];
const detentAngles = [-90, -30, 30, 90];

// autoplay safety
video.muted = true;
video.setAttribute('muted', '');

const tryPlay = () => {
  video.play().then(() => {
    console.log('✅ playing, muted:', video.muted, 'readyState:', video.readyState);
  }).catch((err) => {
    console.error('❌ play failed:', err.name, err.message);
  });
};

if (video.readyState >= 2) {
  tryPlay();
} else {
  video.addEventListener('canplay', tryPlay, { once: true });
}

muteBtn.addEventListener('click', () => {
  video.muted = !video.muted;
  muteBtn.textContent = video.muted ? 'Unmute' : 'Mute';
});

function updateFilters() {
  const val1 = parseInt(effectSlider1.value);
  const val2 = parseInt(effectSlider2.value);

  const grayscale = Math.min(val1, 33) / 10;
  const sepia = Math.max(0, Math.min(val1 - 33, 33)) / 10;
  const blur = Math.min(val2, 33) / 5;
  const brightnessExtra = 1 + (Math.max(0, Math.min(val2 - 33, 33)) / 50);
  const contrastExtra = 1 + (Math.max(0, val2 - 66) / 50);

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

function setChannelSrc(idx){
  if(idx < 1 || idx > channels.length) return;
  video.src = channels[idx-1];
  video.load();
  video.play().catch(()=>{});
  currentChannel = idx;
}
function setKnobAngle(angle){ channelKnob.style.transform = `rotate(${angle}deg)`; }
function switchChannelTo(targetChannel){
  if(targetChannel<1||targetChannel>channels.length||targetChannel===currentChannel) return;
  runFlicker(500);
  setTimeout(()=>{
    setChannelSrc(targetChannel);
    setKnobAngle(detentAngles[targetChannel-1]);
    channelNumber.textContent = `channel ${targetChannel}`;
  },200);
}
function nextChannel(){ let next=currentChannel+1;if(next>channels.length) next=1;switchChannelTo(next); }
channelKnob.addEventListener('click',()=>{ nextChannel(); });

function runFlicker(duration=700){
  const noise = document.getElementById('noiseOverlay');
  if(!noise) return;
  noise.style.opacity = 1;
  setTimeout(()=>{ noise.style.opacity = 0.35; }, duration);
}

document.getElementById("hotspot-power").addEventListener("click", ()=>{
  document.querySelector('.crt-inner').style.animation='crt-collapse 900ms ease-in forwards';
  tvOffOverlay.style.opacity=1;
  tvOffOverlay.style.transition='opacity 900ms linear';
  runFlicker(700);
  setTimeout(()=>{ window.location.href="https://thesenoises.online"; },950);
});

function randomFlicker(){
  if(Math.random()<0.35) runFlicker(Math.random()*400+200);
}
setInterval(randomFlicker,1500);

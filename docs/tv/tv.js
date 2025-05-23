const video = document.getElementById('myVideo');
const button = document.getElementById('muteToggleBtn');
const slider = document.getElementById('volumeSlider');
const effectSlider1 = document.getElementById('effectSlider1');
const effectSlider2 = document.getElementById('effectSlider2');

// Mute toggle button
button.addEventListener('click', () => {
  video.muted = !video.muted;
  button.textContent = video.muted ? 'Unmute' : 'Mute';
});

// Volume control
slider.addEventListener('input', () => {
  video.volume = slider.value;
});

// Filter effect updates
function updateFilters() {
  const val1 = parseInt(effectSlider1.value);
  const val2 = parseInt(effectSlider2.value);

  const grayscale = Math.min(val1, 30) / 30;
  const sepia = Math.max(0, Math.min(val1 - 30, 30)) / 30;
  const hue = Math.max(0, val1 - 60) * 3.6;

  const blur = Math.min(val2, 33) / 10;
  const brightness = 1 + (Math.max(0, Math.min(val2 - 33, 33)) / 100);
  const contrast = 1 + (Math.max(0, val2 - 66) / 100);

  video.style.filter = `
    grayscale(${grayscale})
    sepia(${sepia})
    hue-rotate(${hue}deg)
    blur(${blur}px)
    brightness(${brightness})
    contrast(${contrast})
  `;
}

effectSlider1.addEventListener('input', updateFilters);
effectSlider2.addEventListener('input', updateFilters);

const video = document.getElementById('myVideo');
const button = document.getElementById('muteToggleBtn');
const slider = document.getElementById('volumeSlider');
const effectSlider1 = document.getElementById('effectSlider1');
const effectSlider2 = document.getElementById('effectSlider2');

// Ensure video starts muted and volume is set to slider value
document.addEventListener('DOMContentLoaded', () => {
  video.volume = slider.value / 100;
  video.muted = true;
  button.textContent = 'Unmute';

  // Enable volume control after first user interaction
  document.body.addEventListener('click', enableVolumeControl, { once: true });
});

// Enable volume control
function enableVolumeControl() {
  slider.addEventListener('input', () => {
    video.muted = false;
    video.volume = slider.value / 100;
    button.textContent = 'Mute';
  });
}

// Mute toggle button
button.addEventListener('click', () => {
  video.muted = !video.muted;
  button.textContent = video.muted ? 'Unmute' : 'Mute';
});

// Visual effect updates
function updateFilters() {
  const val1 = parseInt(effectSlider1.value);
  const val2 = parseInt(effectSlider2.value);

  const grayscale = Math.min(val1, 33) / 10;
  const sepia = Math.max(0, Math.min(val1 - 33, 33)) / 10;

  const blur = Math.min(val2, 33) / 5;
  const brightness = 1 + (Math.max(0, Math.min(val2 - 33, 33)) / 50);
  const contrast = 1 + (Math.max(0, val2 - 66) / 50);

  video.style.filter = `
    grayscale(${grayscale})
    sepia(${sepia})
    blur(${blur}px)
    brightness(${brightness})
    contrast(${contrast})
  `;
}

effectSlider1.addEventListener('input', updateFilters);
effectSlider2.addEventListener('input', updateFilters);

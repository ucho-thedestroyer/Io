
  const video = document.getElementById('myVideo');
  const button = document.getElementById('muteToggleBtn');

  button.addEventListener('click', () => {
    video.muted = !video.muted;
    button.textContent = video.muted ? 'Unmute' : 'Mute';
  });

  const slider = document.getElementById('volumeSlider');
  slider.addEventListener('input', () => {
    video.volume = slider.value;
  });

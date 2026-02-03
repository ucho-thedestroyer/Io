if (volumeSlider && audioPlayer) {
  volumeSlider.value = Math.round((audioPlayer.volume || 1) * 100);
  
  // Update CSS variable for visual fill
  volumeSlider.style.setProperty('--volume-percent', volumeSlider.value + '%');
  
  volumeSlider.addEventListener("input", () => {
    audioPlayer.volume = Math.max(0, Math.min(1, volumeSlider.value / 100));
    // Update the fill percentage
    volumeSlider.style.setProperty('--volume-percent', volumeSlider.value + '%');
  });
}

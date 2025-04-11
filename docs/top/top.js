const progress = document.getElementById("progress");
const song = document.getElementById("song");
const controlIcon = document.getElementById("controlIcon");
const playPauseButton = document.querySelector(".play-pause-btn");
const nextButton = document.querySelector(".controls button.forward");
const prevButton = document.querySelector(".controls button.backward");
const songName = document.querySelector(".music-player h1");
const artistName = document.querySelector(".music-player p");

const songs = [ /* your songs array here */ ];

let currentSongIndex = 3;
let isShuffle = false;

function updateSongInfo() {
  const fileName = songs[currentSongIndex].source.split('/').pop().replace('.mp3', '');
  const formattedTitle = fileName.replace(/-/g,

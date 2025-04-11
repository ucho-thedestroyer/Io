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
  const formattedTitle = fileName.replace(/-/g, ' ');
  songName.textContent = formattedTitle;
  song.src = songs[currentSongIndex].source;

  document.getElementById("albumCover").src = songs[currentSongIndex].cover;

  song.addEventListener("loadedmetadata", () => {
    const totalSeconds = Math.floor(song.duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    artistName.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    progress.max = song.duration;
    progress.value = song.currentTime;
  });
}

function preloadAndPlay(url, title = "Unknown Title", cover = "") {
  song.src = url;
  songName.textContent = title;
  artistName.textContent = "Loading...";

  if (cover) {
    document.getElementById("albumCover").src = cover;
  }

  song.addEventListener("loadedmetadata", () => {
    const totalSeconds = Math.floor(song.duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    artistName.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    progress.max = song.duration;
    progress.value = song.currentTime;
  });

  song.load();
  playSong();
}

window.addEventListener("DOMContentLoaded", () => {
  preloadAndPlay(
    "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Daft-Punk-Instant-Crush.mp3",
    "Instant Crush",
    "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/top/covers/IMG_0510.jpeg"
  );
});

song.addEventListener("timeupdate", () => {
  if (!song.paused) {
    progress.value = song.currentTime;
  }
});

song.addEventListener("loadedmetadata", () => {
  progress.max = song.duration;
  progress.value = song.currentTime;
});

song.addEventListener("ended", () => {
  if (isShuffle) {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * songs.length);
    } while (newIndex === currentSongIndex && songs.length > 1);
    currentSongIndex = newIndex;
  } else {
    currentSongIndex = (swiper.activeIndex + 1) % songs.length;
  }
  updateSongInfo();
  swiper.slideTo(currentSongIndex);
  playSong();
});

function pauseSong() {
  song.pause();
  controlIcon.classList.remove("fa-pause");
  controlIcon.classList.add("fa-play");
}

function playSong() {
  song.play();
  controlIcon.classList.add("fa-pause");
  controlIcon.classList.remove("fa-play");
}

function playPause() {
  if (song.paused) {
    playSong();
  } else {
    pauseSong();
  }
}

playPauseButton.addEventListener("click", playPause);

progress.addEventListener("input", () => {
  song.currentTime = progress.value;
});

progress.addEventListener("change", () => {
  playSong();
});

nextButton.addEventListener("click", () => {
  if (isShuffle) {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * songs.length);
    } while (newIndex === currentSongIndex && songs.length > 1);
    currentSongIndex = newIndex;
  } else {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
  }
  updateSongInfo();
  playPause();
});

prevButton.addEventListener("click", () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  updateSongInfo();
  playPause();
});

document.getElementById("volumeSlider").addEventListener("input", (e) => {
  song.volume = e.target.value;
});

document.getElementById("shuffleBtn").addEventListener("click", () => {
  isShuffle = !isShuffle;
  const shuffleBtn = document.getElementById("shuffleBtn");
  shuffleBtn.textContent = isShuffle ? "🔀 Shuffle: ON" : "🔀 Shuffle";
  shuffleBtn.style.backgroundColor = isShuffle ? "#007bff" : "#333";
});

updateSongInfo();

var swiper = new Swiper(".swiper", {
  effect: "coverflow",
  centeredSlides: true,
  initialSlide: 3,
  slidesPerView: "auto",
  grabCursor: true,
  spaceBetween: 40,
  coverflowEffect: {
    rotate: 25,
    stretch: 0,
    depth: 50,
    modifier: 1,
    slideShadows: false,
  },
  navigation: {
    nextEl: ".forward",
    prevEl: ".backward",
  },
});

swiper.on("slideChange", () => {
  currentSongIndex = swiper.activeIndex;
  updateSongInfo();
  playPause();
});

function normalize(str) {
  return str.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
}

function getSongUrlFromTitle(title) {
  const normalizedTitle = normalize(title);
  for (let song of songs) {
    const fileName = song.source.split("/").pop().replace(/\.[^/.]+$/, "");
    const normalizedFileTitle = normalize(fileName);
    if (normalizedFileTitle.includes(normalizedTitle) || normalizedTitle.includes(normalizedFileTitle)) {
      return {
        url: song.source,
        cover: song.cover || "",
        title: fileName.replace(/[-_]/g, ' '),
      };
    }
  }
  return null;
}

function loadAndPlayTrack(title) {
  const songInfo = getSongUrlFromTitle(title);
  if (songInfo) {
    preloadAndPlay(songInfo.url, songInfo.title, songInfo.cover);
  } else {
    alert(`Sorry, the track "${title}" isn't available.`);
  }
}

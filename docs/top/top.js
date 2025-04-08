const progress = document.getElementById("progress");
const song = document.getElementById("song");
const controlIcon = document.getElementById("controlIcon");
const playPauseButton = document.querySelector(".play-pause-btn");
const nextButton = document.querySelector(".controls button.forward");
const prevButton = document.querySelector(".controls button.backward");
const songName = document.querySelector(".music-player h1");
const artistName = document.querySelector(".music-player p");

const songs = [
  {
    source: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/camp/Star_Wars_original_opening_crawl_1977.ogg",
    cover: "https://path/to/star-wars-cover.jpg"
  },
  {
    source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Pawn-It-All.mp3",
    cover: "https://path/to/pawn-it-all-cover.jpg"
  },
  {
    source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Madrigal-Seni-Dert-Etmeler.mp3",
    cover: "https://path/to/madrigal-cover.jpg"
  },
  {
    source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Daft-Punk-Instant-Crush.mp3",
    cover: "https://path/to/daft-punk-cover.jpg"
  },
  {
    source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Harry-Styles-As-It-Was.mp3",
    cover: "https://path/to/harry-styles-cover.jpg"
  },
  {
    source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Dua-Lipa-Physical.mp3",
    cover: "https://path/to/dua-lipa-cover.jpg"
  },
  {
    source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Taylor-Swift-Delicate.mp3",
    cover: "https://path/to/taylor-swift-cover.jpg"
  }
];

let currentSongIndex = 3;

function updateSongInfo() {
  const fileName = songs[currentSongIndex].source.split('/').pop().replace('.mp3', '');
  const formattedTitle = fileName.replace(/-/g, ' ');
  songName.textContent = formattedTitle;
  song.src = songs[currentSongIndex].source;

  song.addEventListener("loadedmetadata", () => {
    const totalSeconds = Math.floor(song.duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    artistName.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    progress.max = song.duration;
    progress.value = song.currentTime;
  });
}

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
  currentSongIndex = (swiper.activeIndex + 1) % songs.length;
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
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  updateSongInfo();
  playPause();
});

prevButton.addEventListener("click", () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  updateSongInfo();
  playPause();
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

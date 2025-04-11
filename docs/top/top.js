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
    title: "Star Wars original opening crawl 1977",
    source: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/camp/Star_Wars_original_opening_crawl_1977.ogg",
    cover: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/top/covers/IMG_0510.jpeg"
  },
  {
    title: "Pawn It All",
    source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Pawn-It-All.mp3",
    cover: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/top/covers/IMG_0511.jpeg"
  },
  {
    title: "Madrigal Seni Dert Etmeler",
    source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Madrigal-Seni-Dert-Etmeler.mp3",
    cover: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/top/covers/IMG_0512.jpeg"
  },
  {
    title: "Daft Punk Instant Crush",
    source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Daft-Punk-Instant-Crush.mp3",
    cover: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/top/covers/IMG_0510.jpeg"
  },
  {
    title: "Harry Styles As It Was",
    source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Harry-Styles-As-It-Was.mp3",
    cover: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/top/covers/IMG_0511.jpeg"
  },
  {
    title: "Dua Lipa Physical",
    source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Dua-Lipa-Physical.mp3",
    cover: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/top/covers/IMG_0512.jpeg"
  },
  {
    title: "Taylor Swift Delicate",
    source: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Taylor-Swift-Delicate.mp3",
    cover: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/top/covers/IMG_0510.jpeg"
  }
];

let currentSongIndex = 3;

function updateSongInfo() {
  const fileName = songs[currentSongIndex].source.split('/').pop().replace('.mp3', '');
  const formattedTitle = fileName.replace(/-/g, ' ');
  songName.textContent = formattedTitle;
  song.src = songs[currentSongIndex].source;

  // Update album cover
  const albumCover = document.getElementById("albumCover");
  albumCover.src = songs[currentSongIndex].cover;

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

  song.load(); // preload
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


const trackData = {
  album1: [
    { number: 1, title: "Cuckoo Clocks Of Hell" },
    { number: 2, title: "Spokes for the Wheel of Torment" },
    { number: 3, title: "The Last Ride of the Bozomobile" }
  ],
  album2: [
    { number: 1, title: "Colma" },
    { number: 2, title: "For Mom" },
    { number: 3, title: "Ghost" }
  ]
};

let currentAlbumTracks = []; // holds the currently loaded album's track list


function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '')  // Remove all non-alphanumeric characters
    .trim();
}

function getSongUrlFromTitle(title) {
  const normalizedTitle = normalize(title);
  const match = songs.find(song => normalize(song.title) === normalizedTitle);
  return match ? match.source : null;
}


function loadAndPlayTrack(title) {
  const url = getSongUrlFromTitle(title);

  if (!url) {
    alert(`Sorry, the track "${title}" isn't available.`);
    return;
  }

  song.src = url;
  songName.textContent = title;
  artistName.textContent = "Loading...";

  const match = songs.find((s) => s.title.toLowerCase() === title.toLowerCase());
  if (match && match.cover) {
    document.getElementById("albumCover").src = match.cover;
  }

  song.addEventListener("loadedmetadata", () => {
    const totalSeconds = Math.floor(song.duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    artistName.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    progress.max = song.duration;
    progress.value = song.currentTime;
  });

  playSong();
}


function renderTrackList(container, tracks) {
  const table = document.createElement("table");
  table.setAttribute("width", "100%");
  table.setAttribute("cellspacing", "0");
  table.setAttribute("cellpadding", "0");
  table.setAttribute("align", "center");

  tracks.forEach((track, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="track-cell" width="10%">
        <div class="tracknumber">
          <span class="track-label">Track</span>
          <span class="track-id">#${track.number}</span>
        </div>
      </td>
      <td class="track-cell" width="35%">
        <div class="trackname">${track.title}</div>
      </td>
      <td class="track-cell" width="5%">
        <div class="sendtrack">
          <button class="play-btn" title="Play" data-title="${track.title}">
            <i class="fa fa-play"></i>
          </button>
        </div>
      </td>
    `;

    table.appendChild(row);

    const divider = document.createElement("tr");
    divider.innerHTML = `<td colspan="5" class="divider"></td>`;
    table.appendChild(divider);
  });

  const filler = document.createElement("tr");
  filler.style.backgroundColor = "#EEEEEE";
  table.appendChild(filler);

  container.appendChild(table);

  // Add event listeners to each play button
  container.querySelectorAll(".play-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      const title = e.currentTarget.dataset.title;
      loadAndPlayTrack(title);
    });
  });
}


document.querySelectorAll(".album").forEach(album => {
  album.addEventListener("click", (e) => {
    e.preventDefault();
    const albumId = album.getAttribute("data-album-id");
    const trackContainer = document.getElementById("dynamic-tracklist");

    // Clear previous track list and load new one
    trackContainer.innerHTML = "";
    currentAlbumTracks = trackData[albumId] || [];

    if (currentAlbumTracks.length > 0) {
      renderTrackList(trackContainer, currentAlbumTracks);

      // Play the track with number 1 (our "album-single")
      const single = currentAlbumTracks.find(track => track.number === 1);
      if (single) {
        loadAndPlayTrack(single.title);
      }
    }
  });
});


// Render all tracklist elements on the page
document.querySelectorAll(".tracklist").forEach((el) => {
  const id = el.getAttribute("data-tracklist-id");
  if (trackData[id]) {
    renderTrackList(el, trackData[id]);
  }
});


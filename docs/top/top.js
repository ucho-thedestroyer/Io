const progress = document.getElementById("progress");
const song = document.getElementById("song");
const controlIcon = document.getElementById("controlIcon");
const playPauseButton = document.querySelector(".play-pause-btn");
const nextButton = document.querySelector(".controls button.forward");
const prevButton = document.querySelector(".controls button.backward");
const songName = document.querySelector(".music-player .playin h1.blocktitle");

const artistName = document.querySelector(".music-player p");

// const songs
// end

let currentSongIndex = 3;

function updateSongInfo() {
  const currentSong = songs[currentSongIndex];
  songName.textContent = currentSong.title;
  song.src = currentSong.source;

  // Update album cover
  const albumCover = document.getElementById("albumCover");
  albumCover.src = currentSong.cover;

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

// const trackData
// end

let currentAlbumTracks = []; // holds the currently loaded album's track list


function getSongUrlFromTitle(title) {
  const songMatch = songs.find(
    (song) => song.title.toLowerCase() === title.toLowerCase()
  );
  return songMatch ? songMatch.source : null;
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

// calling


// end call 
function loadSecondFile() {
  const script = document.createElement('script');
  script.src = 'js.js'; // Path to second JS file
  script.onload = function () {
    console.log('js.js loaded!');

    // ✅ This is where the constants from file2.js will be available
    console.log('songs:', firstConst);
    console.log('trackData:', secondConst);
  };
  script.onerror = function () {
    console.error('Failed to load file2.js');
  };

  document.head.appendChild(script);
}

// ✅ Call the function immediately so the file loads on page load
loadSecondFile();

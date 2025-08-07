function addToQueue(trackElement) {
  const title = trackElement.querySelector("h4").textContent;
  const meta = trackElement.querySelector("p").textContent;
  const desc = trackElement.querySelector(".desc").textContent;

  const queue = document.getElementById("queue");
  const li = document.createElement("li");
  li.className = "queue-item"; li.setAttribute("draggable", "true");
  li.innerHTML = \`
    <div>
      <strong>\${title}</strong><br/>
      <small>\${meta}</small><br/>
      <em>\${desc}</em>
    </div>
    <button class="remove-btn" onclick="removeFromQueue(this)">✖</button>
  \`;
  queue.appendChild(li);
}

function removeFromQueue(button) {
  const item = button.parentElement;
  item.remove();
}

function prevTrack() {
  alert("Previous track");
}

function playPause() {
  alert("Play/Pause toggle");
}

function nextTrack() {
  alert("Next track");
}

let currentTrackIndex = 0;
const tracks = [
  {
    title: "Space Boogie",
    file: "https://github.com/ucho-thedestroyer/Io/raw/Backup/top/space-boogie.mp3"
  },
  {
    title: "Neon Dreams",
    file: "https://github.com/ucho-thedestroyer/Io/raw/Backup/top/neon-dreams.mp3"
  }
];

function playTrack(index) {
  const player = document.getElementById("audio-player");
  const source = document.getElementById("audio-source");
  currentTrackIndex = index;
  source.src = tracks[index].file;
  player.load();
  player.play();
}

function playPause() {
  const player = document.getElementById("audio-player");
  if (player.paused) {
    player.play();
  } else {
    player.pause();
  }
}

function nextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  playTrack(currentTrackIndex);
}

function prevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  playTrack(currentTrackIndex);
}

// Autoplay next track when current one ends
document.addEventListener("DOMContentLoaded", function () {
  const player = document.getElementById("audio-player");
  player.addEventListener("ended", nextTrack);
});

function updateProgress() {
  const player = document.getElementById("audio-player");
  const progressBar = document.getElementById("progress-bar");
  if (player && progressBar) {
    const percent = (player.currentTime / player.duration) * 100;
    progressBar.style.width = percent + "%";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const player = document.getElementById("audio-player");
  player.addEventListener("ended", nextTrack);
  player.addEventListener("timeupdate", updateProgress);
});

// Allow clicking on queue item to play
document.addEventListener("click", function (e) {
  if (e.target.closest(".queue-item")) {
    const title = e.target.closest(".queue-item").querySelector("strong").textContent;
    const index = tracks.findIndex(t => t.title === title);
    if (index !== -1) playTrack(index);
  }
});

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function downloadCurrentTrack() {
  const current = tracks[currentTrackIndex];
  const a = document.createElement("a");
  a.href = current.file;
  a.download = current.title + ".mp3";
  a.click();
}

function shareCurrentTrack() {
  const current = tracks[currentTrackIndex];
  const dummy = document.createElement("input");
  const url = window.location.href + "#" + encodeURIComponent(current.title);
  document.body.appendChild(dummy);
  dummy.value = url;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
  alert("Track link copied!");
}

// Drag and drop reorder for queue
let dragSrcEl = null;

document.addEventListener("dragstart", function (e) {
  if (e.target.classList.contains("queue-item")) {
    dragSrcEl = e.target;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.innerHTML);
    e.target.classList.add("dragging");
  }
});

document.addEventListener("dragover", function (e) {
  if (e.preventDefault) e.preventDefault();
  return false;
});

document.addEventListener("drop", function (e) {
  if (e.stopPropagation) e.stopPropagation();
  if (dragSrcEl && e.target.closest(".queue-item") !== dragSrcEl) {
    const target = e.target.closest(".queue-item");
    dragSrcEl.innerHTML = target.innerHTML;
    target.innerHTML = e.dataTransfer.getData("text/html");
  }
  return false;
});

document.addEventListener("dragend", function (e) {
  if (e.target.classList.contains("queue-item")) {
    e.target.classList.remove("dragging");
  }
});

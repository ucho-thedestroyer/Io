// scr.js

// Track storage: title, length, genre, description, audio URL, cover URL
const tracksData = {
    "epilogue I": {
        src: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/tracks/epilogue I.m4a",
        cover: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/tracks/covers/IMG_0513.jpeg",
        length: "03:45",
        genre: "Synthwave"
    },
    "freak": {
        src: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/tracks/freaktextures3.mp4",
        cover: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/top/covers/IMG_0513.jpeg",
        length: "03:45",
        genre: "Synthwave"
    },
    "Neon Dreams": {
        src: "https://github.com/ucho-thedestroyer/Io/raw/Backup/top/neon-dreams.mp3",
        cover: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/top/covers/IMG_0514.jpeg",
        length: "04:10",
        genre: "Retro Pop"
    }
};

let queue = [];
let currentTrackIndex = -1;
let isPlaying = false;

const audioPlayer = document.getElementById("audio-player");
const audioSource = document.getElementById("audio-source");
const albumCover = document.querySelector(".album-cover");
const trackInfoSpan = document.querySelector(".track-info span strong");
const trackLengthSpan = document.querySelector(".track-length");
const progressBar = document.getElementById("progress-bar");
const volumeSlider = document.querySelector(".volume-slider");

// ================== ADD TO QUEUE ==================
function addToQueue(trackElement) {
    const trackTitle = trackElement.querySelector("h4").innerText.trim();
    if (!tracksData[trackTitle]) return;

    // Add to queue
    queue.push(trackTitle);

    // Create queue list item with clickable [X] for delete
    const li = document.createElement("li");
    li.textContent = trackTitle + " ";
    const delBtn = document.createElement("span");
    delBtn.textContent = " [X]";
    delBtn.style.color = "red";
    delBtn.style.cursor = "pointer";
    delBtn.onclick = () => removeFromQueue(trackTitle, li);
    li.appendChild(delBtn);
    document.getElementById("queue").appendChild(li);

    // If nothing is playing, load and start this track
    if (currentTrackIndex === -1) {
        currentTrackIndex = 0;
        loadTrack(currentTrackIndex);
        audioPlayer.play();
        isPlaying = true;
    }
}

// ================== REMOVE FROM QUEUE ==================
function removeFromQueue(title, element) {
    queue = queue.filter(t => t !== title);
    element.remove();

    // If queue becomes empty
    if (queue.length === 0) {
        audioPlayer.pause();
        currentTrackIndex = -1;
        isPlaying = false;
    }
}

// ================== LOAD TRACK ==================
function loadTrack(index) {
    const trackTitle = queue[index];
    if (!trackTitle) return;

    const data = tracksData[trackTitle];
    audioSource.src = data.src;
    audioPlayer.load();

    albumCover.src = data.cover;
    trackInfoSpan.textContent = trackTitle;
    trackLengthSpan.textContent = `00:00 / ${data.length}`;
}

// ================== PLAYER CONTROLS ==================
function playPause() {
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
    isPlaying = !isPlaying;
}

function prevTrack() {
    if (queue.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + queue.length) % queue.length;
    loadTrack(currentTrackIndex);
    audioPlayer.play();
    isPlaying = true;
}

function nextTrack() {
    if (queue.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % queue.length;
    loadTrack(currentTrackIndex);
    audioPlayer.play();
    isPlaying = true;
}

// ================== DOWNLOAD POPUP ==================
function downloadCurrentTrack() {
    if (currentTrackIndex === -1) {
        // Mini popup above the download button
        const downloadBtn = document.querySelector(".player-controls button:nth-child(2)");
        const popup = document.createElement("div");
        popup.textContent = "First choose a song!";
        popup.style.position = "absolute";
        popup.style.background = "#FF0000";
        popup.style.color = "white";
        popup.style.fontSize = "12px";
        popup.style.padding = "2px 5px";
        popup.style.borderRadius = "3px";
        popup.style.top = (downloadBtn.offsetTop - 20) + "px";
        popup.style.left = downloadBtn.offsetLeft + "px";
        popup.style.zIndex = "1000";
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.opacity = "0";
            popup.style.transition = "opacity 0.5s";
            setTimeout(() => popup.remove(), 500);
        }, 1000);
        return;
    }

    const trackTitle = queue[currentTrackIndex];
    const link = document.createElement("a");
    link.href = tracksData[trackTitle].src;
    link.download = `${trackTitle}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ================== SHARE POPUP ==================
function shareCurrentTrack() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const btn = document.querySelector(".player-controls button:nth-child(3)");
        const popup = document.createElement("div");
        popup.textContent = "link copied!";
        popup.style.position = "absolute";
        popup.style.background = "#0ff";
        popup.style.color = "black";
        popup.style.fontSize = "12px";
        popup.style.padding = "2px 5px";
        popup.style.borderRadius = "3px";
        popup.style.top = (btn.offsetTop - 20) + "px";
        popup.style.left = btn.offsetLeft + "px";
        popup.style.zIndex = "1000";
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.opacity = "0";
            popup.style.transition = "opacity 0.5s";
            setTimeout(() => popup.remove(), 500);
        }, 1000);
    });
}

// ================== PROGRESS & VOLUME ==================
audioPlayer.addEventListener("timeupdate", () => {
    if (audioPlayer.duration) {
        const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;

        const currentMinutes = Math.floor(audioPlayer.currentTime / 60);
        const currentSeconds = String(Math.floor(audioPlayer.currentTime % 60)).padStart(2, "0");
        trackLengthSpan.textContent = `${currentMinutes}:${currentSeconds} / ${tracksData[queue[currentTrackIndex]].length}`;
    }
});

volumeSlider.addEventListener("input", () => {
    audioPlayer.volume = volumeSlider.value / 100;
});

// Auto-play next track when current ends
audioPlayer.addEventListener("ended", () => {
    if (queue.length > 0) {
        nextTrack();
    }
});

// scr.js

// Track storage: title, length, genre, description, audio URL, cover URL
const tracksData = {
    "epilogue I": {
        src: "https://bafybeiheldjdvber6g2n76dloccumuhjgivebekqmvgxpchycunmlpg3ri.ipfs.w3s.link/epilogue%20Ia.m4a",
        cover: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/tracks/covers/IMG_0513.jpeg",
        length: "03:45",
        genre: "Synthwave"
    },
    "freak": {
        src: "https://bafybeidkkrpovww5chuu3qd53njgfujg2hkibzbceeyeac4dkgbb3ggvgq.ipfs.w3s.link/ipfs/bafybeidkkrpovww5chuu3qd53njgfujg2hkibzbceeyeac4dkgbb3ggvgq/Freak%20Analog%20Textures3%20by%20easterntraveler.mp4",
        cover: "https://github.com/ucho-thedestroyer/Io/raw/Backup/docs/top/covers/tunnel04.jpeg",
        length: "03:45",
        genre: "Synthwave"
    },
    "Neon Dreams": {
        src: "https://github.com/ecemgo/mini-samples-great-tricks/raw/main/song-list/Madrigal-Seni-Dert-Etmeler.mp3",
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
const downloadButton = document.getElementById("download-btn"); // Updated to select by ID

// ================== ADD TO QUEUE ==================
function addToQueue(trackElement) {
    const trackTitle = trackElement.querySelector("h4").innerText.trim();
    if (!tracksData[trackTitle]) return;

    queue.push(trackTitle);

    // Create queue item with [X] delete
    const li = document.createElement("li");
    li.textContent = trackTitle + " ";
    const delBtn = document.createElement("span");
    delBtn.textContent = "[X]";
    delBtn.style.color = "red";
    delBtn.style.cursor = "pointer";
    delBtn.onclick = () => removeFromQueue(trackTitle, li);
    li.appendChild(delBtn);
    document.getElementById("queue").appendChild(li);

    if (currentTrackIndex === -1) {
        currentTrackIndex = 0;
        preloadAndPlay(currentTrackIndex);
    }

    updateDownloadButtonState();
}

// ================== REMOVE FROM QUEUE ==================
function removeFromQueue(title, element) {
    queue = queue.filter(t => t !== title);
    element.remove();

    if (queue.length === 0) {
        audioPlayer.pause();
        currentTrackIndex = -1;
        isPlaying = false;
    } else if (currentTrackIndex >= queue.length) {
        // Adjust currentTrackIndex if out of range
        currentTrackIndex = queue.length - 1;
        preloadAndPlay(currentTrackIndex);
    }

    updateDownloadButtonState();
}

// ================== PRELOAD & PLAY TRACK ==================
function preloadAndPlay(index) {
    const trackTitle = queue[index];
    if (!trackTitle) return;

    const data = tracksData[trackTitle];
    audioSource.src = data.src;
    audioPlayer.preload = "auto";
    audioPlayer.load();

    albumCover.src = data.cover;
    trackInfoSpan.textContent = trackTitle;
    trackLengthSpan.textContent = `00:00 / ${data.length}`;

    // Show buffering indicator
    const bufferingNotice = document.createElement("div");
    bufferingNotice.textContent = "Loading...";
    bufferingNotice.style.position = "absolute";
    bufferingNotice.style.top = "50%";
    bufferingNotice.style.left = "50%";
    bufferingNotice.style.transform = "translate(-50%, -50%)";
    bufferingNotice.style.background = "rgba(0,0,0,0.8)";
    bufferingNotice.style.color = "#ffb3ff";
    bufferingNotice.style.padding = "5px 10px";
    bufferingNotice.style.borderRadius = "5px";
    bufferingNotice.style.fontSize = "14px";
    bufferingNotice.style.zIndex = "2000";
    document.body.appendChild(bufferingNotice);

    function canPlayHandler() {
        audioPlayer.removeEventListener("canplaythrough", canPlayHandler);
        if (document.body.contains(bufferingNotice)) {
            document.body.removeChild(bufferingNotice);
        }
        audioPlayer.play();
        isPlaying = true;
    }

    audioPlayer.addEventListener("canplaythrough", canPlayHandler);
}

// ================== LOAD TRACK ==================
function loadTrack(index) {
    preloadAndPlay(index);
}

// ================== PLAYER CONTROLS ==================
function playPause() {
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        if (audioPlayer.readyState < 4) {
            audioPlayer.addEventListener("canplaythrough", function handler() {
                audioPlayer.removeEventListener("canplaythrough", handler);
                audioPlayer.play();
            });
        } else {
            audioPlayer.play();
        }
    }
    isPlaying = !isPlaying;
}

function prevTrack() {
    if (queue.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + queue.length) % queue.length;
    preloadAndPlay(currentTrackIndex);
}

function nextTrack() {
    if (queue.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % queue.length;
    preloadAndPlay(currentTrackIndex);
}

// ================== DOWNLOAD POPUP ==================
function downloadCurrentTrack() {
    if (currentTrackIndex === -1) {
        return;
    }

    const popup = window.open("", "DownloadPopup", "width=300,height=150");
    popup.document.write(`
        <html><head><title>Download Track</title></head>
        <body style="background-color:black;color:#0ff;font-family:monospace;text-align:center;padding-top:20px;">
            <p>Ready to download your track?</p>
            <button onclick="window.opener.triggerDownload(); window.close();" style="background:#0ff;color:black;padding:5px 10px;">OK!</button>
        </body></html>
    `);
}

// ================== TRIGGER DOWNLOAD ==================
function triggerDownload() {
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
        const btn = document.querySelector(".player-controls button.share-btn"); // Add class to share button in HTML
        const popup = document.createElement("div");
        popup.textContent = "link copied!";
        popup.style.position = "absolute";
        popup.style.background = "#0ff";
        popup.style.color = "black";
        popup.style.fontSize = "12px";
        popup.style.padding = "2px 5px";
        popup.style.borderRadius = "3px";

        const rect = btn.getBoundingClientRect();
        popup.style.top = window.scrollY + rect.top - 25 + "px";
        popup.style.left = window.scrollX + rect.left + "px";
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
    if (audioPlayer.duration && currentTrackIndex !== -1) {
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
    updateDownloadButtonState();
});

// ================== UPDATE DOWNLOAD BUTTON STATE ==================
function updateDownloadButtonState() {
    if (!downloadButton) return;
    if (currentTrackIndex === -1 || queue.length === 0) {
        downloadButton.disabled = true;
        downloadButton.style.opacity = "0.5"; // visually indicate disabled
        downloadButton.style.cursor = "not-allowed";
    } else {
        downloadButton.disabled = false;
        downloadButton.style.opacity = "1";
        downloadButton.style.cursor = "pointer";
    }
}

// Call once on page load
updateDownloadButtonState();

// ================== TOGGLE DARK MODE ==================
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}



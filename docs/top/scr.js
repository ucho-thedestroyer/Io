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


// ================== SHARE POPUP (robust, non-breaking) ==================
function shareCurrentTrack() {
  const url = window.location.href;

  // copy helper: prefer navigator.clipboard, fallback to execCommand
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) resolve();
        else reject(new Error("copy-failed"));
      } catch (err) {
        reject(err);
      }
    });
  }

  copyToClipboard(url).then(() => {
    // robustly find the share button or fall back to the .player-controls container
    let btn = document.querySelector(".player-controls button.share-btn")
           || document.querySelector('.player-controls button[onclick*="shareCurrentTrack"]')
           || Array.from(document.querySelectorAll(".player-controls button")).find(b => {
                return b && b.textContent && b.textContent.trim().toLowerCase() === "share";
              })
           || document.querySelector(".player-controls"); // fallback place

    // create popup
    const popup = document.createElement("div");
    popup.textContent = "link copied!";
    popup.style.position = "absolute";
    popup.style.background = "#0ff";    // blue-ish popup like your old style
    popup.style.color = "black";
    popup.style.fontSize = "12px";
    popup.style.padding = "4px 8px";
    popup.style.borderRadius = "4px";
    popup.style.fontFamily = "inherit";
    popup.style.zIndex = "10000";
    popup.style.opacity = "0";
    popup.style.transition = "opacity 0.15s ease";

    document.body.appendChild(popup);

    // position popup relative to found element
    try {
      const rect = btn.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      // center above button by default
      let top = window.scrollY + rect.top - popupRect.height - 8;
      let left = window.scrollX + rect.left + (rect.width - popupRect.width) / 2;
      // if there's no room above, put it below
      if (top < window.scrollY + 4) top = window.scrollY + rect.bottom + 8;
      // if left would overflow off-screen, clamp it
      left = Math.max(6 + window.scrollX, Math.min(left, window.scrollX + document.documentElement.clientWidth - popupRect.width - 6));
      popup.style.top = `${top}px`;
      popup.style.left = `${left}px`;
    } catch (e) {
      // If anything goes wrong, center the popup near the top of the player-controls
      const pc = document.querySelector(".player-controls");
      const pcRect = pc ? pc.getBoundingClientRect() : { top: 60, left: 20, width: 200 };
      const popupRect = popup.getBoundingClientRect();
      const top = window.scrollY + pcRect.top - popupRect.height - 8;
      const left = window.scrollX + pcRect.left + (pcRect.width - popupRect.width) / 2;
      popup.style.top = `${top}px`;
      popup.style.left = `${left}px`;
    }

    // fade in -> stay -> fade out
    requestAnimationFrame(() => popup.style.opacity = "1");
    setTimeout(() => {
      popup.style.opacity = "0";
      setTimeout(() => popup.remove(), 400);
    }, 1100);

  }).catch(() => {
    // fallback UX if clipboard not available / copy failed
    const popup = document.createElement("div");
    popup.textContent = "couldn't copy link";
    popup.style.position = "fixed";
    popup.style.right = "12px";
    popup.style.bottom = "12px";
    popup.style.background = "#ff6666";
    popup.style.color = "black";
    popup.style.padding = "6px 10px";
    popup.style.borderRadius = "4px";
    popup.style.zIndex = "10000";
    popup.style.fontFamily = "inherit";
    popup.style.fontSize = "12px";
    popup.style.opacity = "0";
    popup.style.transition = "opacity 0.15s ease";
    document.body.appendChild(popup);
    requestAnimationFrame(() => popup.style.opacity = "1");
    setTimeout(() => {
      popup.style.opacity = "0";
      setTimeout(() => popup.remove(), 400);
    }, 1300);
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


/* =================== TABS (fixed, robust implementation) ===================
   - Works with your tracksData object (keys are track titles).
   - Creates selector bar if missing.
   - "All Songs" is default and fully populated.
   - Gracefully handles missing album fields.
   - Dynamically creates .track nodes that call addToQueue(this) so your queue logic is preserved.
*/

(function initTabs() {
  function getTracksArray() {
    return Object.entries(tracksData).map(([title, data]) => {
      return {
        title,
        length: data.length || "",
        genre: data.genre || "Unknown",
        album: data.album || null,
        desc: data.desc || "",
        src: data.src || "",
        cover: data.cover || ""
      };
    });
  }

  function createSelectorIfNeeded(trackListContainer) {
    let selector = trackListContainer.querySelector('.track-selector');
    if (!selector) {
      selector = document.createElement('div');
      selector.className = 'track-selector';
      selector.innerHTML = `
        <button class="selector-btn" data-type="all">All Songs</button>
        <button class="selector-btn" data-type="genre">Genre</button>
        <button class="selector-btn" data-type="album">Album</button>
      `;
      const title = trackListContainer.querySelector('h2');
      if (title) title.insertAdjacentElement('afterend', selector);
      else trackListContainer.insertBefore(selector, trackListContainer.firstChild);
    }
    return selector;
  }

  function createSubTabsContainerIfNeeded(trackListContainer, afterElement) {
    let st = trackListContainer.querySelector('.sub-tabs');
    if (!st) {
      st = document.createElement('div');
      st.className = 'sub-tabs';
      if (afterElement) afterElement.insertAdjacentElement('afterend', st);
      else trackListContainer.appendChild(st);
    }
    return st;
  }

  function createTracksDisplayIfNeeded(trackListContainer) {
    let disp = trackListContainer.querySelector('.tracks-display');
    if (!disp) {
      disp = document.createElement('div');
      disp.className = 'tracks-display';
      trackListContainer.appendChild(disp);
    }
    return disp;
  }

  // Render an array of track objects into the tracks-display container
  function renderTracksArray(trackListContainer, tracksArray) {
    const disp = createTracksDisplayIfNeeded(trackListContainer);
    disp.innerHTML = ''; // clear

    // Always sort alphabetically by title for predictable order
    tracksArray.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

    tracksArray.forEach(t => {
      const trackDiv = document.createElement('div');
      trackDiv.className = 'track';
      // use inline onclick to reuse your existing addToQueue(element) function
      trackDiv.setAttribute('onclick', 'addToQueue(this)');

      // build HTML as your original structure expects
      trackDiv.innerHTML = `
          <div class="track-meta">
            <h4>${t.title}</h4>
            <p>Length: ${t.length || ''} | Genre: ${t.genre || 'Unknown'}</p>
            <p class="desc">${t.desc || ''}</p>
          </div>
      `;
      disp.appendChild(trackDiv);
    });
  }

  // Utilities to build unique lists for genre/album
  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort((a,b) => a.localeCompare(b, undefined, { sensitivity:'base' }));
  }

  // Main init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    const trackListContainer = document.querySelector('.track-list');
    if (!trackListContainer) return;

    const selector = createSelectorIfNeeded(trackListContainer);
    const subTabs = createSubTabsContainerIfNeeded(trackListContainer, selector);
    const tracksDisplay = createTracksDisplayIfNeeded(trackListContainer);

    const selectorButtons = selector.querySelectorAll('.selector-btn');

    // Attach selector behavior
    selectorButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // active class
        selectorButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const type = btn.dataset.type;
        if (type === 'genre') {
          buildSubTabs('genre');
        } else if (type === 'album') {
          buildSubTabs('album');
        } else { // all
          subTabs.innerHTML = '';
          renderTracksArray(trackListContainer, getTracksArray());
        }
      });
    });

    // Make "All Songs" the default active tab
    const allBtn = selector.querySelector('.selector-btn[data-type="all"]');
    if (allBtn) {
      allBtn.classList.add('active');
      // initial render of all tracks
      renderTracksArray(trackListContainer, getTracksArray());
    }

    // Build sub-tabs for given key (genre or album)
    function buildSubTabs(key) {
      subTabs.innerHTML = '';
      const arr = getTracksArray();
      const values = uniqueSorted(arr.map(t => t[key]).filter(v => v)); // album might be null for some
      if (values.length === 0) {
        subTabs.innerHTML = `<div class="no-data">No ${key} data yet</div>`;
        return;
      }

      values.forEach((val, idx) => {
        const b = document.createElement('button');
        b.className = 'sub-tab';
        b.type = 'button';
        b.dataset.filter = val;
        b.textContent = val;
        if (idx === 0) b.classList.add('active');
        b.addEventListener('click', () => {
          // active state
          Array.from(subTabs.querySelectorAll('.sub-tab')).forEach(x => x.classList.remove('active'));
          b.classList.add('active');

          const filtered = getTracksArray().filter(t => (t[key] || '') === val);
          renderTracksArray(trackListContainer, filtered);
        });
        subTabs.appendChild(b);
      });

      // auto-click first sub-tab (or simply render the first group)
      const firstVal = values[0];
      const firstGroup = getTracksArray().filter(t => (t[key] || '') === firstVal);
      renderTracksArray(trackListContainer, firstGroup);
    }
  });
})();

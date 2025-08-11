// scr.js

// Track storage: title, length, genre, description, audio URL, cover URL
const tracksData = {
    "epilogue I": {
        src: "https://bafybeihwxwvoxbrt25nldzfatgzo5cg3nmcoxuahzihwo5vwiq5trwmr7a.ipfs.w3s.link/epilogue.m4a",
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
        genre: "Retro Pop",
        album: "wow"
    }
};

// ================== VARIABLES ==================
let isPlaying = false;
let currentTrackIndex = -1; // use -1 to mean "no current track"
let queue = [];
let tracksData = {}; // your { title: { src, cover, length, ... } } map

// DOM refs (guarded below)
const audioPlayer = document.getElementById("audio-player");
const audioSource = document.getElementById("audio-source"); // may be null if not using <source>
const albumCover = document.querySelector(".album-cover");
const trackInfoSpan = document.querySelector(".track-info span strong");
const trackLengthSpan = document.querySelector(".track-length");
const progressBar = document.getElementById("progress-bar");
const volumeSlider = document.querySelector(".volume-slider");
const downloadButton = document.getElementById("download-btn");

// quick guard: audioPlayer is required
if (!audioPlayer) {
  console.error("audio-player element not found. Player script will not run.");
}

// ================== ADD TO QUEUE ==================
function addToQueue(trackElement) {
  const h4 = trackElement.querySelector("h4");
  if (!h4) return;
  const trackTitle = String(h4.innerText || "").trim();
  if (!tracksData[trackTitle]) return;

  queue.push(trackTitle);

  // Create queue item with a delete button
  const li = document.createElement("li");
  const titleSpan = document.createElement("span");
  titleSpan.textContent = trackTitle + " ";
  li.appendChild(titleSpan);

  const delBtn = document.createElement("span");
  delBtn.textContent = "[X]";
  delBtn.style.color = "red";
  delBtn.style.cursor = "pointer";
  delBtn.onclick = () => removeFromQueueInstance(trackTitle, li);
  li.appendChild(delBtn);

  const queueEl = document.getElementById("queue");
  if (queueEl) queueEl.appendChild(li);

  // If no track loaded, start playing the first queued track
  if (currentTrackIndex === -1) {
    currentTrackIndex = 0;
    preloadAndPlay(currentTrackIndex);
  }

  updateDownloadButtonState();
}

// ================== REMOVE FROM QUEUE (remove single instance safely) ==================
function removeFromQueueInstance(title, element) {
  const idx = queue.indexOf(title);
  if (idx === -1) {
    if (element && element.remove) element.remove();
    updateDownloadButtonState();
    return;
  }

  // Remove the single instance from queue
  queue.splice(idx, 1);
  if (element && element.remove) element.remove();

  if (queue.length === 0) {
    // stop playback and clear
    try { audioPlayer.pause(); } catch (e) {}
    currentTrackIndex = -1;
    isPlaying = false;
    audioPlayer.removeAttribute("src");
    if (audioSource) audioSource.removeAttribute("src");
    try { audioPlayer.load(); } catch (e) {}
    updateDownloadButtonState();
    return;
  }

  // Adjust currentTrackIndex
  if (idx < currentTrackIndex) {
    currentTrackIndex -= 1; // earlier element removed shifts indexes left
  } else if (idx === currentTrackIndex) {
    // removed the currently playing track:
    // play the next track at the same index (which now contains the next item),
    // or clamp to last index if needed
    if (currentTrackIndex >= queue.length) currentTrackIndex = queue.length - 1;
    preloadAndPlay(currentTrackIndex);
  }

  updateDownloadButtonState();
}

// ================== LOADING OVERLAY HELPERS ==================
const BUFFER_OVERLAY_ID = "audio-buffering-notice";

function removeExistingOverlay() {
  const ex = document.getElementById(BUFFER_OVERLAY_ID);
  if (ex) ex.remove();
}

function createLoadingOverlay() {
  removeExistingOverlay();
  const bufferingNotice = document.createElement("div");
  bufferingNotice.id = BUFFER_OVERLAY_ID;
  bufferingNotice.textContent = "Loading...";
  bufferingNotice.style.position = "absolute";
  bufferingNotice.style.top = "50%";
  bufferingNotice.style.left = "50%";
  bufferingNotice.style.transform = "translate(-50%, -50%)";
  bufferingNotice.style.background = "rgba(0,0,0,0.8)";
  bufferingNotice.style.color = "#ffb3ff";
  bufferingNotice.style.padding = "6px 12px";
  bufferingNotice.style.borderRadius = "6px";
  bufferingNotice.style.fontSize = "14px";
  bufferingNotice.style.zIndex = "2000";
  document.body.appendChild(bufferingNotice);
  return bufferingNotice;
}

// small toast helper
function showTempToast(text, ms = 1400) {
  const popup = document.createElement("div");
  popup.textContent = text;
  popup.style.position = "fixed";
  popup.style.right = "12px";
  popup.style.bottom = "12px";
  popup.style.background = "#222";
  popup.style.color = "#fff";
  popup.style.padding = "8px 12px";
  popup.style.borderRadius = "6px";
  popup.style.zIndex = "10001";
  popup.style.opacity = "0";
  popup.style.transition = "opacity 0.12s ease";
  document.body.appendChild(popup);
  requestAnimationFrame(() => popup.style.opacity = "1");
  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 220);
  }, ms);
}

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

    // === Loading Overlay ===
    const bufferingNotice = document.createElement("div");
    bufferingNotice.style.position = "absolute";
    bufferingNotice.style.top = "50%";
    bufferingNotice.style.left = "50%";
    bufferingNotice.style.transform = "translate(-50%, -50%)";
    bufferingNotice.style.background = "rgba(0,0,0,0.8)";
    bufferingNotice.style.color = "#ffb3ff";
    bufferingNotice.style.padding = "10px 15px";
    bufferingNotice.style.borderRadius = "5px";
    bufferingNotice.style.fontSize = "14px";
    bufferingNotice.style.zIndex = "2000";
    bufferingNotice.style.textAlign = "center";

    const loadingText = document.createElement("div");
    loadingText.textContent = "Loading...";
    bufferingNotice.appendChild(loadingText);

    // Progress bar container
    const progressContainer = document.createElement("div");
    progressContainer.style.width = "100%";
    progressContainer.style.height = "6px";
    progressContainer.style.background = "rgba(255,255,255,0.2)";
    progressContainer.style.borderRadius = "3px";
    progressContainer.style.marginTop = "8px";
    bufferingNotice.appendChild(progressContainer);

    // Progress bar itself
    const progressBar = document.createElement("div");
    progressBar.style.height = "100%";
    progressBar.style.width = "0%";
    progressBar.style.background = "#ffb3ff";
    progressBar.style.borderRadius = "3px";
    progressBar.style.transition = "width 0.2s linear";
    progressContainer.appendChild(progressBar);

    document.body.appendChild(bufferingNotice);

    function updateProgress() {
        if (audioPlayer.buffered.length > 0 && audioPlayer.duration > 0) {
            const bufferedEnd = audioPlayer.buffered.end(audioPlayer.buffered.length - 1);
            const percent = Math.min(100, (bufferedEnd / audioPlayer.duration) * 100);
            progressBar.style.width = percent + "%";
        }
    }

    function removeLoading() {
        if (document.body.contains(bufferingNotice)) {
            document.body.removeChild(bufferingNotice);
        }
        audioPlayer.removeEventListener("loadeddata", removeLoading);
        audioPlayer.removeEventListener("playing", removeLoading);
        audioPlayer.removeEventListener("progress", updateProgress);
    }

    // Events
    audioPlayer.addEventListener("progress", updateProgress);
    audioPlayer.addEventListener("loadeddata", removeLoading);
    audioPlayer.addEventListener("playing", removeLoading);

    // Play immediately
    audioPlayer.play().catch(err => {
        console.warn("Autoplay prevented:", err);
    });

    isPlaying = true;
    currentTrackIndex = index;
}

// ================== LOAD TRACK (alias) ==================
function loadTrack(index) {
  if (index == null || index < 0 || index >= queue.length) return;
  preloadAndPlay(index);
}

// ================== PLAYER CONTROLS ==================
function playPause() {
  if (!audioPlayer) return;
  // If nothing has been loaded but queue has items, start first
  if (currentTrackIndex === -1 && queue.length > 0) {
    currentTrackIndex = 0;
    preloadAndPlay(currentTrackIndex);
    return;
  }

  if (audioPlayer.paused) {
    audioPlayer.play().then(() => {
      isPlaying = true;
      updateDownloadButtonState();
    }).catch(err => {
      console.warn("Play failed:", err);
    });
  } else {
    audioPlayer.pause();
    isPlaying = false;
    updateDownloadButtonState();
  }
}

function nextTrack() {
  if (queue.length === 0) return;
  if (currentTrackIndex === -1) currentTrackIndex = 0;
  else currentTrackIndex = (currentTrackIndex + 1) % queue.length;
  preloadAndPlay(currentTrackIndex);
}

function prevTrack() {
  if (queue.length === 0) return;
  if (currentTrackIndex === -1) currentTrackIndex = 0;
  else currentTrackIndex = (currentTrackIndex - 1 + queue.length) % queue.length;
  preloadAndPlay(currentTrackIndex);
}

// ================== TIMEUPDATE, PROGRESS & VOLUME ==================
function formatTime(seconds) {
  if (!isFinite(seconds) || isNaN(seconds)) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

if (audioPlayer) {
  audioPlayer.addEventListener("timeupdate", () => {
    // update progress bar
    if (progressBar) {
      if (audioPlayer.duration && isFinite(audioPlayer.duration)) {
        const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
      } else {
        progressBar.style.width = "0%";
      }
    }

    // update time display
    const currentStr = formatTime(audioPlayer.currentTime);
    let durStr = "00:00";
    if (audioPlayer.duration && isFinite(audioPlayer.duration)) {
      durStr = formatTime(audioPlayer.duration);
    } else if (currentTrackIndex !== -1 && queue[currentTrackIndex]) {
      durStr = tracksData[queue[currentTrackIndex]]?.length || "00:00";
    }
    if (trackLengthSpan) trackLengthSpan.textContent = `${currentStr} / ${durStr}`;
  });
}

if (volumeSlider && audioPlayer) {
  // set initial slider from audio volume
  try { volumeSlider.value = Math.round((audioPlayer.volume || 1) * 100); } catch (e) {}
  volumeSlider.addEventListener("input", () => {
    audioPlayer.volume = Math.max(0, Math.min(1, volumeSlider.value / 100));
  });
}

// Auto-play next track when current ends
if (audioPlayer) {
  audioPlayer.addEventListener("ended", () => {
    if (queue.length > 0) {
      nextTrack();
    } else {
      isPlaying = false;
      currentTrackIndex = -1;
    }
    updateDownloadButtonState();
  });
}

// ================== UPDATE DOWNLOAD BUTTON STATE ==================
function updateDownloadButtonState() {
  if (!downloadButton) return;
  if (currentTrackIndex === -1 || queue.length === 0 || !queue[currentTrackIndex]) {
    downloadButton.disabled = true;
    downloadButton.style.opacity = "0.5";
    downloadButton.style.cursor = "not-allowed";
  } else {
    downloadButton.disabled = false;
    downloadButton.style.opacity = "1";
    downloadButton.style.cursor = "pointer";
  }
}

// Call once on page load
updateDownloadButtonState();

// ================== DOWNLOAD POPUP ==================
function downloadCurrentTrack() {
  if (currentTrackIndex === -1 || !queue[currentTrackIndex]) return;

  const popup = window.open("", "DownloadPopup", "width=300,height=150");
  if (!popup) {
    showTempToast("Popup blocked. Right-click to download.", 1800);
    return;
  }

  popup.document.write(`
    <html><head><title>Download Track</title></head>
    <body style="background-color:black;color:#0ff;font-family:monospace;text-align:center;padding-top:20px;">
      <p>Ready to download your track?</p>
      <button id="okBtn" style="background:#0ff;color:black;padding:5px 10px;">OK!</button>
    </body></html>
  `);

  // ensure triggerDownload is available to popup
  popup.document.close();
  popup.document.getElementById("okBtn").addEventListener("click", () => {
    try {
      triggerDownload();
    } catch (e) {
      console.warn("triggerDownload failed:", e);
    }
    popup.close();
  });
}

// ================== TRIGGER DOWNLOAD (with fetch fallback) ==================
async function triggerDownload() {
  const trackTitle = queue[currentTrackIndex];
  if (!trackTitle) return;
  const url = tracksData[trackTitle]?.src;
  if (!url) return;

  // Try simple anchor download first
  try {
    const a = document.createElement("a");
    a.href = url;
    // try to infer extension
    const extMatch = url.match(/\.([a-zA-Z0-9]{2,5})(?:\?|$)/);
    const ext = extMatch ? extMatch[1] : "mp3";
    a.download = `${trackTitle}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  } catch (e) {
    console.warn("Anchor download failed, trying fetch->blob fallback:", e);
  }

  // Fetch + blob fallback (may fail due to CORS)
  try {
    const resp = await fetch(url, { mode: "cors" });
    if (!resp.ok) throw new Error("Network response not ok");
    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(blob);
    const b = document.createElement("a");
    b.href = blobUrl;
    const extMatch = url.match(/\.([a-zA-Z0-9]{2,5})(?:\?|$)/);
    const ext = extMatch ? extMatch[1] : "mp3";
    b.download = `${trackTitle}.${ext}`;
    document.body.appendChild(b);
    b.click();
    b.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } catch (err) {
    console.warn("Download fallback failed (CORS?), opening in new tab:", err);
    window.open(url, "_blank");
  }
}

// ================== SHARE POPUP (kept as-is, robust) ==================
function shareCurrentTrack() {
  const url = window.location.href;

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
    let btn = document.querySelector(".player-controls button.share-btn")
           || document.querySelector('.player-controls button[onclick*="shareCurrentTrack"]')
           || Array.from(document.querySelectorAll(".player-controls button")).find(b => {
                return b && b.textContent && b.textContent.trim().toLowerCase() === "share";
              })
           || document.querySelector(".player-controls");

    const popup = document.createElement("div");
    popup.textContent = "link copied!";
    popup.style.position = "absolute";
    popup.style.background = "#0ff";
    popup.style.color = "black";
    popup.style.fontSize = "12px";
    popup.style.padding = "4px 8px";
    popup.style.borderRadius = "4px";
    popup.style.fontFamily = "inherit";
    popup.style.zIndex = "10000";
    popup.style.opacity = "0";
    popup.style.transition = "opacity 0.15s ease";
    document.body.appendChild(popup);

    try {
      const rect = btn.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      let top = window.scrollY + rect.top - popupRect.height - 8;
      let left = window.scrollX + rect.left + (rect.width - popupRect.width) / 2;
      if (top < window.scrollY + 4) top = window.scrollY + rect.bottom + 8;
      left = Math.max(6 + window.scrollX, Math.min(left, window.scrollX + document.documentElement.clientWidth - popupRect.width - 6));
      popup.style.top = `${top}px`;
      popup.style.left = `${left}px`;
    } catch (e) {
      const pc = document.querySelector(".player-controls");
      const pcRect = pc ? pc.getBoundingClientRect() : { top: 60, left: 20, width: 200 };
      const popupRect = popup.getBoundingClientRect();
      const top = window.scrollY + pcRect.top - popupRect.height - 8;
      const left = window.scrollX + pcRect.left + (pcRect.width - popupRect.width) / 2;
      popup.style.top = `${top}px`;
      popup.style.left = `${left}px`;
    }

    requestAnimationFrame(() => popup.style.opacity = "1");
    setTimeout(() => {
      popup.style.opacity = "0";
      setTimeout(() => popup.remove(), 400);
    }, 1100);

  }).catch(() => {
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


// =================== TABS (keeps your implementation, safer attach) ===================
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

  function renderTracksArray(trackListContainer, tracksArray) {
    const disp = createTracksDisplayIfNeeded(trackListContainer);
    disp.innerHTML = ''; // clear
    tracksArray.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

    tracksArray.forEach(t => {
      const trackDiv = document.createElement('div');
      trackDiv.className = 'track';
      // addEventListener is safer than inline onclick
      trackDiv.addEventListener('click', () => addToQueue(trackDiv));

      // Use textContent for safety (avoid unsanitized HTML)
      const meta = document.createElement('div');
      meta.className = 'track-meta';
      const h4 = document.createElement('h4');
      h4.textContent = t.title;
      const p = document.createElement('p');
      p.textContent = `Length: ${t.length || ''} | Genre: ${t.genre || 'Unknown'}`;
      const desc = document.createElement('p');
      desc.className = 'desc';
      desc.textContent = t.desc || '';

      meta.appendChild(h4);
      meta.appendChild(p);
      meta.appendChild(desc);
      trackDiv.appendChild(meta);
      disp.appendChild(trackDiv);
    });
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort((a,b) => a.localeCompare(b, undefined, { sensitivity:'base' }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const trackListContainer = document.querySelector('.track-list');
    if (!trackListContainer) return;

    const selector = createSelectorIfNeeded(trackListContainer);
    const subTabs = createSubTabsContainerIfNeeded(trackListContainer, selector);
    const tracksDisplay = createTracksDisplayIfNeeded(trackListContainer);

    const selectorButtons = selector.querySelectorAll('.selector-btn');

    selectorButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        selectorButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const type = btn.dataset.type;
        if (type === 'genre') buildSubTabs('genre');
        else if (type === 'album') buildSubTabs('album');
        else { subTabs.innerHTML = ''; renderTracksArray(trackListContainer, getTracksArray()); }
      });
    });

    const allBtn = selector.querySelector('.selector-btn[data-type="all"]');
    if (allBtn) {
      allBtn.classList.add('active');
      renderTracksArray(trackListContainer, getTracksArray());
    }

    function buildSubTabs(key) {
      subTabs.innerHTML = '';
      const arr = getTracksArray();
      const values = uniqueSorted(arr.map(t => t[key]).filter(v => v));
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
          Array.from(subTabs.querySelectorAll('.sub-tab')).forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          const filtered = getTracksArray().filter(t => (t[key] || '') === val);
          renderTracksArray(trackListContainer, filtered);
        });
        subTabs.appendChild(b);
      });

      const firstVal = values[0];
      const firstGroup = getTracksArray().filter(t => (t[key] || '') === firstVal);
      renderTracksArray(trackListContainer, firstGroup);
    }
  });
})();

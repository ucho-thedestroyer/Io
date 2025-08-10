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

/* ======= Track list tabs & sort enhancement (safe, non-destructive) ======= */
(function () {
  // Helper to parse metadata from a track element
  function parseMeta(trackEl, key) {
    // data-* attr takes precedence
    if (key && trackEl.dataset && trackEl.dataset[key]) return trackEl.dataset[key].trim();
    // fallback: look for "Key: value" in .track-meta p elements
    const ps = Array.from(trackEl.querySelectorAll('.track-meta p'));
    for (const p of ps) {
      const m = p.textContent.match(new RegExp(key + '\\s*:\\s*([^|]+)', 'i'));
      if (m) return m[1].trim();
    }
    return 'Unknown';
  }

  function initTrackTabs() {
    const trackList = document.querySelector('.track-list');
    if (!trackList) return;

    // Avoid double-init: if we already built .track-groups, do nothing or refresh
    if (trackList.querySelector('.track-groups')) {
      // Already initialized — if you want to rebuild after dynamic edits, call refreshTrackTabs()
      return;
    }

    const existingTracks = Array.from(trackList.querySelectorAll(':scope > .track'));
    if (existingTracks.length === 0) return;

    // Build maps for both category modes
    const genreMap = new Map();
    const albumMap = new Map();

    existingTracks.forEach(tr => {
      const genre = parseMeta(tr, 'genre') || 'Unknown';
      const album = parseMeta(tr, 'album') || 'Unknown';

      if (!genreMap.has(genre)) genreMap.set(genre, []);
      genreMap.get(genre).push(tr);

      if (!albumMap.has(album)) albumMap.set(album, []);
      albumMap.get(album).push(tr);
    });

    // Create the UI containers
    const tabsWrap = document.createElement('div');
    tabsWrap.className = 'track-tabs';

    const controlsWrap = document.createElement('div');
    controlsWrap.className = 'track-controls';

    const modeToggle = document.createElement('div');
    modeToggle.className = 'mode-toggle';

    const btnModeGenre = document.createElement('button');
    btnModeGenre.type = 'button';
    btnModeGenre.textContent = 'By Genre';
    btnModeGenre.dataset.mode = 'genre';

    const btnModeAlbum = document.createElement('button');
    btnModeAlbum.type = 'button';
    btnModeAlbum.textContent = 'By Album';
    btnModeAlbum.dataset.mode = 'album';

    modeToggle.appendChild(btnModeGenre);
    modeToggle.appendChild(btnModeAlbum);

    const sortBtn = document.createElement('button');
    sortBtn.type = 'button';
    sortBtn.className = 'track-sort-btn';
    sortBtn.textContent = 'Sort A→Z';

    controlsWrap.appendChild(modeToggle);
    controlsWrap.appendChild(tabsWrap);
    controlsWrap.appendChild(sortBtn);

    // Insert controls a few pixels after the H2 title
    const title = trackList.querySelector('h2');
    if (title) {
      title.insertAdjacentElement('afterend', controlsWrap);
    } else {
      trackList.insertBefore(controlsWrap, trackList.firstChild);
    }

    // Create group container wrapper (we will move track nodes inside)
    const groupWrapper = document.createElement('div');
    groupWrapper.className = 'track-groups';

    // Move existing track nodes into group containers
    function createGroups(map, mode) {
      const groups = new Map();
      // create a group element for each key and append tracks
      map.forEach((arr, key) => {
        const g = document.createElement('div');
        g.className = 'track-group';
        g.dataset.category = key;
        arr.forEach(el => g.appendChild(el)); // move node; preserves inline onclick
        groups.set(key, g);
      });
      return groups;
    }

    const genreGroups = createGroups(genreMap, 'genre');
    const albumGroups = createGroups(albumMap, 'album');

    // Build "All" group (contains all tracks in original order)
    const allGroup = document.createElement('div');
    allGroup.className = 'track-group';
    allGroup.dataset.category = 'All';
    existingTracks.forEach(t => allGroup.appendChild(t));

    // Append groups to wrapper (but we will control visibility based on mode)
    groupWrapper.appendChild(allGroup);
    genreGroups.forEach(g => groupWrapper.appendChild(g));
    // album groups appended but hidden until user switches
    albumGroups.forEach(g => groupWrapper.appendChild(g));

    trackList.appendChild(groupWrapper);

    // State
    let currentMode = 'genre'; // 'genre' or 'album'
    let activeCategory = 'All';
    const sortState = {}; // map key "mode|category" => 'asc'|'desc'|'none'

    // Utility to refresh tab buttons for current mode
    function rebuildTabsForMode(mode) {
      tabsWrap.innerHTML = '';
      let keys;
      if (mode === 'genre') keys = ['All', ...Array.from(genreMap.keys())];
      else keys = ['All', ...Array.from(albumMap.keys())];

      keys.forEach(k => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'track-tab';
        b.textContent = k;
        b.dataset.category = k;
        b.addEventListener('click', () => {
          activeCategory = k;
          showCategory(mode, k);
        });
        tabsWrap.appendChild(b);
      });

      // set active class
      Array.from(tabsWrap.querySelectorAll('.track-tab')).forEach(b => {
        b.classList.toggle('active', b.dataset.category === activeCategory);
      });

      // set sort button label based on sortState
      const key = mode + '|' + activeCategory;
      sortBtn.textContent = (sortState[key] === 'asc') ? 'Sort Z→A' : 'Sort A→Z';
    }

    // Show the selected category in the chosen mode
    function showCategory(mode, category) {
      // highlight the selected mode button
      btnModeGenre.classList.toggle('active', mode === 'genre');
      btnModeAlbum.classList.toggle('active', mode === 'album');

      // show/hide groups
      const groups = Array.from(groupWrapper.querySelectorAll('.track-group'));
      groups.forEach(g => {
        // Determine if this group belongs to the current mode set
        if (category === 'All') {
          // when All, show only the "All" group
          g.style.display = (g.dataset.category === 'All') ? 'block' : 'none';
        } else {
          // show the group whose dataset.category matches the requested category
          if (g.dataset.category === category) g.style.display = 'block';
          else g.style.display = 'none';
        }
      });

      // Update tab active state
      Array.from(tabsWrap.querySelectorAll('.track-tab')).forEach(b => {
        b.classList.toggle('active', b.dataset.category === category);
      });

      // Update sort button label according to state
      const key = mode + '|' + category;
      sortBtn.textContent = (sortState[key] === 'asc') ? 'Sort Z→A' : 'Sort A→Z';
    }

    // Toggle sorting for current visible category (ascending <-> descending)
    function toggleSortForActive() {
      const mode = currentMode;
      const category = activeCategory;
      const key = mode + '|' + category;
      const prev = sortState[key] || 'none';
      const asc = prev !== 'asc';
      // find the group element
      let groupEl;
      if (category === 'All') {
        groupEl = groupWrapper.querySelector('.track-group[data-category="All"]');
      } else {
        // find the group that matches category
        groupEl = Array.from(groupWrapper.querySelectorAll('.track-group')).find(g => g.dataset.category === category);
      }
      if (!groupEl) return;
      const items = Array.from(groupEl.querySelectorAll('.track'));
      items.sort((a, b) => {
        const ta = (a.querySelector('h4')?.textContent || '').trim().toLowerCase();
        const tb = (b.querySelector('h4')?.textContent || '').trim().toLowerCase();
        return asc ? ta.localeCompare(tb) : tb.localeCompare(ta);
      });
      // Re-append in sorted order (preserves onclick handlers)
      items.forEach(it => groupEl.appendChild(it));
      sortState[key] = asc ? 'asc' : 'desc';
      sortBtn.textContent = asc ? 'Sort Z→A' : 'Sort A→Z';
    }

    // Mode switch handlers
    btnModeGenre.addEventListener('click', () => {
      currentMode = 'genre';
      activeCategory = 'All';
      rebuildTabsForMode('genre');
      showCategory('genre', activeCategory);
    });
    btnModeAlbum.addEventListener('click', () => {
      currentMode = 'album';
      activeCategory = 'All';
      rebuildTabsForMode('album');
      showCategory('album', activeCategory);
    });

    // sort button action
    sortBtn.addEventListener('click', toggleSortForActive);

    // initial build
    rebuildTabsForMode('genre');
    showCategory('genre', 'All');

    // Expose a refresh function so your code can call window.refreshTrackTabs() if you dynamically add tracks later
    window.refreshTrackTabs = function () {
      // remove group wrapper and controls and rebuild
      const existingControls = trackList.querySelector('.track-controls');
      if (existingControls) existingControls.remove();
      const existingGroups = trackList.querySelector('.track-groups');
      if (existingGroups) existingGroups.remove();
      initTrackTabs(); // re-run initialization
    };
  }

  // run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrackTabs);
  } else {
    initTrackTabs();
  }
})();



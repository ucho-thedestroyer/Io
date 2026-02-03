// nostr-ui-forms.js
// Add these functions to handle UI forms for playlists and track submission

// ==================== SAVE PLAYLIST FORM ====================
function saveCurrentQueue() {
  if (!currentUser) {
    alert('Please log in first');
    return;
  }

  if (queue.length === 0) {
    alert('Queue is empty! Add some tracks first.');
    return;
  }

  // Create popup form
  const popup = document.createElement('div');
  popup.id = 'playlist-save-popup';
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.background = '#000044';
  popup.style.border = '3px double #00ffcc';
  popup.style.padding = '20px';
  popup.style.zIndex = '10000';
  popup.style.minWidth = '300px';
  popup.style.fontFamily = 'inherit';

  popup.innerHTML = `
    <h3 style="color: #00ffcc; margin-top: 0;">Save Playlist</h3>
    <p style="color: #00ffcc; font-size: 12px;">Tracks in queue: ${queue.length}</p>
    <input type="text" id="playlist-name-input" placeholder="Playlist name" 
           style="width: 100%; padding: 8px; background: #111144; border: 1px solid #00ffcc; 
                  color: #00ffcc; font-family: inherit; margin-bottom: 15px;">
    <div style="display: flex; gap: 10px; justify-content: flex-end;">
      <button id="save-playlist-btn" 
              style="padding: 8px 16px; background: #00ffcc; color: #000; border: none; 
                     cursor: pointer; font-family: inherit;">Save</button>
      <button id="cancel-playlist-btn" 
              style="padding: 8px 16px; background: #ff0066; color: #fff; border: none; 
                     cursor: pointer; font-family: inherit;">Cancel</button>
    </div>
  `;

  // Overlay
  const overlay = document.createElement('div');
  overlay.id = 'popup-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0,0,0,0.8)';
  overlay.style.zIndex = '9999';

  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  // Event listeners
  document.getElementById('save-playlist-btn').onclick = async () => {
    const name = document.getElementById('playlist-name-input').value.trim();
    if (!name) {
      alert('Please enter a playlist name');
      return;
    }

    const playlistData = {
      name: name,
      tracks: queue.map(title => ({
        title: title,
        ...window.TRACKS_DATA[title]
      }))
    };

    await savePlaylist(name, playlistData.tracks);
    overlay.remove();
    popup.remove();
  };

  document.getElementById('cancel-playlist-btn').onclick = () => {
    overlay.remove();
    popup.remove();
  };

  overlay.onclick = () => {
    overlay.remove();
    popup.remove();
  };
}

// ==================== LOAD PLAYLIST MENU ====================
async function loadPlaylistMenu() {
  if (!currentUser) {
    alert('Please log in first');
    return;
  }

  const playlists = await loadPlaylists();

  if (playlists.length === 0) {
    alert('No saved playlists found');
    return;
  }

  // Create popup menu
  const popup = document.createElement('div');
  popup.id = 'playlist-load-popup';
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.background = '#000044';
  popup.style.border = '3px double #00ffcc';
  popup.style.padding = '20px';
  popup.style.zIndex = '10000';
  popup.style.minWidth = '400px';
  popup.style.maxHeight = '500px';
  popup.style.overflowY = 'auto';
  popup.style.fontFamily = 'inherit';

  let playlistHTML = '<h3 style="color: #00ffcc; margin-top: 0;">Your Playlists</h3>';
  
  playlists.forEach((playlist, idx) => {
    playlistHTML += `
      <div style="border: 1px dashed #00ffcc; padding: 10px; margin-bottom: 10px; cursor: pointer;"
           onclick="loadPlaylistById('${playlist.id}')">
        <h4 style="color: #ffcc00; margin: 0 0 5px 0;">${playlist.name}</h4>
        <p style="color: #00ffcc; font-size: 11px; margin: 0;">
          ${playlist.tracks.length} tracks | Created: ${new Date(playlist.created_at).toLocaleDateString()}
        </p>
      </div>
    `;
  });

  playlistHTML += `
    <button id="close-playlist-menu" 
            style="padding: 8px 16px; background: #ff0066; color: #fff; border: none; 
                   cursor: pointer; font-family: inherit; margin-top: 10px; width: 100%;">
      Close
    </button>
  `;

  popup.innerHTML = playlistHTML;

  const overlay = document.createElement('div');
  overlay.id = 'popup-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0,0,0,0.8)';
  overlay.style.zIndex = '9999';

  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  document.getElementById('close-playlist-menu').onclick = () => {
    overlay.remove();
    popup.remove();
  };

  overlay.onclick = () => {
    overlay.remove();
    popup.remove();
  };
}

async function loadPlaylistById(playlistId) {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', playlistId)
    .single();

  if (error || !data) {
    alert('Failed to load playlist');
    return;
  }

  // Clear current queue
  const queueEl = document.getElementById('queue');
  if (queueEl) queueEl.innerHTML = '';
  queue = [];
  currentTrackIndex = -1;

  // Add tracks from playlist
  data.tracks.forEach(track => {
    // Add to TRACKS_DATA if not already there
    if (!window.TRACKS_DATA[track.title]) {
      window.TRACKS_DATA[track.title] = track;
    }

    // Add to queue
    queue.push(track.title);

    // Create queue UI element
    const li = document.createElement("li");
    li.setAttribute('draggable', 'true');
    li.style.cursor = 'move';
    
    const titleSpan = document.createElement("span");
    titleSpan.textContent = track.title + " ";
    titleSpan.style.userSelect = 'none';
    titleSpan.style.pointerEvents = 'none';
    li.appendChild(titleSpan);

    const delBtn = document.createElement("span");
    delBtn.textContent = "[X]";
    delBtn.style.color = "red";
    delBtn.style.cursor = "pointer";
    delBtn.style.userSelect = 'none';
    delBtn.style.pointerEvents = 'auto';
    delBtn.onclick = () => removeFromQueueInstance(track.title, li);
    li.appendChild(delBtn);

    queueEl.appendChild(li);
  });

  // Start playing first track
  if (queue.length > 0) {
    currentTrackIndex = 0;
    preloadAndPlay(0);
  }

  // Close popup
  document.getElementById('popup-overlay')?.remove();
  document.getElementById('playlist-load-popup')?.remove();

  alert(`Loaded playlist: ${data.name}`);
}

// ==================== SUBMIT TRACK FORM ====================
function openSubmitTrackForm() {
  if (!currentUser) {
    alert('Please log in first');
    return;
  }

  const popup = document.createElement('div');
  popup.id = 'submit-track-popup';
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.background = '#000044';
  popup.style.border = '3px double #00ffcc';
  popup.style.padding = '20px';
  popup.style.zIndex = '10000';
  popup.style.minWidth = '400px';
  popup.style.maxHeight = '80vh';
  popup.style.overflowY = 'auto';
  popup.style.fontFamily = 'inherit';

  popup.innerHTML = `
    <h3 style="color: #00ffcc; margin-top: 0;">Submit Your Track</h3>
    <p style="color: #ffcc00; font-size: 11px;">All fields are required except video</p>
    
    <label style="color: #00ffcc; display: block; margin-top: 10px;">Track Title:</label>
    <input type="text" id="track-title" 
           style="width: 100%; padding: 8px; background: #111144; border: 1px solid #00ffcc; 
                  color: #00ffcc; font-family: inherit; margin-bottom: 10px;">
    
    <label style="color: #00ffcc; display: block; margin-top: 10px;">Audio URL (IPFS, CDN, etc.):</label>
    <input type="url" id="track-src" placeholder="https://..."
           style="width: 100%; padding: 8px; background: #111144; border: 1px solid #00ffcc; 
                  color: #00ffcc; font-family: inherit; margin-bottom: 10px;">
    
    <label style="color: #00ffcc; display: block; margin-top: 10px;">Cover Image URL:</label>
    <input type="url" id="track-cover" placeholder="https://..."
           style="width: 100%; padding: 8px; background: #111144; border: 1px solid #00ffcc; 
                  color: #00ffcc; font-family: inherit; margin-bottom: 10px;">
    
    <label style="color: #00ffcc; display: block; margin-top: 10px;">Length (mm:ss):</label>
    <input type="text" id="track-length" placeholder="03:45"
           style="width: 100%; padding: 8px; background: #111144; border: 1px solid #00ffcc; 
                  color: #00ffcc; font-family: inherit; margin-bottom: 10px;">
    
    <label style="color: #00ffcc; display: block; margin-top: 10px;">Genre:</label>
    <input type="text" id="track-genre" placeholder="Electronic, Rock, etc."
           style="width: 100%; padding: 8px; background: #111144; border: 1px solid #00ffcc; 
                  color: #00ffcc; font-family: inherit; margin-bottom: 10px;">
    
    <label style="color: #00ffcc; display: block; margin-top: 10px;">Album:</label>
    <input type="text" id="track-album"
           style="width: 100%; padding: 8px; background: #111144; border: 1px solid #00ffcc; 
                  color: #00ffcc; font-family: inherit; margin-bottom: 10px;">
    
    <label style="color: #00ffcc; display: block; margin-top: 10px;">Artist Name:</label>
    <input type="text" id="track-artist"
           style="width: 100%; padding: 8px; background: #111144; border: 1px solid #00ffcc; 
                  color: #00ffcc; font-family: inherit; margin-bottom: 10px;">
    
    <label style="color: #00ffcc; display: block; margin-top: 10px;">Video URL (optional):</label>
    <input type="url" id="track-video" placeholder="https://... (optional)"
           style="width: 100%; padding: 8px; background: #111144; border: 1px solid #00ffcc; 
                  color: #00ffcc; font-family: inherit; margin-bottom: 15px;">
    
    <div style="display: flex; gap: 10px; justify-content: flex-end;">
      <button id="submit-track-btn" 
              style="padding: 8px 16px; background: #00ffcc; color: #000; border: none; 
                     cursor: pointer; font-family: inherit;">Submit</button>
      <button id="cancel-submit-btn" 
              style="padding: 8px 16px; background: #ff0066; color: #fff; border: none; 
                     cursor: pointer; font-family: inherit;">Cancel</button>
    </div>
  `;

  const overlay = document.createElement('div');
  overlay.id = 'popup-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.background = 'rgba(0,0,0,0.8)';
  overlay.style.zIndex = '9999';

  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  document.getElementById('submit-track-btn').onclick = async () => {
    const trackData = {
      title: document.getElementById('track-title').value.trim(),
      src: document.getElementById('track-src').value.trim(),
      cover: document.getElementById('track-cover').value.trim(),
      length: document.getElementById('track-length').value.trim(),
      genre: document.getElementById('track-genre').value.trim(),
      album: document.getElementById('track-album').value.trim(),
      artist: document.getElementById('track-artist').value.trim(),
      video: document.getElementById('track-video').value.trim() || null
    };

    // Validation
    if (!trackData.title || !trackData.src || !trackData.cover || 
        !trackData.length || !trackData.genre || !trackData.album || !trackData.artist) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate URL format
    try {
      new URL(trackData.src);
      new URL(trackData.cover);
      if (trackData.video) new URL(trackData.video);
    } catch (e) {
      alert('Please enter valid URLs');
      return;
    }

    // Validate length format (mm:ss)
    if (!/^\d{1,2}:\d{2}$/.test(trackData.length)) {
      alert('Length must be in format mm:ss (e.g., 03:45)');
      return;
    }

    await submitTrack(trackData);
    overlay.remove();
    popup.remove();
  };

  document.getElementById('cancel-submit-btn').onclick = () => {
    overlay.remove();
    popup.remove();
  };

  overlay.onclick = () => {
    overlay.remove();
    popup.remove();
  };
}

// Make functions globally accessible
window.saveCurrentQueue = saveCurrentQueue;
window.loadPlaylistMenu = loadPlaylistMenu;
window.loadPlaylistById = loadPlaylistById;
window.openSubmitTrackForm = openSubmitTrackForm;

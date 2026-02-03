// supabase-client.js
let supabase = null;

// Fetch config from serverless function
async function initSupabase() {
  if (supabase) return supabase;
  
  try {
    const response = await fetch('/api/supabase-config');
    const config = await response.json();
    
    const { createClient } = window.supabase;
    supabase = createClient(config.url, config.key);
    
    return supabase;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return null;
  }
}

// Update all your functions to use await initSupabase()
async function savePlaylist(name, tracks) {
  if (!currentUser) return;
  
  const client = await initSupabase();
  if (!client) {
    alert('Database connection failed');
    return;
  }

  const { data, error } = await client
    .from('playlists')
    .insert([
      {
        nostr_pubkey: currentUser.pubkey,
        name: name,
        tracks: tracks
      }
    ]);

  if (error) {
    console.error('Save playlist error:', error);
    alert('Failed to save playlist');
  } else {
    alert('Playlist saved!');
  }
}

async function loadPlaylists() {
  if (!currentUser) return [];

  const client = await initSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from('playlists')
    .select('*')
    .eq('nostr_pubkey', currentUser.pubkey);

  return data || [];
}

async function submitTrack(trackData) {
  if (!currentUser) return;

  const client = await initSupabase();
  if (!client) {
    alert('Database connection failed');
    return;
  }

  const { data, error } = await client
    .from('submitted_tracks')
    .insert([
      {
        nostr_pubkey: currentUser.pubkey,
        ...trackData
      }
    ]);

  if (error) {
    console.error('Submit track error:', error);
    alert('Failed to submit track');
  } else {
    alert('Track submitted for approval!');
  }
}

// Make sure to export for global access
window.savePlaylist = savePlaylist;
window.loadPlaylists = loadPlaylists;
window.submitTrack = submitTrack;

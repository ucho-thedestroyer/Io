// supabase-client.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Save playlist
async function savePlaylist(name, tracks) {
  if (!currentUser) return;

  const { data, error } = await supabase
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

// Load user playlists
async function loadPlaylists() {
  if (!currentUser) return [];

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('nostr_pubkey', currentUser.pubkey);

  return data || [];
}

// Submit track
async function submitTrack(trackData) {
  if (!currentUser) return;

  const { data, error } = await supabase
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

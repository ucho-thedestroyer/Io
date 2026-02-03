// nostr-auth.js
window.currentUser = null;

async function loginWithNostr() {
  if (!window.nostr) {
    alert('Please install a Nostr extension like nos2x or Alby');
    return null;
  }

  try {
    const pubkey = await window.nostr.getPublicKey();
    const profile = await fetchNostrProfile(pubkey);
    
    window.currentUser = {
      pubkey: pubkey,
      name: profile?.name || 'Anonymous',
      picture: profile?.picture || ''
    };

    // Store in localStorage for session persistence
    localStorage.setItem('nostr_user', JSON.stringify(window.currentUser));
    
    updateUIAfterLogin();
    return window.currentUser;
  } catch (error) {
    console.error('Nostr login failed:', error);
    alert('Login failed. Please try again.');
    return null;
  }
}

async function fetchNostrProfile(pubkey) {
  // Fetch user profile from Nostr relays
  const relay = new WebSocket('wss://relay.damus.io');
  
  return new Promise((resolve) => {
    relay.onopen = () => {
      relay.send(JSON.stringify([
        "REQ",
        "profile",
        { authors: [pubkey], kinds: [0], limit: 1 }
      ]));
    };

    relay.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data[0] === "EVENT") {
        const profile = JSON.parse(data[2].content);
        relay.close();
        resolve(profile);
      }
    };

    setTimeout(() => {
      relay.close();
      resolve(null);
    }, 5000);
  });
}

function logout() {
  window.currentUser = null;
  localStorage.removeItem('nostr_user');
  updateUIAfterLogout();
}

function updateUIAfterLogin() {
  const logBtn = document.querySelector('.log-btn');
  if (logBtn) {
    logBtn.textContent = window.currentUser.name || 'Logged In';
    logBtn.onclick = logout;
  }
  
  // Show zap and playlist features
  document.getElementById('zap-section')?.classList.remove('hidden');
  document.getElementById('playlist-section')?.classList.remove('hidden');
  document.getElementById('submit-track-section')?.classList.remove('hidden');
}

function updateUIAfterLogout() {
  const logBtn = document.querySelector('.log-btn');
  if (logBtn) {
    logBtn.textContent = 'log in';
    logBtn.onclick = loginWithNostr;
  }
  
  // Hide features
  document.getElementById('zap-section')?.classList.add('hidden');
  document.getElementById('playlist-section')?.classList.add('hidden');
  document.getElementById('submit-track-section')?.classList.add('hidden');
}

// Check for existing session on page load
window.addEventListener('DOMContentLoaded', () => {
  const stored = localStorage.getItem('nostr_user');
  if (stored) {
    window.currentUser = JSON.parse(stored);
    updateUIAfterLogin();
  }
});

// Add to nostr-auth.js

async function zapTrack(trackTitle, amountSats = 21) {
  if (!window.currentUser) {
    alert('Please log in first');
    return;
  }

  if (!window.nostr) {
    alert('Nostr extension not found');
    return;
  }

  try {
    // Get your Lightning address from your Nostr profile
    const yourPubkey = 'YOUR_NOSTR_PUBKEY_HERE';
    
    // Create zap request
    const zapRequest = {
      kind: 9734,
      content: `Zapped ${trackTitle}`,
      tags: [
        ['p', yourPubkey],
        ['amount', String(amountSats * 1000)], // millisats
        ['relays', 'wss://relay.damus.io']
      ],
      created_at: Math.floor(Date.now() / 1000)
    };

    const signedEvent = await window.nostr.signEvent(zapRequest);
    
    // Send to relay
    const relay = new WebSocket('wss://relay.damus.io');
    relay.onopen = () => {
      relay.send(JSON.stringify(['EVENT', signedEvent]));
      alert(`Zapped ${amountSats} sats!`);
      relay.close();
    };
  } catch (error) {
    console.error('Zap failed:', error);
    alert('Zap failed. Please try again.');
  }
}
// Make functions globally accessible
window.loginWithNostr = loginWithNostr;
window.logout = logout;
window.zapTrack = zapTrack;
window.currentUser = currentUser; // For access in other files

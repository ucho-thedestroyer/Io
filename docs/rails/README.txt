
1. Unzip this folder to your hosting directory (e.g., on IPFS, Vercel, Netlify, etc).
2. Make sure to update `app.js`:
   - Replace the mocked Lightning invoice generator with real LND REST calls authenticated by your macaroon.
   - Replace the Stacks payment simulation with real Stacks smart contract calls using `@stacks/connect`.
3. Optionally, upload your actual IPFS file and replace the href in the download button.
4. Host the `index.html` file from any static file server.

No backend is required beyond your LND node and deployed Stacks smart contract.

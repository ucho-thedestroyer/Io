
const downloadBtn = document.getElementById('download');
const payBtnLightning = document.getElementById('pay-lightning');
const payBtnStacks = document.getElementById('pay-stx');
const lnInvoiceDiv = document.getElementById('lnInvoice');

let hasAccess = false;

function unlockDownload() {
  if (hasAccess) return;
  hasAccess = true;
  downloadBtn.classList.add('enabled');
  downloadBtn.textContent = '✅ Download File';
}

// Mock functions for LND - Replace with your real API
async function createLightningInvoice() {
  return {
    payment_request: "lnbc10n1pnlf9k2dqdtfz425eq2pshjnp4qfqxwpsv5hyn08p3qctmusxvwfat24zuf36c7u8e02vufwp3zwnfwpp58969y497zxunarr4040deaumx4uxjna5r70tjderzmug28u4k7ussp5k2wke9tld3d05q9m2ywufc0j5906jf0v2h2jn2zxxlhskhnhf3fq9qyysgqcqpcxqyz5vqrzjqvdnqyc82a9maxu6c7mee0shqr33u4z9z04wpdwhf96gxzpln8jcrapyqqqqqqpvgyqqqqlgqqqp8zqq2qd04yy3j4waedpcrpy40t48uq5mk4h60hyacak90fpaq7dnqen4myz7ss4s8kwzw7w2p7qvefjlqvu5825j98u9hnuc8k7dr5rc384uqplzjq2x",
    payment_hash: "39745254be11b93e8c757d5edcf79b3578694fb41f9eb9372316f8851f95b7b9"
  };
}

async function checkLightningPayment(paymentHash) {
  // Simulate settled payment after delay
  setTimeout(() => unlockDownload(), 3000);
}

// Lightning Payment
payBtnLightning.onclick = async () => {
  const invoiceData = await createLightningInvoice();
  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = "";
  new QRCode(qrContainer, "lightning:" + invoiceData.payment_request);
  lnInvoiceDiv.style.display = "block";
  checkLightningPayment(invoiceData.payment_hash);
};

// Stacks integration
payBtnStacks.onclick = async () => {
  alert("Stacks payment simulation: Download unlocked.");
  unlockDownload();
};

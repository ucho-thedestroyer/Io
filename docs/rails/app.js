
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
    payment_request: "lnbc1...mockinvoice...",
    payment_hash: "mockhash123"
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

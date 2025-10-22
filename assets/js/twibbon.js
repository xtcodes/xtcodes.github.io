const canvas = document.getElementById('twibbonCanvas');
const ctx = canvas.getContext('2d');
let userImage = null;
let overlayImage = null;

const uploadInput = document.getElementById('uploadImage');
const dropArea = document.getElementById('dropArea');
const dropOverlay = document.getElementById('dropOverlay');
const alertBox = document.getElementById('alert'); // elemen teks alert

// --- Fungsi tampilkan pesan ---
function showAlert(message, type = "info") {
  const alertBox = document.getElementById("alert");
  if (!alertBox) return;

  // Hapus hanya class alert-type, tanpa reset ID
  alertBox.classList.remove("info", "success", "warning", "error", "show");

  alertBox.textContent = message;
  alertBox.classList.add(type, "show");

  clearTimeout(alertBox.timer);
  alertBox.timer = setTimeout(() => {
    alertBox.classList.remove("show");
  }, 3000);
}

// --- Fungsi Helper ---
function getSquareSize() {
  return dropArea.clientWidth; 
}

function toggleUploadState(enabled) {
  if (enabled) {
    dropOverlay.classList.remove('drop-disabled');
    dropOverlay.classList.add('drop-ready');
    setupDropListeners();
    dropArea.style.cursor = 'pointer';
  } else {
    dropOverlay.classList.add('drop-disabled');
    dropOverlay.classList.remove('drop-ready');
    removeDropListeners();
    dropArea.style.cursor = 'default';
  }
}

function drawCanvas() {
  if(!userImage) return setCanvasSize(); 

  const squareSize = getSquareSize();
  canvas.width = squareSize;
  canvas.height = squareSize;

  const scale = Math.max(squareSize / userImage.width, squareSize / userImage.height);
  const scaledWidth = userImage.width * scale;
  const scaledHeight = userImage.height * scale;
  const offsetX = (squareSize - scaledWidth) / 2;
  const offsetY = (squareSize - scaledHeight) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(userImage, offsetX, offsetY, scaledWidth, scaledHeight);

  if (overlayImage) {
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
  }

  toggleUploadState(false);
}

function setCanvasSize() {
  const squareSize = getSquareSize();
  canvas.width = squareSize;
  canvas.height = squareSize;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  toggleUploadState(true);
}

// --- Drag/Drop ---
function handleDragOver(e) {
  e.preventDefault(); 
  dropOverlay.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  dropOverlay.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  dropOverlay.classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (files.length > 0) processFile(files[0]);
}

function setupDropListeners() {
  removeDropListeners(); 
  dropArea.addEventListener('dragover', handleDragOver);
  dropArea.addEventListener('dragleave', handleDragLeave);
  dropArea.addEventListener('drop', handleDrop);
  document.body.addEventListener('dragover', (e) => e.preventDefault());
  document.body.addEventListener('drop', (e) => e.preventDefault());
}

function removeDropListeners() {
  dropArea.removeEventListener('dragover', handleDragOver);
  dropArea.removeEventListener('dragleave', handleDragLeave);
  dropArea.removeEventListener('drop', handleDrop);
}

// --- Proses File ---
function processFile(file) {
  if(!file || !file.type.startsWith('image/')) {
    showAlert("File harus berupa gambar!");
    return;
  }
  toggleUploadState(false); 

  const img = new Image();
  img.onload = () => {
    userImage = img;
    overlayImage = null; 
    drawCanvas();
    URL.revokeObjectURL(img.src); 
    showAlert("Gambar berhasil diunggah ✅", "#008000");
  };
  img.onerror = () => {
    userImage = null;
    setCanvasSize(); 
    showAlert("Gagal memuat gambar. Coba lagi.");
  };
  img.src = URL.createObjectURL(file);
}

// --- Event Upload ---
dropArea.addEventListener('click', () => {
  if (userImage === null) uploadInput.click();
});

uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(file) processFile(file);
  e.target.value = ''; 
});

// --- Tombol Twibbon ---
document.getElementById('btnTwibbon').addEventListener('click', ()=>{
  if(!userImage) return showMessage("Upload dulu gambar!");
  const overlay = new Image();
  overlay.crossOrigin = "Anonymous"; 
  overlay.onload = () => {
    overlayImage = overlay;
    drawCanvas();
    showAlert("Twibbon berhasil diterapkan ✅", "#008000");
  };
  overlay.src = '/assets/img/twibbon.png'; 
});

// --- Tombol Unduh (nama hosting + tanggal) ---
document.getElementById('btnDownload').addEventListener('click', ()=>{
  if (!userImage) return showMessage("Tidak ada gambar!");
  const hostname = window.location.hostname.replace(/^www\./, '') || 'twibbon';
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const filename = `${hostname}_${day}-${month}-${year}.png`;

  const link = document.createElement('a');
  try {
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showAlert(`Gambar diunduh: ${filename}`, "#008000");
  } catch (error) {
    console.error(error);
    showAlert("Gagal mengunduh gambar!");
  }
});

const canvas = document.getElementById('twibbonCanvas');
const ctx = canvas.getContext('2d');
let userImage = null;
let overlayImage = null;

const uploadInput = document.getElementById('uploadImage');
const dropArea = document.getElementById('dropArea');
const dropOverlay = document.getElementById('dropOverlay');
const alertBox = document.getElementById('alert'); // elemen teks alert

// --- Fungsi tampilkan pesan dinamis ---
function showAlert(message, type = "info") {
  const alertBox = document.getElementById("alert");
  alertBox.textContent = message;

  // reset semua kelas
  alertBox.className = "";
  alertBox.id = "alert";

  // tambahkan kelas sesuai tipe
  alertBox.classList.add("show", type);

  // hilang otomatis 3 detik
  setTimeout(() => {
    alertBox.classList.remove("show");
  }, 3000);
}

// --- Fungsi Helper ---
function getSquareSize() {
  return dropArea.clientWidth; 
}

function toggleUploadState(enabled) {
  if (enabled) {
    dropOverlay.classList.remove('drop-disabled');
    dropOverlay.classList.add('drop-ready');
    setupDropListeners();
    dropArea.style.cursor = 'pointer';
  } else {
    dropOverlay.classList.add('drop-disabled');
    dropOverlay.classList.remove('drop-ready');
    removeDropListeners();
    dropArea.style.cursor = 'default';
  }
}

function drawCanvas() {
  if(!userImage) return setCanvasSize(); 

  const squareSize = getSquareSize();
  canvas.width = squareSize;
  canvas.height = squareSize;

  const scale = Math.max(squareSize / userImage.width, squareSize / userImage.height);
  const scaledWidth = userImage.width * scale;
  const scaledHeight = userImage.height * scale;
  const offsetX = (squareSize - scaledWidth) / 2;
  const offsetY = (squareSize - scaledHeight) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(userImage, offsetX, offsetY, scaledWidth, scaledHeight);

  if (overlayImage) {
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
  }

  toggleUploadState(false);
}

function setCanvasSize() {
  const squareSize = getSquareSize();
  canvas.width = squareSize;
  canvas.height = squareSize;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  toggleUploadState(true);
}

// --- Drag/Drop ---
function handleDragOver(e) {
  e.preventDefault(); 
  dropOverlay.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  dropOverlay.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  dropOverlay.classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (files.length > 0) processFile(files[0]);
}

function setupDropListeners() {
  removeDropListeners(); 
  dropArea.addEventListener('dragover', handleDragOver);
  dropArea.addEventListener('dragleave', handleDragLeave);
  dropArea.addEventListener('drop', handleDrop);
  document.body.addEventListener('dragover', (e) => e.preventDefault());
  document.body.addEventListener('drop', (e) => e.preventDefault());
}

function removeDropListeners() {
  dropArea.removeEventListener('dragover', handleDragOver);
  dropArea.removeEventListener('dragleave', handleDragLeave);
  dropArea.removeEventListener('drop', handleDrop);
}

// --- Proses File ---
function processFile(file) {
  if(!file || !file.type.startsWith('image/')) {
    showAlert("File harus berupa gambar!", "warning");
    return;
  }
  toggleUploadState(false); 

  const img = new Image();
  img.onload = () => {
    userImage = img;
    overlayImage = null; 
    drawCanvas();
    URL.revokeObjectURL(img.src); 
    showAlert("Gambar berhasil diunggah ✅", "success");
  };
  img.onerror = () => {
    userImage = null;
    setCanvasSize(); 
    showAlert("Gagal memuat gambar. Coba lagi.", "error");
  };
  img.src = URL.createObjectURL(file);
}

// --- Event Upload ---
dropArea.addEventListener('click', () => {
  if (userImage === null) uploadInput.click();
});

uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(file) processFile(file);
  e.target.value = ''; 
});

// --- Tombol Twibbon ---
document.getElementById('btnTwibbon').addEventListener('click', ()=>{
  if(!userImage) return showAlert("Upload dulu gambar!", "warning");
  const overlay = new Image();
  overlay.crossOrigin = "Anonymous"; 
  overlay.onload = () => {
    overlayImage = overlay;
    drawCanvas();
    showAlert("Twibbon berhasil diterapkan ✅", "success");
  };
  overlay.src = '/assets/img/twibbon.png'; 
});

// --- Tombol Unduh (nama hosting + tanggal) ---
document.getElementById('btnDownload').addEventListener('click', ()=>{
  if (!userImage) return showAlert("Tidak ada gambar!", "warning");
  const hostname = window.location.hostname.replace(/^www\./, '') || 'twibbon';
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const filename = `${hostname}_${day}-${month}-${year}.png`;

  const link = document.createElement('a');
  try {
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showAlert(`Gambar diunduh: ${filename}`, "success");
  } catch (error) {
    console.error(error);
    showAlert("Gagal mengunduh gambar!", "error");
  }
});

// --- Tombol Bagikan (Web Share API) ---
document.getElementById('btnShare').addEventListener('click', async ()=>{
  if (!userImage) return showAlert("Tidak ada gambar!", "warning");

  try {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    const file = new File([blob], 'twibbon.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Twibbon Saya 🎉',
        text: 'Lihat hasil twibbon saya!',
        files: [file],
      });
      showAlert("Berhasil dibagikan 🎉", "success");
    } else {
      showAlert("Browser tidak mendukung fitur berbagi file ini.", "info");
    }
  } catch (error) {
    console.error(error);
    showAlert("Gagal membagikan gambar!", "error");
  }
});

// --- Resize Responsif ---
window.addEventListener('resize', () => setCanvasSize());

// --- Inisialisasi Awal ---
setCanvasSize();


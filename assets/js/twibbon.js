const canvas = document.getElementById('twibbonCanvas');
const ctx = canvas.getContext('2d');
let userImage = null;
let overlayImage = null;

const uploadInput = document.getElementById('uploadImage');
const dropArea = document.getElementById('dropArea');
const dropOverlay = document.getElementById('dropOverlay');

// --- Fungsi Helper ---

// Tentukan ukuran SISI persegi: Ambil ukuran visual aktual dari elemen dropArea (piksel)
function getSquareSize() {
  // clientWidth memberikan lebar area visual yang ditentukan oleh CSS
  return dropArea.clientWidth; 
}

// Mengaktifkan atau menonaktifkan drop area
function toggleUploadState(enabled) {
    if (enabled) {
        // Aktifkan upload: tampilkan overlay, border 'drop-ready', dan pasang listeners
        dropOverlay.classList.remove('drop-disabled');
        dropOverlay.classList.add('drop-ready');
        setupDropListeners();
        dropArea.style.cursor = 'pointer';
    } else {
        // Nonaktifkan upload: sembunyikan overlay, hapus border, dan hapus listeners
        dropOverlay.classList.add('drop-disabled');
        dropOverlay.classList.remove('drop-ready');
        removeDropListeners();
        dropArea.style.cursor = 'default';
    }
}

// Fungsi draw (memaksa 1:1 dan gambar menggunakan metode "cover")
function drawCanvas() {
  if(!userImage) return setCanvasSize(); 

  const squareSize = getSquareSize();

  // 1. Atur dimensi internal canvas (PIKSEL) diatur berdasarkan ukuran visual
  canvas.width = squareSize;
  canvas.height = squareSize;

  // 2. Hitung skala dan posisi untuk menggambar gambar (metode "cover")
  const scale = Math.max(squareSize / userImage.width, squareSize / userImage.height);
  
  const scaledWidth = userImage.width * scale;
  const scaledHeight = userImage.height * scale;
  
  const offsetX = (squareSize - scaledWidth) / 2;
  const offsetY = (squareSize - scaledHeight) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(userImage, offsetX, offsetY, scaledWidth, scaledHeight);

  if(overlayImage){
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
  }
  
  toggleUploadState(false);
}

// Tentukan ukuran canvas (selalu 1:1) saat pertama kali atau tidak ada gambar
function setCanvasSize() {
  const squareSize = getSquareSize();
  
  if(!userImage){
    // Atur canvas ke ukuran persegi yang dibaca dari CSS
    canvas.width = squareSize;
    canvas.height = squareSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    toggleUploadState(true); // Aktifkan drop area
  } else {
    drawCanvas();
  }
}


// --- Handler Drag/Drop ---

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
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// Pasang listeners
function setupDropListeners() {
    removeDropListeners(); 
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    document.body.addEventListener('dragover', (e) => e.preventDefault());
    document.body.addEventListener('drop', (e) => e.preventDefault());
}

// Hapus listeners
function removeDropListeners() {
    dropArea.removeEventListener('dragover', handleDragOver);
    dropArea.removeEventListener('dragleave', handleDragLeave);
    dropArea.removeEventListener('drop', handleDrop);
}

// --- Logika Pemrosesan File ---

function processFile(file) {
    if(!file || !file.type.startsWith('image/')) return;
    
    toggleUploadState(false); 

    const img = new Image();
    img.onload = () => {
        userImage = img;
        overlayImage = null; 
        drawCanvas();
        URL.revokeObjectURL(img.src); 
    }
    img.onerror = () => {
        alert("Gagal memuat gambar. Coba lagi.");
        userImage = null;
        setCanvasSize(); 
    }
    img.src = URL.createObjectURL(file);
}

// --- Event Listener Utama ---

// Trigger input file saat drop area diklik, hanya jika belum ada gambar
dropArea.addEventListener('click', () => {
    if (userImage === null) {
        uploadInput.click();
    }
});

// Tangani perubahan dari input file yang tersembunyi
uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(file) processFile(file);
    e.target.value = ''; // Reset input
});


// Pasang twibbon
document.getElementById('btnTwibbon').addEventListener('click', ()=>{
  if(!userImage) return alert("Upload dulu gambar!");
  const overlay = new Image();
  overlay.crossOrigin = "Anonymous"; 
  overlay.onload = () => {
    overlayImage = overlay;
    drawCanvas();
  }
  overlay.src = '/assets/img/twibbon.png'; 
});

// Unduh
document.getElementById('btnDownload').addEventListener('click', ()=>{
  if(!userImage) return alert("Tidak ada gambar!");
  const link = document.createElement('a');
  link.download = 'twibbon.png';
  try {
      link.href = canvas.toDataURL('image/png');
      link.click();
  } catch (error) {
      alert("Gagal mengunduh. Pastikan gambar twibbon dimuat dari sumber yang sama.");
      console.error(error);
  }
});

// Bagikan
document.getElementById('btnShare').addEventListener('click', ()=>{
  if(!userImage) return alert("Tidak ada gambar!");
  try {
      const url = canvas.toDataURL('image/png');
      prompt("Salin Base64 string ini:", url);
  } catch (error) {
      alert("Gagal membuat link. Pastikan gambar twibbon dimuat dari sumber yang sama.");
  }
});

// Responsive saat resize
window.addEventListener('resize', () => {
  setCanvasSize(); 
});

// Panggil saat halaman dimuat untuk inisialisasi awal
setCanvasSize();

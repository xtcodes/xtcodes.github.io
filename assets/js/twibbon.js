const canvas = document.getElementById('twibbonCanvas');
const ctx = canvas.getContext('2d');
let userImage = null;
let overlayImage = null;

// Ambil elemen baru
const uploadInput = document.getElementById('uploadImage');
const dropArea = document.getElementById('dropArea');
const dropOverlay = document.getElementById('dropOverlay');

// --- Fungsi Helper ---

// Tentukan ukuran SISI persegi maksimum yang diizinkan
function getSquareSize() {
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.6;
  return Math.min(maxWidth, maxHeight);
}

// Mengaktifkan atau menonaktifkan drop area
function toggleUploadState(enabled) {
    if (enabled) {
        // Aktifkan upload: tampilkan overlay dan pasang listeners
        dropOverlay.classList.remove('drop-disabled');
        setupDropListeners();
        dropArea.style.cursor = 'pointer';
    } else {
        // Nonaktifkan upload: sembunyikan overlay dan hapus listeners
        dropOverlay.classList.add('drop-disabled');
        removeDropListeners();
        dropArea.style.cursor = 'default';
    }
}

// Fungsi draw (memaksa 1:1 dan gambar menggunakan metode "cover")
function drawCanvas() {
  if(!userImage) return setCanvasSize(); 

  const squareSize = getSquareSize();

  // 1. Atur dimensi internal canvas (piksel) agar selalu persegi (1:1)
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
}

// Tentukan ukuran canvas (selalu 1:1) saat pertama kali atau tidak ada gambar
function setCanvasSize() {
  const squareSize = getSquareSize();
  
  if(!userImage){
    // Atur canvas ke ukuran persegi maksimum
    canvas.width = squareSize;
    canvas.height = squareSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    toggleUploadState(true); // Aktifkan drop area
  } else {
    drawCanvas();
    toggleUploadState(false); // Nonaktifkan drop area
  }
}


// --- Handler Drag/Drop ---

function handleDragOver(e) {
    e.preventDefault(); // Diperlukan untuk memungkinkan drop
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

function setupDropListeners() {
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    // Hindari drop pada body/window
    document.body.addEventListener('dragover', (e) => e.preventDefault(), false);
    document.body.addEventListener('drop', (e) => e.preventDefault(), false);
}

function removeDropListeners() {
    dropArea.removeEventListener('dragover', handleDragOver);
    dropArea.removeEventListener('dragleave', handleDragLeave);
    dropArea.removeEventListener('drop', handleDrop);
}

// --- Logika Pemrosesan File ---

function processFile(file) {
    if(!file || !file.type.startsWith('image/')) return;
    
    // Matikan interaksi sementara untuk menghindari unggahan ganda
    toggleUploadState(false); 

    const img = new Image();
    img.onload = () => {
        userImage = img;
        overlayImage = null; // Reset overlay
        drawCanvas();
        // toggleUploadState(false) dipanggil di drawCanvas/setCanvasSize, 
        // tapi pastikan sekali lagi di sini jika ada masalah
        toggleUploadState(false); 
        URL.revokeObjectURL(img.src); // Bersihkan memori
    }
    img.onerror = () => {
        alert("Gagal memuat gambar. Coba lagi.");
        userImage = null;
        setCanvasSize(); // Kembali ke kondisi awal, mengaktifkan drop area
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
  setCanvasSize(); // setCanvasSize akan memanggil drawCanvas jika userImage ada
});

// Panggil saat halaman dimuat untuk inisialisasi awal
setCanvasSize();

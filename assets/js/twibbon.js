const canvas = document.getElementById('twibbonCanvas');
const ctx = canvas.getContext('2d');
let userImage = null;
let overlayImage = null;

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
        // Aktifkan upload: tampilkan overlay, border 'drop-ready', dan pasang listeners
        dropOverlay.classList.remove('drop-disabled');
        dropOverlay.classList.add('drop-ready');
        setupDropListeners();
        dropArea.style.cursor = 'pointer';
    } else {
        // Nonaktifkan upload: sembunyikan overlay, hapus border, dan hapus listeners
        dropOverlay.classList.add('drop-disabled');
        dropOverlay.classList.remove('drop-ready');
        removeDropListeners(); // Hanya hapus listeners saat disabled
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
    // Gambar overlayImage di atas
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
  }
  
  // Matikan drop area setelah gambar berhasil digambar
  toggleUploadState(false);
}

// Tentukan ukuran canvas (selalu 1:1) saat pertama kali atau tidak ada gambar
function setCanvasSize() {
  const squareSize = getSquareSize();
  
  if(!userImage){
    // Atur canvas ke ukuran persegi maksimum
    canvas.width = squareSize;
    canvas.height = squareSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Tambahkan background putih polos agar overlay terlihat jelas
    ctx.fillStyle = '#fff'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    toggleUploadState(true); // Aktifkan drop area
  } else {
    drawCanvas();
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

// Pasang listeners
function setupDropListeners() {
    // Hapus dulu untuk mencegah duplikasi jika dipanggil berkali-kali
    removeDropListeners(); 
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    // Tambahkan event untuk mencegah drop default pada seluruh window
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
    
    // Matikan interaksi drop sementara saat memuat gambar
    toggleUploadState(false); 

    const img = new Image();
    img.onload = () => {
        userImage = img;
        overlayImage = null; // Reset overlay
        drawCanvas();
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
    e.target.value = ''; // Reset input agar event 'change' dapat dipicu lagi dengan file yang sama
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
  // Ganti dengan path twibbon yang benar
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
  setCanvasSize(); // setCanvasSize akan memastikan ukuran canvas dan status drop area
});

// Panggil saat halaman dimuat untuk inisialisasi awal
setCanvasSize();

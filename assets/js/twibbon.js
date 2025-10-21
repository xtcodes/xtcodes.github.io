const canvas = document.getElementById('twibbonCanvas');
const ctx = canvas.getContext('2d');
let userImage = null;
let overlayImage = null;

// --- FUNGSI PERBAIKAN UTAMA: MEMAKSA KANVAS 1:1 ---

// Tentukan ukuran KANVAS harus selalu 1:1 dan responsif
function setCanvasSize() {
  // 1. Tentukan batas maksimum kanvas (misalnya 90% dari viewport)
  // Anda bisa menyesuaikan angka 0.9 ini
  const maxContainerWidth = window.innerWidth * 0.9;
  const maxContainerHeight = window.innerHeight * 0.9;
  
  // 2. Ambil ukuran yang paling kecil agar kanvas persegi muat di layar
  const size = Math.min(maxContainerWidth, maxContainerHeight);

  canvas.width = size;
  canvas.height = size; // Kanvas selalu berbentuk persegi (1:1)
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Jika tidak ada gambar, berikan latar belakang default
  if (!userImage) {
    ctx.fillStyle = '#f0f0f0'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// Fungsi draw, memaksa gambar masuk ke kanvas 1:1 dengan 'cover'
function drawCanvas() {
  setCanvasSize(); // Panggil ini untuk memastikan ukuran kanvas 1:1

  if (!userImage) return;

  const canvasSize = canvas.width;

  // --- Logika untuk meniru object-fit: cover ---
  let sx, sy, sWidth, sHeight; // Variabel untuk gambar SUMBER (userImage)

  const imgRatio = userImage.width / userImage.height;
  const canvasRatio = 1; 

  if (imgRatio > canvasRatio) {
    // Gambar Lanskap (lebih lebar dari 1:1) -> Crop SISI KIRI/KANAN
    sHeight = userImage.height;
    sWidth = sHeight * canvasRatio; 
    sx = (userImage.width - sWidth) / 2; // Pusatkan crop
    sy = 0;
  } else {
    // Gambar Potret (lebih tinggi dari 1:1) -> Crop SISI ATAS/BAWAH
    sWidth = userImage.width;
    sHeight = sWidth / canvasRatio; 
    sx = 0;
    sy = (userImage.height - sHeight) / 2; // Pusatkan crop
  }

  // 1. Gambar hasil crop (SUMBER) ke seluruh area kanvas (TUJUAN)
  ctx.clearRect(0, 0, canvasSize, canvasSize); 
  ctx.drawImage(userImage, sx, sy, sWidth, sHeight, 0, 0, canvasSize, canvasSize);

  // 2. Gambar overlay (twibbon)
  if (overlayImage) {
    // Gambar overlay selalu mengisi penuh kanvas 1:1
    ctx.drawImage(overlayImage, 0, 0, canvasSize, canvasSize);
  }
}

// --- FUNGSI LAINNYA TIDAK BERUBAH SIGNIFICAN ---

// Upload gambar
document.getElementById('uploadImage').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    userImage = img;
    overlayImage = null;
    drawCanvas();
  }
  img.src = URL.createObjectURL(file);
});

// Pasang twibbon
document.getElementById('btnTwibbon').addEventListener('click', () => {
  if (!userImage) return alert("Upload dulu gambar!");
  const overlay = new Image();
  overlay.onload = () => {
    overlayImage = overlay;
    drawCanvas();
  }
  overlay.src = '/assets/img/twibbon.png';
});

// Unduh
document.getElementById('btnDownload').addEventListener('click', () => {
  if (!userImage) return alert("Tidak ada gambar!");
  const link = document.createElement('a');
  link.download = 'twibbon.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Bagikan
document.getElementById('btnShare').addEventListener('click', () => {
  if (!userImage) return alert("Tidak ada gambar!");
  const url = canvas.toDataURL('image/png');
  prompt("Salin link ini:", url);
});

// Responsive saat resize
window.addEventListener('resize', () => {
  drawCanvas(); // Cukup panggil drawCanvas, karena di dalamnya memanggil setCanvasSize
});

// Panggil sekali saat halaman dimuat
setCanvasSize();

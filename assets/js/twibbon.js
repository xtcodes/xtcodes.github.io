const canvas = document.getElementById('twibbonCanvas');
const ctx = canvas.getContext('2d');
let userImage = null;
let overlayImage = null;

// Tentukan ukuran KANVAS harus selalu 1:1 sesuai ukuran visual wrapper
function setCanvasSize() {
  // Ambil elemen wrapper HTML (yang sudah diatur 1:1 oleh CSS)
  const wrapper = canvas.parentElement; 
  // Ambil lebar yang *benar-benar dihitung* oleh browser/CSS
  const size = wrapper.offsetWidth; 
  
  // Set ukuran kanvas internal (resolusi piksel) menjadi 1:1
  canvas.width = size;
  canvas.height = size; 
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (!userImage) {
    ctx.fillStyle = '#f0f0f0'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// Fungsi draw, memaksa gambar masuk ke kanvas 1:1 dengan 'cover'
function drawCanvas() {
  setCanvasSize(); // Panggil ini untuk memastikan ukuran kanvas 1:1 sudah benar

  if (!userImage) return;

  const canvasSize = canvas.width;

  // --- Logika untuk meniru object-fit: cover ---
  let sx, sy, sWidth, sHeight; // Variabel untuk gambar SUMBER (userImage)

  const imgRatio = userImage.width / userImage.height;
  const canvasRatio = 1; 

  if (imgRatio > canvasRatio) {
    // Gambar Lanskap -> Crop SISI KIRI/KANAN
    sHeight = userImage.height;
    sWidth = sHeight * canvasRatio; 
    sx = (userImage.width - sWidth) / 2; 
    sy = 0;
  } else {
    // Gambar Potret -> Crop SISI ATAS/BAWAH
    sWidth = userImage.width;
    sHeight = sWidth / canvasRatio; 
    sx = 0;
    sy = (userImage.height - sHeight) / 2; 
  }

  // 1. Gambar hasil crop (SUMBER) ke seluruh area kanvas (TUJUAN)
  ctx.clearRect(0, 0, canvasSize, canvasSize); 
  ctx.drawImage(userImage, sx, sy, sWidth, sHeight, 0, 0, canvasSize, canvasSize);

  // 2. Gambar overlay (twibbon)
  if (overlayImage) {
    ctx.drawImage(overlayImage, 0, 0, canvasSize, canvasSize);
  }
}

// --- FUNGSI EVENT LISTENERS (Tidak berubah dari sebelumnya) ---

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
  drawCanvas(); 
});

// Panggil sekali saat halaman dimuat
setCanvasSize();

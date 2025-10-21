const canvas = document.getElementById('twibbonCanvas');
const ctx = canvas.getContext('2d');
let userImage = null;
let overlayImage = null;

// Tentukan ukuran SISI persegi maksimum yang diizinkan
function getSquareSize() {
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.6;
  return Math.min(maxWidth, maxHeight);
}

// Tentukan ukuran canvas (selalu 1:1) saat pertama kali atau tidak ada gambar
function setCanvasSize() {
  const squareSize = getSquareSize();
  
  if(!userImage){
    // Atur canvas ke ukuran persegi maksimum
    canvas.width = squareSize;
    canvas.height = squareSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Teks placeholder opsional
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Unggah Gambar di Sini', squareSize / 2, squareSize / 2);
  } else {
    // Jika sudah ada gambar, panggil drawCanvas untuk mengatur ulang ukuran dan menggambar
    drawCanvas();
  }
}

// Fungsi draw (memaksa 1:1 dan gambar menggunakan metode "cover")
function drawCanvas() {
  if(!userImage) return setCanvasSize(); // Jika userImage hilang, kembali ke default

  const squareSize = getSquareSize();

  // 1. Atur dimensi internal canvas (piksel) agar selalu persegi (1:1)
  canvas.width = squareSize;
  canvas.height = squareSize;

  // 2. Hitung skala dan posisi untuk menggambar gambar (metode "cover")
  // Faktor skala terbesar (max) memastikan gambar memenuhi seluruh canvas, sehingga terjadi cropping
  const scale = Math.max(squareSize / userImage.width, squareSize / userImage.height);
  
  const scaledWidth = userImage.width * scale;
  const scaledHeight = userImage.height * scale;
  
  // Hitung offset agar gambar terpusat
  const offsetX = (squareSize - scaledWidth) / 2;
  const offsetY = (squareSize - scaledHeight) / 2;

  // Hapus canvas sebelumnya
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Gambar userImage (terpusat dan cover)
  // drawImage(image, dx, dy, dWidth, dHeight)
  ctx.drawImage(userImage, offsetX, offsetY, scaledWidth, scaledHeight);

  // Gambar overlayImage
  if(overlayImage){
    // drawImage(image, dx, dy, dWidth, dHeight)
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
  }
}

// Upload gambar
document.getElementById('uploadImage').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const img = new Image();
  img.onload = () => {
    userImage = img;
    overlayImage = null; // Reset overlay saat gambar baru diunggah
    drawCanvas(); // Gambar dengan gambar baru
  }
  img.src = URL.createObjectURL(file);
});

// Pasang twibbon
document.getElementById('btnTwibbon').addEventListener('click', ()=>{
  if(!userImage) return alert("Upload dulu gambar!");
  // Asumsi: Anda memiliki '/assets/img/twibbon.png'
  const overlay = new Image();
  overlay.crossOrigin = "Anonymous"; // Penting untuk mencegah masalah CORS saat toDataURL
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
  // Penting: Pastikan gambar twibbon (overlay) dimuat dari domain yang sama
  // atau disajikan dengan header CORS yang benar, jika tidak toDataURL akan gagal.
  try {
      link.href = canvas.toDataURL('image/png');
      link.click();
  } catch (error) {
      alert("Gagal mengunduh. Pastikan gambar twibbon dimuat dari sumber yang aman.");
      console.error(error);
  }
});

// Bagikan
document.getElementById('btnShare').addEventListener('click', ()=>{
  if(!userImage) return alert("Tidak ada gambar!");
  // Untuk fungsionalitas share yang sebenarnya, Anda mungkin perlu mengunggah 
  // gambar ke server terlebih dahulu dan mendapatkan URL publik.
  // Prompt ini hanya untuk demonstrasi base64 string.
  try {
      const url = canvas.toDataURL('image/png');
      prompt("Salin Base64 string ini:", url);
  } catch (error) {
      alert("Gagal membuat link. Pastikan gambar twibbon dimuat dari sumber yang aman.");
  }
});

// Responsive saat resize
window.addEventListener('resize', () => {
  drawCanvas();
});

// Panggil saat halaman dimuat
setCanvasSize();

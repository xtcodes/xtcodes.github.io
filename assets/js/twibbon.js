const canvas = document.getElementById('twibbonCanvas');
const ctx = canvas.getContext('2d');
let userImage = null;
let overlayImage = null;

// Fungsi draw gambar dan overlay proporsional
function drawCanvas() {
  if(!userImage) return;

  // Tentukan ukuran maksimum canvas
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.6;

  // Hitung rasio proporsional
  const widthRatio = maxWidth / userImage.width;
  const heightRatio = maxHeight / userImage.height;
  const scale = Math.min(widthRatio, heightRatio, 1);

  // Set ukuran canvas
  canvas.width = userImage.width * scale;
  canvas.height = userImage.height * scale;

  // Draw base image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(userImage, 0, 0, canvas.width, canvas.height);

  // Draw overlay jika sudah ada
  if(overlayImage){
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
  }
}

// Upload gambar pengguna
document.getElementById('uploadImage').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const img = new Image();
  img.onload = () => {
    userImage = img;
    overlayImage = null; // reset overlay
    drawCanvas();
  }
  img.src = URL.createObjectURL(file);
});

// Pasang twibbon (overlay)
document.getElementById('btnTwibbon').addEventListener('click', ()=>{
  if(!userImage) return alert("Upload dulu gambar!");
  const overlay = new Image();
  overlay.onload = () => {
    overlayImage = overlay;
    drawCanvas();
  }
  overlay.src = '/assets/img/twibbon.png'; // ganti path sesuai folder
});

// Unduh hasil
document.getElementById('btnDownload').addEventListener('click', ()=>{
  if(!userImage) return alert("Tidak ada gambar untuk diunduh!");
  const link = document.createElement('a');
  link.download = 'twibbon.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Bagikan (salin URL gambar)
document.getElementById('btnShare').addEventListener('click', ()=>{
  if(!userImage) return alert("Tidak ada gambar untuk dibagikan!");
  const url = canvas.toDataURL('image/png');
  prompt("Salin link ini:", url);
});

// Responsive saat resize layar
window.addEventListener('resize', () => {
  drawCanvas();
});

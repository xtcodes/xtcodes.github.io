const canvas = document.getElementById('twibbonCanvas');
const ctx = canvas.getContext('2d');
let userImage = null;
let overlayImage = null;

// Tentukan ukuran canvas responsive
function setCanvasSize() {
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.6;

  // Kalau tidak ada gambar, default
  if(!userImage){
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }
}

// Fungsi draw proporsional
function drawCanvas() {
  if(!userImage) return;

  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.6;

  // Rasio proporsional
  const imgRatio = userImage.width / userImage.height;
  const maxRatio = maxWidth / maxHeight;

  let drawWidth, drawHeight;

  if(imgRatio > maxRatio){
    // Landscape → width penuh
    drawWidth = maxWidth;
    drawHeight = drawWidth / imgRatio;
  } else {
    // Portrait → height penuh
    drawHeight = maxHeight;
    drawWidth = drawHeight * imgRatio;
  }

  canvas.width = drawWidth;
  canvas.height = drawHeight;

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(userImage, 0, 0, canvas.width, canvas.height);

  if(overlayImage){
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
    overlayImage = null;
    drawCanvas();
  }
  img.src = URL.createObjectURL(file);
});

// Pasang twibbon
document.getElementById('btnTwibbon').addEventListener('click', ()=>{
  if(!userImage) return alert("Upload dulu gambar!");
  const overlay = new Image();
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
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Bagikan
document.getElementById('btnShare').addEventListener('click', ()=>{
  if(!userImage) return alert("Tidak ada gambar!");
  const url = canvas.toDataURL('image/png');
  prompt("Salin link ini:", url);
});

// Responsive saat resize
window.addEventListener('resize', () => {
  drawCanvas();
});

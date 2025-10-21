const canvas = document.getElementById('twibbonCanvas');
const ctx = canvas.getContext('2d');
let userImage = null;

// Upload gambar
document.getElementById('uploadImage').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    userImage = img;
  }
  img.src = URL.createObjectURL(file);
});

// Pasang twibbon (contoh overlay transparan)
document.getElementById('btnTwibbon').addEventListener('click', ()=>{
  if(!userImage) return alert("Upload dulu gambar!");
  const overlay = new Image();
  overlay.onload = () => {
    ctx.drawImage(userImage, 0, 0); // redraw base
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
  }
  overlay.src = '/assets/img/twibbon.png'; // taruh twibbon di folder assets/img/
});

// Unduh hasil
document.getElementById('btnDownload').addEventListener('click', ()=>{
  const link = document.createElement('a');
  link.download = 'twibbon.png';
  link.href = canvas.toDataURL();
  link.click();
});

// Bagikan (contoh: copy URL)
document.getElementById('btnShare').addEventListener('click', ()=>{
  const url = canvas.toDataURL();
  prompt("Salin link ini:", url);
});

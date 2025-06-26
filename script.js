const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let flowField = [];
let particles = [];

const image = new Image();
image.src = "img/art1.jpg";

image.onload = () => {
  // Draw the image off-screen
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  tempCtx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

  const grayscale = getGrayscale(imageData);
  const edges = applySobel(grayscale, canvas.width, canvas.height);
  flowField = buildVectorField(edges, canvas.width, canvas.height);

  initParticles();
  animate();
};

function getGrayscale(imgData) {
  const gray = new Float32Array(imgData.width * imgData.height);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const r = imgData.data[i];
    const g = imgData.data[i + 1];
    const b = imgData.data[i + 2];
    gray[i / 4] = (r + g + b) / 3;
  }
  return gray;
}

function applySobel(gray, width, height) {
  const sobel = new Array(width * height).fill(0);
  const gxKernel = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gyKernel = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const val = gray[(y + ky) * width + (x + kx)];
          const kernelIndex = (ky + 1) * 3 + (kx + 1);
          gx += gxKernel[kernelIndex] * val;
          gy += gyKernel[kernelIndex] * val;
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      sobel[y * width + x] = magnitude;
    }
  }
  return sobel;
}

function buildVectorField(edgeMap, width, height) {
  const field = [];
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const index = y * width + x;
      const brightness = edgeMap[index];
      if (brightness > 50) {
        const angle = Math.random() * 2 * Math.PI;
        const vx = Math.cos(angle);
        const vy = Math.sin(angle);
        field.push({ x, y, vx, vy });
      }
    }
  }
  return field;
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 3000; i++) {
    const p = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      history: [],
      maxLength: Math.floor(Math.random() * 50 + 20)
    };
    particles.push(p);
  }
}

function animate() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    const field = getFlowAt(p.x, p.y);
    if (field) {
      p.x += field.vx;
      p.y += field.vy;
      p.history.push({ x: p.x, y: p.y });
      if (p.history.length > p.maxLength) p.history.shift();
    }

    drawTrail(p);
  });

  requestAnimationFrame(animate);
}

function getFlowAt(x, y) {
  return flowField.find(
    v =>
      Math.abs(v.x - x) < 4 &&
      Math.abs(v.y - y) < 4
  );
}

function drawTrail(p) {
  if (p.history.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(p.history[0].x, p.history[0].y);
  for (let i = 1; i < p.history.length; i++) {
    ctx.lineTo(p.history[i].x, p.history[i].y);
  }
  ctx.strokeStyle = "white";
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

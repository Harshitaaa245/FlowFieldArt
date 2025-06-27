const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let flowField = [];
let particles = [];

const image = new Image();
image.src = "img/art1.jpg";

image.onload = () => {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  tempCtx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

  const grayscale = getGrayscale(imageData);
  const { magnitude, gxArr, gyArr } = applySobel(grayscale, canvas.width, canvas.height);
  flowField = buildVectorField(magnitude, gxArr, gyArr, canvas.width, canvas.height);

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
    const magnitude = new Array(width * height).fill(0);
    const gxArr = new Array(width * height).fill(0);
    const gyArr = new Array(width * height).fill(0);

    const gxKernel = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const gyKernel = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const val = gray[(y + ky) * width + (x + kx)];
            const k = (ky + 1) * 3 + (kx + 1);
            gx += gxKernel[k] * val;
            gy += gyKernel[k] * val;
          }
        }

        const i = y * width + x;
        magnitude[i] = Math.sqrt(gx * gx + gy * gy);
        gxArr[i] = gx;
        gyArr[i] = gy;
      }
    }

    return { magnitude, gxArr, gyArr };
  }



function buildVectorField(magnitude, gxArr, gyArr, width, height) {
  const field = [];
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const index = y * width + x;
      const mag = magnitude[index];
      if (mag > 50) {
        const gx = gxArr[index];
        const gy = gyArr[index];
        const len = Math.sqrt(gx * gx + gy * gy);
        if (len > 0) {
          const vx = -gy / len; // Perpendicular for flow-along-edge
          const vy = gx / len;
          field.push({ x, y, vx, vy });
        }
      }
    }
  }
  return field;
}




function initParticles() {
  particles = [];
  for (let i = 0; i < flowField.length; i++) {
    const base = flowField[i];
    for (let j = 0; j < 2; j++) {  // 2 particles per field point
      const p = {
        x: base.x + Math.random() * 4 - 2,
        y: base.y + Math.random() * 4 - 2,
        vx: 0,
        vy: 0,
        history: [],
        maxLength: Math.floor(Math.random() * 40 + 20),
      };
      particles.push(p);
    }
  }
}



function animate() {
  
  ctx.fillStyle = "rgba(0, 0, 0, 0.07)";

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    const field = getFlowAt(p.x, p.y);
    if (field) {
      p.vx += field.vx * 0.5;  // Add flow
      p.vy += field.vy * 0.5;

      // Apply friction
      p.vx *= 0.95;
      p.vy *= 0.95;

      p.x += p.vx;
      p.y += p.vy;

      p.history.push({ x: p.x, y: p.y });
      if (p.history.length > p.maxLength) p.history.shift();

      drawTrail(p);
    } else {
      // Respawn if particle is lost or outside canvas
      const random = flowField[Math.floor(Math.random() * flowField.length)];
      p.x = random.x + Math.random() * 4 - 2;
      p.y = random.y + Math.random() * 4 - 2;
      p.vx = 0;
      p.vy = 0;
      p.history = [];
    }
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
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 0.6;
  ctx.shadowColor = 'white';
  ctx.shadowBlur = 2;
  ctx.stroke();
}

const imgElement = document.getElementById('sourceImage');
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

imgElement.onload = () => {
  const src = cv.imread(imgElement);
  const gray = new cv.Mat();
  const edges = new cv.Mat();
  const gradX = new cv.Mat();
  const gradY = new cv.Mat();

  // Convert to grayscale
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  // Edge detection
  cv.Canny(gray, edges, 50, 150);

  // Sobel gradient
  cv.Sobel(gray, gradX, cv.CV_64F, 1, 0, 3);
  cv.Sobel(gray, gradY, cv.CV_64F, 0, 1, 3);

  // Extract edge pixels and their gradient angle
  const edgePoints = [];
  for (let y = 0; y < edges.rows; y += 2) {
    for (let x = 0; x < edges.cols; x += 2) {
      if (edges.ucharPtr(y, x)[0] > 0) {
        const dx = gradX.doubleAt(y, x);
        const dy = gradY.doubleAt(y, x);
        const angle = Math.atan2(dy, dx);
        edgePoints.push({
          x: x * (canvas.width / edges.cols),
          y: y * (canvas.height / edges.rows),
          angle
        });
      }
    }
  }

  // Clean up
  src.delete(); gray.delete(); edges.delete(); gradX.delete(); gradY.delete();

  // Launch particles
  startParticles(edgePoints);
};

function startParticles(edgePoints) {
  const particles = [];

  for (let i = 0; i < 1000; i++) {
    const p = edgePoints[Math.floor(Math.random() * edgePoints.length)];
    if (p) {
      particles.push(new Particle(p.x, p.y, p.angle));
    }
  }

  function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let p of particles) {
      p.update();
      p.draw(ctx);
    }

    requestAnimationFrame(animate);
  }

  animate();
}

class Particle {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.history = [{ x, y }];
    this.maxLength = 20;
  }

  update() {
    const speed = 1.2;
    this.x += Math.cos(this.angle) * speed;
    this.y += Math.sin(this.angle) * speed;
    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > this.maxLength) this.history.shift();
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.history[0].x, this.history[0].y);
    for (let point of this.history) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 0.3;
    ctx.stroke();
  }
}



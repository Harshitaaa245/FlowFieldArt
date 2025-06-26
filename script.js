const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// canvas settings
ctx.fillStyle = 'white';
ctx.strokeStyle = 'white';
ctx.lineWidth = 1;

class Particle {
  constructor(effect, x, y) {
    this.effect = effect;
    this.originX = x;
    this.originY = y;
    this.x = x;
    this.y = y;
    this.speedX = Math.random() * 1 - 0.5;
    this.speedY = Math.random() * 1 - 0.5;
    this.angle = Math.random() * 2 * Math.PI;
  }

  update() {
    this.angle += 0.02;
    this.x = this.originX + Math.sin(this.angle) * 2;
    this.y = this.originY + Math.cos(this.angle) * 2;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, 1.2, 0, Math.PI * 2);
    context.fill();
  }
}

class Effect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.particles = [];
  }

  createParticlesFromImage(imageData) {
    this.particles = [];
    for (let y = 0; y < imageData.height; y += 6) {
      for (let x = 0; x < imageData.width; x += 6) {
        const index = (y * imageData.width + x) * 4;
        const alpha = imageData.data[index + 3];
        if (alpha > 128) {
          this.particles.push(new Particle(this, x, y));
        }
      }
    }
  }

  render(context) {
    this.particles.forEach(particle => {
      particle.update();
      particle.draw(context);
    });
  }
}

const effect = new Effect(canvas.width, canvas.height);

// Load image
const image = new Image();
image.src = 'img/portrait.png'; // Make sure this file exists
image.onload = () => {
  // Resize image to canvas size
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.createParticlesFromImage(imageData);
  animate();
};

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  effect.render(ctx);
  requestAnimationFrame(animate);
}




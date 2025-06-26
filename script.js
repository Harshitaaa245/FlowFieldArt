const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
 
// Canvas settings
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
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
    this.history = [{ x: this.x, y: this.y }];
    this.maxLength = Math.floor(Math.random() * 50 + 20);
  }

  draw(context) {
    context.beginPath();
    context.moveTo(this.history[0].x, this.history[0].y);
    for (let i = 1; i < this.history.length; i++) {
      context.lineTo(this.history[i].x, this.history[i].y);
    }
    context.stroke();
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > this.maxLength) {
      this.history.shift();
    }
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
    for (let y = 0; y < imageData.height; y += 4) {
      for (let x = 0; x < imageData.width; x += 4) {
        const index = (y * imageData.width + x) * 4;
        const alpha = imageData.data[index + 3];
        if (alpha > 100) {
          const mappedX = x * (canvas.width / imageData.width);
          const mappedY = y * (canvas.height / imageData.height);
          this.particles.push(new Particle(this, mappedX, mappedY));
        }
      }
    }
  }

  render(context) {
    this.particles.forEach(p => {
      p.update();
      p.draw(context);
    });
  }
}

const effect = new Effect(canvas.width, canvas.height);

const image = new Image();
image.src = 'img/art1.jpg'; // replace with your actual image path
image.onload = () => {
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.createParticlesFromImage(imageData);
  animate();
};

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.render(ctx);
  requestAnimationFrame(animate);
}



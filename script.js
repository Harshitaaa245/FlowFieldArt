const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

console.log(ctx);
ctx.fillStyle = 'white';
ctx.arc(100, 100, 50, 0, Math.PI*2 );
ctx.fill();

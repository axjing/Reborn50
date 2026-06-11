import { C } from '../utils/color.js';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var COLORS = [C.red, C.jade, C.gold, C.goldLight, '#fff'];

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = randInt(-3, 3);
    this.vy = randInt(-5, -1);
    this.life = 30;
    this.maxLife = 30;
    this.size = randInt(2, 4);
    this.color = COLORS[randInt(0, COLORS.length - 1)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2;
    this.life--;
  }

  isDead() { return this.life <= 0; }

  draw(ctx) {
    var a = this.life / this.maxLife;
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

export class ParticleSystem {
  constructor() { this.items = []; }

  emit(x, y, count) {
    for (var i = 0; i < count; i++) this.items.push(new Particle(x, y));
  }

  update() {
    for (var j = this.items.length - 1; j >= 0; j--) {
      this.items[j].update();
      if (this.items[j].isDead()) this.items.splice(j, 1);
    }
  }

  draw(ctx) {
    for (var i = 0; i < this.items.length; i++) this.items[i].draw(ctx);
  }
}

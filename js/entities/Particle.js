import { C } from '../utils/color.js';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

var COLORS = [C.red, C.jade, C.gold, C.goldLight, '#fff'];

class Particle {
  constructor(x, y, cfg) {
    cfg = cfg || {};
    this.x = x;
    this.y = y;
    this.vx = cfg.vx !== undefined ? cfg.vx : randInt(-3, 3);
    this.vy = cfg.vy !== undefined ? cfg.vy : randInt(-5, -1);
    this.life = cfg.life || 30;
    this.maxLife = this.life;
    this.size = cfg.size || randInt(2, 5);
    this.color = cfg.color || COLORS[randInt(0, COLORS.length - 1)];
    this.gravity = cfg.gravity || 0.2;
    this.fade = cfg.fade !== undefined ? cfg.fade : true;
    this.shape = cfg.shape || 'rect';
    this.rotation = cfg.rotation || 0;
    this.rotSpeed = cfg.rotSpeed || 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.rotation += this.rotSpeed;
    this.life--;
  }

  isDead() { return this.life <= 0; }

  draw(ctx) {
    var a = this.fade ? this.life / this.maxLife : 1;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor() { this.items = []; }

  emit(x, y, count, cfg) {
    for (var i = 0; i < count; i++) {
      this.items.push(new Particle(x, y, cfg));
    }
  }

  emitInkSplash(x, y) {
    for (var i = 0; i < 12; i++) {
      this.items.push(new Particle(x, y, {
        vx: randFloat(-4, 4),
        vy: randFloat(-6, 1),
        life: 20 + randInt(0, 15),
        size: randFloat(2, 6),
        color: C.ink,
        gravity: 0.15,
        fade: true,
        shape: randInt(0, 1) ? 'circle' : 'rect',
        rotation: randFloat(0, 6.28),
        rotSpeed: randFloat(-0.2, 0.2),
      }));
    }
  }

  emitGoldSplash(x, y) {
    for (var i = 0; i < 8; i++) {
      this.items.push(new Particle(x, y, {
        vx: randFloat(-3, 3),
        vy: randFloat(-4, -0.5),
        life: 25 + randInt(0, 10),
        size: randFloat(1.5, 4),
        color: C.gold,
        gravity: 0.1,
        fade: true,
        shape: 'circle',
        rotation: randFloat(0, 6.28),
        rotSpeed: randFloat(-0.1, 0.1),
      }));
    }
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

  clear() {
    this.items = [];
  }
}

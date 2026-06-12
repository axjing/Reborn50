import { C } from '../utils/color.js';

var COLORS = [
  { body: '#4A4A4A', ear: '#3D3D3D', glow: 'rgba(0,0,0,0)' },
  { body: '#5B8C5A', ear: '#4A7B49', glow: 'rgba(0,0,0,0)' },
  { body: '#7BA87B', ear: '#6A976A', glow: 'rgba(0,0,0,0)' },
  { body: '#D4A04A', ear: '#C0903A', glow: 'rgba(212,160,74,0.25)' },
  { body: '#E8C87A', ear: '#D8B86A', glow: 'rgba(232,200,122,0.35)' },
  { body: '#FFF8E0', ear: '#F0E8D0', glow: 'rgba(255,248,224,0.5)' },
];

var TAIL_COUNTS = [0, 1, 1, 2, 3, 5];

export class Pet {
  constructor() {
    this.state = 'idle';
    this.timer = 0;
    this.blinkTimer = 0;
    this.evolveProgress = 0;
    this._evolved = true;
  }

  update(dt) {
    this.timer += dt;
    this.blinkTimer += dt;
    if (this.evolveProgress > 0 && this.evolveProgress < 1) {
      this.evolveProgress = Math.min(1, this.evolveProgress + dt * 2);
      if (this.evolveProgress >= 1) this._evolved = true;
    }
  }

  setState(s) {
    if (s === 'evolving') {
      this.evolveProgress = 0.01;
      this._evolved = false;
    }
    this.state = s;
  }

  getStage(days) {
    if (days >= 50) return 5;
    if (days >= 35) return 4;
    if (days >= 25) return 3;
    if (days >= 15) return 2;
    if (days >= 5) return 1;
    return 0;
  }

  draw(ctx, x, y, size, days) {
    var stage = this.getStage(days);
    var c = COLORS[stage];

    var breath = Math.sin(this.timer * 3) * 0.04;
    var blink = (this.blinkTimer % 4) > 3.85 ? 0.15 : 1;
    var bounce = 0;
    if (this.state === 'happy') bounce = Math.sin(this.timer * 10) * 1.5;
    if (this.state === 'excited') bounce = -Math.abs(Math.sin(this.timer * 12)) * 2.5;
    if (this.state === 'sad') bounce = Math.sin(this.timer * 2) * 0.5;

    var s = size * (1 + breath);
    var evolveScale = 1;
    if (this.evolveProgress > 0 && this.evolveProgress < 1) {
      evolveScale = this.evolveProgress < 0.5
        ? 1 + this.evolveProgress * 0.6
        : 1.3 - (this.evolveProgress - 0.5) * 0.6;
    }
    s *= evolveScale;

    var r = s * 0.44;

    ctx.save();
    ctx.translate(x, y + bounce);

    // Tail(s)
    ctx.strokeStyle = c.ear;
    ctx.lineCap = 'round';
    for (var t = 0; t < TAIL_COUNTS[stage]; t++) {
      var tw = Math.sin(this.timer * 3 + t * 1.5) * r * 0.12;
      ctx.lineWidth = r * 0.22 - t * r * 0.02;
      ctx.globalAlpha = 0.7 + t * 0.05;
      ctx.beginPath();
      ctx.moveTo(r * 0.35, -r * 0.15 + t * r * 0.06);
      ctx.quadraticCurveTo(
        r * 0.8 + tw,
        -r * 0.65 - t * r * 0.08,
        r * 0.7 + tw * 0.5,
        -r * 0.85 - t * r * 0.1
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Body
    var g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.05, 0, 0, r);
    g.addColorStop(0, '#fff');
    g.addColorStop(0.25, c.body);
    g.addColorStop(1, c.ear);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    if (stage >= 1) {
      ctx.fillStyle = c.ear;
      ctx.beginPath();
      ctx.moveTo(-r * 0.48, -r * 0.6);
      ctx.lineTo(-r * 0.22, -r * 0.95);
      ctx.lineTo(-r * 0.02, -r * 0.5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(r * 0.48, -r * 0.6);
      ctx.lineTo(r * 0.22, -r * 0.95);
      ctx.lineTo(r * 0.02, -r * 0.5);
      ctx.fill();
    }

    // Glow
    if (stage >= 3 && this._evolved) {
      ctx.shadowColor = c.glow;
      ctx.shadowBlur = 10 + Math.sin(this.timer * 2) * 4;
    }

    // Eyes
    var eyeY = -r * 0.06;
    var eyeR = r * 0.17;
    ctx.fillStyle = '#2C2C2C';
    if (blink < 0.5) {
      ctx.fillRect(-r * 0.38 - eyeR, eyeY, eyeR * 2, Math.max(1, blink * eyeR * 2));
      ctx.fillRect(r * 0.38 - eyeR, eyeY, eyeR * 2, Math.max(1, blink * eyeR * 2));
    } else {
      ctx.beginPath();
      ctx.arc(-r * 0.33, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(r * 0.33, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();
      // Highlights
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-r * 0.33 + eyeR * 0.35, eyeY - eyeR * 0.3, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(r * 0.33 + eyeR * 0.35, eyeY - eyeR * 0.3, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cheeks
    ctx.fillStyle = 'rgba(255,150,150,0.3)';
    ctx.save();
    ctx.translate(-r * 0.52, r * 0.06);
    ctx.scale(1.4, 1);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(r * 0.52, r * 0.06);
    ctx.scale(1.4, 1);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }
}

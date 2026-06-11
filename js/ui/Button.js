import { C, roundRect, fs } from '../utils/color.js';

export class Button {
  constructor(x, y, w, h, label, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.color = color || C.red;
    this._flash = 0;
  }

  draw(ctx) {
    var c = this._flash > 0 ? '#fff' : this.color;
    ctx.save();

    ctx.shadowColor = C.shadow;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    roundRect(ctx, this.x, this.y, this.w, this.h, 10);
    var g = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
    g.addColorStop(0, c);
    g.addColorStop(1, C.redDark);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 1.5;
    roundRect(ctx, this.x + 2, this.y + 2, this.w - 4, this.h - 4, 8);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold ' + Math.min(fs(ctx.canvas.width, 15), this.h - 8) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, this.x + this.w / 2, this.y + this.h / 2 + 1);
    ctx.restore();
  }
}

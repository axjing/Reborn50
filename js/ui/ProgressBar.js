import { C, roundRect, fs } from '../utils/color.js';

export class ProgressBar {
  constructor(x, y, w, h, maxVal, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.maxVal = maxVal || 100;
    this.val = maxVal || 100;
    this.color = color || C.jade;
    this.label = '';
  }

  draw(ctx) {
    var ratio = this.maxVal > 0 ? this.val / this.maxVal : 0;

    ctx.save();

    ctx.shadowColor = C.shadow;
    ctx.shadowBlur = 4;
    roundRect(ctx, this.x, this.y, this.w, this.h, this.h / 2);
    ctx.fillStyle = 'rgba(44,44,44,0.06)';
    ctx.fill();
    ctx.shadowBlur = 0;

    var fw = Math.max(0, (this.w - 4) * ratio);
    if (fw > 2) {
      roundRect(ctx, this.x + 2, this.y + 2, fw, this.h - 4, (this.h - 4) / 2);
      var g = ctx.createLinearGradient(this.x, this.y, this.x + this.w, this.y);
      g.addColorStop(0, this.color);
      g.addColorStop(1, this.color + 'aa');
      ctx.fillStyle = g;
      ctx.fill();
    }

    ctx.strokeStyle = C.goldLight;
    ctx.lineWidth = 0.5;
    roundRect(ctx, this.x, this.y, this.w, this.h, this.h / 2);
    ctx.stroke();

    if (this.label) {
      ctx.fillStyle = C.ink;
      ctx.font = 'bold ' + Math.min(fs(ctx.canvas.width, 10), this.h) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.label, this.x + this.w / 2, this.y + this.h / 2);
    }

    ctx.restore();
  }
}

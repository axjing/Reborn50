import { STATUS } from '../utils/constants.js';
import { C, drawBg, fs, drawMountain, drawMist } from '../utils/color.js';

export class BootScene {
  constructor(sm) {
    this.sm = sm;
    this.timer = 0;
    this._alpha = 0;
    this._fadeIn = true;
  }

  onEnter() {
    this.timer = 0;
    this._alpha = 0;
    this._fadeIn = true;
  }

  update(dt) {
    this.timer += dt;
    if (this._fadeIn) {
      this._alpha = Math.min(1, this._alpha + dt * 1.5);
      if (this._alpha >= 1) this._fadeIn = false;
    }
    if (this.timer > 1.5 && this._alpha >= 1) {
      this.sm.transitionTo(STATUS.TITLE);
    }
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    drawBg(ctx, w, h);
    drawMountain(ctx, w, h, this.timer);
    drawMist(ctx, w, h, this.timer);

    ctx.save();
    ctx.globalAlpha = this._alpha;
    ctx.fillStyle = C.ink;
    ctx.font = 'bold ' + fs(w, 40) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Reborn', w / 2, h / 2 - 40);
    ctx.fillStyle = C.red;
    ctx.font = 'bold ' + fs(w, 20) + 'px "SimSun", "KaiTi", serif';
    ctx.fillText('江湖', w / 2, h / 2 + 4);
    ctx.fillStyle = C.inkLight;
    ctx.font = fs(w, 14) + 'px "SimSun", "KaiTi", serif';
    ctx.fillText('五十日渡劫修行', w / 2, h / 2 + 34);
    if (this.timer > 1.0) {
      ctx.fillStyle = C.inkMuted;
      ctx.font = fs(w, 11) + 'px sans-serif';
      var ta = Math.min(1, (this.timer - 1.0) * 3) * this._alpha;
      ctx.globalAlpha = ta;
      ctx.fillText('以江湖炼自律 · 以五十日渡新生', w / 2, h / 2 + 64);
    }
    ctx.restore();
  }
}

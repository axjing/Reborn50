import { STATUS } from '../utils/constants.js';
import { C, drawBg, fs } from '../utils/color.js';

export class BootScene {
  constructor(sm) { this.sm = sm; this.timer = 0; }

  onEnter() {
    this.timer = 0;
  }

  update(dt) {
    this.timer += dt;
    if (this.timer > 1.5) this.sm.switchTo(STATUS.TITLE);
  }

  handleTap() {}

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    drawBg(ctx, w, h);

    ctx.fillStyle = C.red;
    ctx.font = 'bold ' + fs(w, 36) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Reborn50', w / 2, h / 2 - 20);

    ctx.fillStyle = C.inkLight;
    ctx.font = fs(w, 16) + 'px sans-serif';
    ctx.fillText('五十日自律重生', w / 2, h / 2 + 24);

    ctx.fillStyle = C.inkMuted;
    ctx.font = fs(w, 12) + 'px sans-serif';
    ctx.fillText('加载中...', w / 2, h / 2 + 54);
  }
}

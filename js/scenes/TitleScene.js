import { STATUS } from '../utils/constants.js';
import {
  C, drawBg, drawCard, roundRect, fs, drawInkBtn,
  drawMountain, drawMist, drawSparkle, drawTree,
  drawSongCard, drawSongBtn, getFont,
} from '../utils/color.js';
import { StorageManager } from '../systems/StorageManager.js';

var OPENING = [
  '世间凡人皆困于惰性迷雾、拖延执念。',
  '唯有开启五十天江湖渡劫修行，',
  '修炼七大绝世心法，破除心魔，',
  '方能从俗世凡人，蜕变为自律宗师。',
];

export class TitleScene {
  constructor(sm) {
    this.sm = sm;
    this._phase = 0;
    this._timer = 0;
    this._lineIdx = 0;
    this._charBob = 0;
    this._buttons = [];
  }

  onEnter() {
    this._phase = 0;
    this._timer = 0;
    this._lineIdx = 0;
    this._charBob = 0;
    this._buttons = [];
  }

  update(dt) {
    this._charBob += dt * 2;
    this._timer += dt;

    if (this._phase === 0) {
      if (this._timer > 1.0) {
        this._timer = 0;
        this._lineIdx++;
        if (this._lineIdx >= OPENING.length) {
          this._phase = 1;
          this._timer = 0;
          var w = this.sm.canvas.width;
          var h = this.sm.canvas.height;
          var bw = Math.min(200, w - 60);
          var bh = 44;
          var bx = (w - bw) / 2;
          this._buttons = [
            { x: bx, y: h * 0.6, w: bw, h: bh, text: '踏入江湖', color: C.red },
          ];
          if (StorageManager.hasSave()) {
            this._buttons.push({
              x: bx, y: h * 0.6 + bh + 12, w: bw, h: bh, text: '继续修行', color: C.jade,
            });
          }
        }
      }
    }
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    drawBg(ctx, w, h);
    drawMountain(ctx, w, h, this._charBob * 0.5);
    drawMist(ctx, w, h, this._charBob * 0.3);
    drawTree(ctx, w * 0.15, h * 0.62, 1.2, this._charBob * 0.5);
    drawTree(ctx, w * 0.85, h * 0.65, 1, this._charBob * 0.5 + 1);

    if (this._phase === 0) {
      ctx.save();
      ctx.fillStyle = C.ink;
      ctx.font = getFont(w, 16, 'sans');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var i = 0; i <= this._lineIdx && i < OPENING.length; i++) {
        ctx.globalAlpha = i === this._lineIdx ? Math.min(1, this._timer * 2.5) : 1;
        ctx.fillText(OPENING[i], w / 2, h / 2 - 25 + i * 28);
      }
      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = C.ink;
      ctx.font = getFont(w, 36, 'song');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('自律 · 江湖', w / 2, h * 0.13);

      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 1;
      ctx.beginPath();
      var tx = fs(w, 36) * 4.5;
      ctx.moveTo(w / 2 - tx / 2, h * 0.13 + fs(w, 36) / 2 + 6);
      ctx.lineTo(w / 2 + tx / 2, h * 0.13 + fs(w, 36) / 2 + 6);
      ctx.stroke();

      ctx.fillStyle = C.red;
      ctx.font = getFont(w, 15, 'song');
      ctx.fillText('五十日 · 七大心法 · 重塑自我', w / 2, h * 0.13 + fs(w, 36) + 20);
      ctx.fillStyle = C.inkLight;
      ctx.font = getFont(w, 13, 'sans');
      ctx.fillText('以江湖炼自律  ·  以五十日渡新生', w / 2, h * 0.13 + fs(w, 36) + 44);

      drawSparkle(ctx, w / 2 - 60, h * 0.30, 5, this._charBob * 1.3);
      drawSparkle(ctx, w / 2 + 60, h * 0.32, 4, this._charBob * 1.7 + 1);
      drawSparkle(ctx, w / 2 - 40, h * 0.38, 3, this._charBob * 2.1 + 2);
      drawSparkle(ctx, w / 2 + 40, h * 0.36, 3.5, this._charBob * 0.9 + 3);

      for (var j = 0; j < this._buttons.length; j++) {
        var b = this._buttons[j];
        drawInkBtn(ctx, b.x, b.y, b.w, b.h, b.text, b.color);
      }
      ctx.restore();
    }
  }

  handleTap(x, y) {
    if (this._phase === 0) {
      this._lineIdx = OPENING.length - 1;
      this._timer = 1.5;
      return;
    }
    for (var i = 0; i < this._buttons.length; i++) {
      var b = this._buttons[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        if (this.sm.audio) this.sm.audio.playTap();
        this.sm.transitionTo(STATUS.HOME, { newGame: i === 0 });
        return;
      }
    }
  }
}

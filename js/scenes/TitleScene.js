import { STATUS } from '../utils/constants.js';
import { C, drawBg, drawCard, roundRect, fs, drawChar, drawBtn, drawCloud, drawSparkle } from '../utils/color.js';
import { StorageManager } from '../systems/StorageManager.js';
import { Button } from '../ui/Button.js';

var INTRO = [
  '你被困在了日复一日的循环中。',
  '是时候打破它了。',
  '五十日，七项日常，',
  '在自律中重生，成为更好的自己。',
];

export class TitleScene {
  constructor(sm) {
    this.sm = sm;
    this.buttons = [];
    this._introDone = false;
    this._introIdx = 0;
    this._introTimer = 0;
    this._charBob = 0;
    this._clouds = [];
    for (var i = 0; i < 3; i++) this._clouds.push({ x: Math.random(), s: 0.5 + Math.random() * 1, sp: 0.08 + Math.random() * 0.12 });
  }

  onEnter() {
    this._introDone = false;
    this._introIdx = 0;
    this._introTimer = 0;
    this._charBob = 0;
    this.buttons = [];
  }

  update(dt) {
    this._charBob += dt * 2.5;
    for (var i = 0; i < this._clouds.length; i++) {
      this._clouds[i].x += this._clouds[i].sp * 0.003;
      if (this._clouds[i].x > 1.2) this._clouds[i].x = -0.2;
    }

    if (!this._introDone) {
      this._introTimer += dt;
      if (this._introTimer > 1.2) {
        this._introTimer = 0;
        this._introIdx++;
        if (this._introIdx >= INTRO.length) {
          this._introDone = true;
          var w = this.sm.canvas.width;
          var h = this.sm.canvas.height;
          var bw = Math.min(200, w - 60);
          var bh = 48;
          var bx = (w - bw) / 2;
          this.buttons = [new Button(bx, h * 0.56, bw, bh, '开始重生', C.red)];
          if (StorageManager.hasSave()) {
            this.buttons.push(new Button(bx, h * 0.56 + bh + 14, bw, bh, '继续旅程', C.jade));
          }
        }
      }
    }
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    drawBg(ctx, w, h);

    for (var ci = 0; ci < this._clouds.length; ci++) {
      drawCloud(ctx, w * this._clouds[ci].x, 20 + ci * 40, this._clouds[ci].s);
    }

    if (!this._introDone) {
      ctx.fillStyle = C.ink;
      ctx.font = fs(w, 18) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var i = 0; i <= this._introIdx && i < INTRO.length; i++) {
        var a = i === this._introIdx ? Math.min(1, this._introTimer * 3) : 1;
        ctx.globalAlpha = a;
        ctx.fillText(INTRO[i], w / 2, h / 2 - 30 + i * 30);
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = C.red;
      ctx.font = 'bold ' + fs(w, 34) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Reborn50', w / 2, h * 0.14);

      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 1;
      ctx.beginPath();
      var tx = fs(w, 34) * 5.5;
      ctx.moveTo(w / 2 - tx / 2, h * 0.14 + fs(w, 34) / 2 + 4);
      ctx.lineTo(w / 2 + tx / 2, h * 0.14 + fs(w, 34) / 2 + 4);
      ctx.stroke();

      ctx.fillStyle = C.inkLight;
      ctx.font = fs(w, 15) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('五十日 · 七项规则 · 重塑自我', w / 2, h * 0.14 + fs(w, 34));

      drawChar(ctx, w / 2, h * 0.40, 2.2, this._charBob);

      drawSparkle(ctx, w / 2 - 50, h * 0.30, 5, this._charBob * 1.3);
      drawSparkle(ctx, w / 2 + 50, h * 0.32, 4, this._charBob * 1.7 + 1);
      drawSparkle(ctx, w / 2 - 35, h * 0.36, 3, this._charBob * 2.1 + 2);
      drawSparkle(ctx, w / 2 + 35, h * 0.34, 3.5, this._charBob * 0.9 + 3);

      for (var j = 0; j < this.buttons.length; j++) {
        this.buttons[j].draw(ctx);
      }
    }
  }

  handleTap(x, y) {
    if (!this._introDone) {
      this._introIdx = INTRO.length - 1;
      this._introTimer = 1.5;
      return;
    }
    for (var i = 0; i < this.buttons.length; i++) {
      var b = this.buttons[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        this.sm.switchTo(STATUS.HOME, { newGame: i === 0 });
        return;
      }
    }
  }
}

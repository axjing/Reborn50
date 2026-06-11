import { STATUS, TOTAL_DAYS } from '../utils/constants.js';
import { C, drawBg, drawCard, roundRect, fs, drawBtn } from '../utils/color.js';

export class HistoryScene {
  constructor(sm) {
    this.sm = sm;
    this.player = null;
    this.recs = [];
  }

  onEnter(data) {
    this.player = data.player;
    this.recs = (this.player.history || []).slice().reverse().slice(0, 20);
  }

  update() {}

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    drawBg(ctx, w, h);

    ctx.fillStyle = C.red;
    ctx.font = 'bold ' + fs(w, 20) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('挑战记录', w / 2, 14);

    ctx.fillStyle = C.inkLight;
    ctx.font = fs(w, 12) + 'px sans-serif';
    ctx.fillText('已完成 ' + this.player.completedDays + '/' + TOTAL_DAYS + ' 天  重置 ' + this.player.totalResets + ' 次', w / 2, 44);

    ctx.save();
    roundRect(ctx, 0, 68, w, h - 136, 0);
    ctx.clip();

    if (this.recs.length === 0) {
      ctx.fillStyle = C.inkMuted;
      ctx.font = fs(w, 14) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('暂无记录，开始你的重生之旅', w / 2, h / 2);
    } else {
      for (var i = 0; i < this.recs.length; i++) {
        var r = this.recs[i];
        var y = 76 + i * 60;
        var rh = 50;
        if (y + rh < 68 || y > h - 68) continue;

        var fail = r.failed;
        drawCard(ctx, 12, y, w - 24, rh, 8);

        ctx.fillStyle = fail ? C.red : C.ink;
        ctx.font = 'bold ' + fs(w, 13) + 'px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('Day ' + r.day, 24, y + 5);

        if (r.timestamp) {
          ctx.fillStyle = C.inkMuted;
          ctx.font = fs(w, 9) + 'px sans-serif';
          ctx.fillText(new Date(r.timestamp).toLocaleDateString('zh-CN'), 24, y + 25);
        }

        if (fail) {
          ctx.fillStyle = C.red;
          ctx.font = fs(w, 12) + 'px sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          ctx.fillText('失败', w - 24, y + 10);
        } else {
          ctx.fillStyle = C.jade;
          ctx.font = fs(w, 12) + 'px sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          var rd = (r.completedRules || []).length;
          ctx.fillText(rd + '/7 完成', w - 24, y + 10);
          ctx.fillStyle = C.inkMuted;
          ctx.font = fs(w, 9) + 'px sans-serif';
          ctx.fillText('连击 ' + (r.streak || 0) + ' 天', w - 24, y + 26);
        }
      }
    }
    ctx.restore();

    drawBtn(ctx, (w - 120) / 2, h - 56, 120, 38, '返回', C.gold);
  }

  handleTap(x, y) {
    var w = this.sm.canvas.width;
    var h = this.sm.canvas.height;
    var bx = (w - 120) / 2;
    if (x >= bx && x <= bx + 120 && y >= h - 56 && y <= h - 56 + 38) {
      this.sm.switchTo(STATUS.HOME, { player: this.player });
    }
  }
}

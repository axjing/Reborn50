import { STATUS, TOTAL_DAYS, STAT_LABELS } from '../utils/constants.js';
import { C, drawBg, drawCard, roundRect, fs, drawInkBtn, drawMist } from '../utils/color.js';

export class HistoryScene {
  constructor(sm) {
    this.sm = sm;
    this.player = null;
    this._records = [];
    this._timer = 0;
  }

  onEnter(data) {
    this.player = data.player;
    this._records = (this.player.history || []).slice().reverse();
    this._timer = 0;
  }

  update(dt) {
    this._timer += dt;
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    drawBg(ctx, w, h);
    drawMist(ctx, w, h, this._timer * 0.3);

    ctx.save();
    ctx.globalAlpha = 0.92;
    drawCard(ctx, 8, 6, w - 16, h - 12, 12);
    ctx.restore();

    ctx.fillStyle = C.ink;
    ctx.font = 'bold ' + fs(w, 18) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('修行手账', w / 2, 16);

    ctx.fillStyle = C.inkLight;
    ctx.font = fs(w, 11) + 'px "SimSun", "KaiTi", serif';
    ctx.fillText('已完成 ' + this.player.completedDays + '/' + TOTAL_DAYS + ' 天  |  连击 ' + this.player.streak + ' 天', w / 2, 40);

    ctx.save();
    roundRect(ctx, 12, 58, w - 24, h - 122, 0);
    ctx.clip();

    if (this._records.length === 0) {
      ctx.fillStyle = C.inkMuted;
      ctx.font = fs(w, 14) + 'px "SimSun", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('暂无修行记录', w / 2, h / 2);
    } else {
      for (var i = 0; i < Math.min(this._records.length, 50); i++) {
        var r = this._records[i];
        var y = 66 + i * 52;
        var rh = 44;
        if (y + rh < 58 || y > h - 64) continue;

        var fail = r.failed;
        roundRect(ctx, 16, y, w - 32, rh, 6);
        ctx.fillStyle = fail ? 'rgba(194,53,49,0.05)' : C.white;
        ctx.fill();
        ctx.strokeStyle = fail ? C.redLight : C.inkMuted;
        ctx.lineWidth = 0.5;
        roundRect(ctx, 16, y, w - 32, rh, 6);
        ctx.stroke();

        ctx.fillStyle = fail ? C.red : C.ink;
        ctx.font = 'bold ' + fs(w, 13) + 'px "SimSun", "KaiTi", serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('第 ' + r.day + ' 天', 26, y + 4);

        if (r.timestamp) {
          ctx.fillStyle = C.inkMuted;
          ctx.font = fs(w, 8) + 'px sans-serif';
          ctx.fillText(new Date(r.timestamp).toLocaleDateString('zh-CN'), 26, y + 24);
        }

        if (fail) {
          ctx.fillStyle = C.red;
          ctx.font = fs(w, 11) + 'px "SimSun", "KaiTi", serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          ctx.fillText('未完成', w - 26, y + 8);
        } else {
          var starStr = '';
          var sc = r.stars || 0;
          for (var s = 0; s < 3; s++) { starStr += s < sc ? '★' : '☆'; }
          ctx.fillStyle = C.gold;
          ctx.font = fs(w, 12) + 'px sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          ctx.fillText(starStr, w - 26, y + 4);

          ctx.fillStyle = C.jade;
          ctx.font = fs(w, 10) + 'px sans-serif';
          ctx.fillText('连击 ' + (r.streak || 0) + ' 天', w - 26, y + 24);
        }
      }
    }

    ctx.restore();

    drawInkBtn(ctx, (w - 100) / 2, h - 50, 100, 36, '返回', C.inkMuted);
  }

  handleTap(x, y) {
    var w = this.sm.canvas.width;
    var h = this.sm.canvas.height;
    if (x >= (w - 100) / 2 && x <= (w - 100) / 2 + 100 && y >= h - 50 && y <= h - 14) {
      this.sm.transitionTo(STATUS.HOME, { player: this.player });
    }
  }
}

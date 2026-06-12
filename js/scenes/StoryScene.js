import { STATUS, CHAPTERS, REALMS } from '../utils/constants.js';
import { C, drawBg, drawCard, roundRect, fs, drawInkBtn, drawMist, drawSparkle } from '../utils/color.js';
import { StorageManager } from '../systems/StorageManager.js';

export class StoryScene {
  constructor(sm) {
    this.sm = sm;
    this.player = null;
    this._chapterIdx = 0;
    this._showingDetail = false;
    this._timer = 0;
  }

  onEnter(data) {
    this.player = data.player;
    this._chapterIdx = Math.max(0, Math.min(CHAPTERS.length - 1, this.player.chapter - 1));
    this._showingDetail = false;
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
    drawSparkle(ctx, w * 0.2, 30, 4, this._timer * 1.3);
    drawSparkle(ctx, w * 0.8, 50, 3, this._timer * 1.7 + 1);

    ctx.save();
    ctx.globalAlpha = 0.92;
    drawCard(ctx, 8, 6, w - 16, h - 12, 12);
    ctx.restore();

    ctx.fillStyle = C.ink;
    ctx.font = 'bold ' + fs(w, 18) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('江湖剧情', w / 2, 16);

    if (this._showingDetail) {
      this._renderDetail(ctx, w, h);
    } else {
      this._renderList(ctx, w, h);
    }

    drawInkBtn(ctx, (w - 100) / 2, h - 50, 100, 36, '返回', C.inkMuted);
  }

  _renderList(ctx, w, h) {
    ctx.save();
    roundRect(ctx, 14, 50, w - 28, h - 110, 0);
    ctx.clip();

    for (var i = 0; i < CHAPTERS.length; i++) {
      var ch = CHAPTERS[i];
      var y = 56 + i * 90;
      var unlocked = this.player.completedDays >= ch.dayRange[0] - 1;
      var isCurrent = i === this._chapterIdx;

      roundRect(ctx, 18, y, w - 36, 78, 8);
      ctx.fillStyle = unlocked ? C.white : 'rgba(200,200,200,0.3)';
      ctx.fill();
      ctx.strokeStyle = isCurrent ? C.red : (unlocked ? ch.color : C.inkMuted);
      ctx.lineWidth = isCurrent ? 2 : 0.5;
      roundRect(ctx, 18, y, w - 36, 78, 8);
      ctx.stroke();

      ctx.fillStyle = ch.color;
      ctx.font = 'bold ' + fs(w, 8) + 'px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('第' + ch.dayRange[0] + '-' + ch.dayRange[1] + '天', 28, y + 6);

      ctx.fillStyle = unlocked ? C.ink : C.inkMuted;
      ctx.font = 'bold ' + fs(w, 16) + 'px "SimSun", "KaiTi", serif';
      ctx.fillText(ch.title, 28, y + 20);

      ctx.fillStyle = unlocked ? C.inkLight : C.inkMuted;
      ctx.font = fs(w, 11) + 'px "SimSun", "KaiTi", serif';
      ctx.fillText(ch.subtitle, 28, y + 44);

      if (!unlocked) {
        ctx.fillStyle = C.inkMuted;
        ctx.font = fs(w, 10) + 'px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('🔒', w - 30, y + 28);
      } else if (this.player.storyWatched.includes(ch.id)) {
        ctx.fillStyle = C.jade;
        ctx.font = fs(w, 10) + 'px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('已阅', w - 30, y + 28);
      } else {
        ctx.fillStyle = C.gold;
        ctx.font = fs(w, 10) + 'px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('NEW', w - 30, y + 28);
      }
    }

    ctx.restore();
  }

  _renderDetail(ctx, w, h) {
    var ch = CHAPTERS[this._chapterIdx];

    ctx.fillStyle = ch.color;
    ctx.font = 'bold ' + fs(w, 22) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(ch.title, w / 2, 50);

    ctx.fillStyle = C.inkLight;
    ctx.font = fs(w, 14) + 'px "SimSun", "KaiTi", serif';
    ctx.fillText(ch.subtitle, w / 2, 80);

    ctx.save();
    roundRect(ctx, 20, 105, w - 40, h - 165, 8);
    ctx.clip();

    ctx.fillStyle = C.ink;
    ctx.font = fs(w, 14) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    var lines = ch.desc.split('\n');
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 30, 115 + i * 24);
    }

    ctx.restore();
  }

  handleTap(x, y) {
    var w = this.sm.canvas.width;
    var h = this.sm.canvas.height;

    if (x >= (w - 100) / 2 && x <= (w - 100) / 2 + 100 && y >= h - 50 && y <= h - 14) {
      if (this._showingDetail) {
        this._showingDetail = false;
      } else {
        this.sm.transitionTo(STATUS.HOME, { player: this.player });
      }
      return;
    }

    if (!this._showingDetail) {
      for (var i = 0; i < CHAPTERS.length; i++) {
        var cy = 56 + i * 90;
        if (x >= 18 && x <= w - 18 && y >= cy && y <= cy + 78) {
          var unlocked = this.player.completedDays >= CHAPTERS[i].dayRange[0] - 1;
          if (unlocked) {
            this._chapterIdx = i;
            this._showingDetail = true;
            if (!this.player.storyWatched.includes(CHAPTERS[i].id)) {
              this.player.storyWatched.push(CHAPTERS[i].id);
              StorageManager.save(this.player);
            }
          }
          return;
        }
      }
    }
  }
}

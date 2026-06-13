import { STATUS } from '../utils/constants.js';
import { STORY_EPISODES } from './story-data.js';
import { C, drawBg, drawPaperCard, drawGuofengBtn, drawSeal, drawGuofengToast, fs, roundRect } from '../utils/color.js';
import { StorageManager } from '../systems/StorageManager.js';

export class StoryScene {
  constructor(sm) {
    this.sm = sm;
    this.player = null;
    this._scrollOffset = 0;
    this._maxScroll = 0;
    this._touchStartY = 0;
    this._touchMoved = false;
    this._selectedDay = null;
    this._toastAlpha = 0;
    this._toastText = '';
  }

  onEnter(data) {
    this.player = data.player;
    this._scrollOffset = 0;
    this._maxScroll = 0;
    this._touchStartY = 0;
    this._touchMoved = false;
    this._selectedDay = null;
    this._toastAlpha = 0;
    this._toastText = '';
  }

  update(dt) {
    if (this._toastAlpha > 0) {
      this._toastAlpha -= dt * 0.5;
      if (this._toastAlpha < 0) this._toastAlpha = 0;
    }
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;

    drawBg(ctx, w, h);
    ctx.save();
    ctx.globalAlpha = 0.92;
    drawPaperCard(ctx, 4, 4, w - 8, h - 8, 8);
    ctx.restore();

    ctx.fillStyle = C.ink;
    ctx.font = 'bold ' + fs(w, 20) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('江湖纪事', w / 2, 14);
    drawSeal(ctx, w - 28, 22, 20, '卷');

    if (this._selectedDay !== null) {
      this._renderDetail(ctx, w, h);
    } else {
      this._renderList(ctx, w, h);
    }

    if (this._toastAlpha > 0) {
      drawGuofengToast(ctx, w, h, this._toastText, this._toastAlpha);
    }
  }

  _renderList(ctx, w, h) {
    var ITEM_H = 56;
    var ITEM_GAP = 4;
    var SLOT = ITEM_H + ITEM_GAP;
    var headerH = 48;
    var navH = 50;
    var viewY = headerH + 8;
    var viewH = h - headerH - navH - 16;
    var totalH = STORY_EPISODES.length * SLOT;

    this._maxScroll = Math.max(0, totalH - viewH);
    this._scrollOffset = Math.max(0, Math.min(this._scrollOffset, this._maxScroll));

    ctx.save();
    roundRect(ctx, 8, viewY, w - 16, viewH, 0);
    ctx.clip();

    var startIdx = Math.max(0, Math.floor(this._scrollOffset / SLOT));
    var endIdx = Math.min(STORY_EPISODES.length - 1, Math.ceil((this._scrollOffset + viewH) / SLOT));

    for (var i = startIdx; i <= endIdx; i++) {
      var ep = STORY_EPISODES[i];
      var y = viewY + i * SLOT - this._scrollOffset;
      var unlocked = this.player.completedDays >= ep.day - 1;
      var read = this.player.storyWatched.includes(ep.day);

      ctx.fillStyle = read ? 'rgba(91,140,90,0.06)' : (unlocked ? C.paperLight : 'rgba(200,200,200,0.15)');
      roundRect(ctx, 10, y + 1, w - 20, ITEM_H - 2, 6);
      ctx.fill();

      ctx.fillStyle = unlocked ? (read ? C.jade : C.gold) : C.inkMuted;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(10, y + 6, 3, ITEM_H - 12);
      ctx.globalAlpha = 1;

      var badgeSize = 34;
      var badgeX = 22;
      var badgeY = y + (ITEM_H - badgeSize) / 2;
      ctx.fillStyle = unlocked ? C.zhuSha : C.inkMuted;
      ctx.globalAlpha = unlocked ? 0.15 : 0.08;
      roundRect(ctx, badgeX, badgeY, badgeSize, badgeSize, badgeSize / 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = unlocked ? C.zhuSha : C.inkMuted;
      ctx.font = fs(w, 11) + 'px "SimSun", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('第' + ep.day + '日', badgeX + badgeSize / 2, badgeY + badgeSize / 2);

      ctx.fillStyle = unlocked ? C.ink : C.inkMuted;
      ctx.font = 'bold ' + fs(w, 14) + 'px "SimSun", "KaiTi", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(ep.title, badgeX + badgeSize + 10, y + ITEM_H / 2 - 6);

      ctx.fillStyle = unlocked ? C.inkLight : C.inkMuted;
      ctx.font = fs(w, 9) + 'px "SimSun", "KaiTi", serif';
      ctx.textAlign = 'left';
      ctx.fillText('# ' + ep.tokens.join(' · '), badgeX + badgeSize + 10, y + ITEM_H / 2 + 12);

      ctx.textAlign = 'right';
      if (!unlocked) {
        ctx.fillStyle = C.inkMuted;
        ctx.font = fs(w, 12) + 'px sans-serif';
        ctx.fillText('封', w - 20, y + ITEM_H / 2);
      } else if (read) {
        ctx.fillStyle = C.jade;
        ctx.font = fs(w, 12) + 'px "SimSun", "KaiTi", serif';
        ctx.fillText('已阅', w - 20, y + ITEM_H / 2);
      } else {
        ctx.fillStyle = C.gold;
        ctx.font = 'bold ' + fs(w, 12) + 'px sans-serif';
        ctx.fillText('NEW', w - 20, y + ITEM_H / 2);
      }
    }

    ctx.restore();

    if (this._maxScroll > 0) {
      var barH = Math.max(20, viewH * viewH / totalH);
      var barY = viewY + (this._scrollOffset / this._maxScroll) * (viewH - barH);
      ctx.fillStyle = 'rgba(44,44,44,0.15)';
      roundRect(ctx, w - 14, barY, 4, barH, 2);
      ctx.fill();
    }

    drawGuofengBtn(ctx, 14, h - 46, 80, 34, '返回', {
      bgColor: C.inkLight,
      fontSize: 13,
      doubleBorder: false,
    });
  }

  _renderDetail(ctx, w, h) {
    var ep = STORY_EPISODES[this._selectedDay - 1];
    if (!ep) return;

    ctx.fillStyle = C.ink;
    ctx.font = 'bold ' + fs(w, 17) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('第' + ep.day + '日 · ' + ep.title, w / 2, 52);

    ctx.fillStyle = C.inkLight;
    ctx.font = fs(w, 11) + 'px "SimSun", "KaiTi", serif';
    ctx.fillText('# ' + ep.tokens.join('  '), w / 2, 78);

    var bodyX = 18;
    var bodyY = 100;
    var bodyW = w - 36;
    var bodyH = h - bodyY - 60;

    ctx.save();
    roundRect(ctx, bodyX, bodyY, bodyW, bodyH, 6);
    ctx.clip();

    ctx.fillStyle = C.paperLight;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(bodyX, bodyY, bodyW, bodyH);
    ctx.globalAlpha = 1;

    ctx.fillStyle = C.ink;
    var txtSize = fs(w, 13);
    ctx.font = txtSize + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    var charsPerLine = Math.max(1, Math.floor((bodyW - 20) / (txtSize * 0.95)));
    var paragraphs = ep.text.split('\n');
    var lineY = bodyY + 10;
    var lineH = txtSize * 1.6;

    for (var p = 0; p < paragraphs.length; p++) {
      var para = paragraphs[p];
      if (para.length === 0) {
        lineY += lineH * 0.6;
        continue;
      }
      while (para.length > 0) {
        if (lineY + lineH > bodyY + bodyH) break;
        var slice = para.slice(0, charsPerLine);
        para = para.slice(charsPerLine);
        ctx.fillText(slice, bodyX + 10, lineY);
        lineY += lineH;
      }
      lineY += lineH * 0.4;
    }

    ctx.restore();

    var btnY = h - 46;
    var btnH = 34;
    var epCount = STORY_EPISODES.length;

    if (this._selectedDay > 1) {
      drawGuofengBtn(ctx, 14, btnY, 90, btnH, '上一集', {
        bgColor: C.jadeLight,
        fontSize: 12,
        doubleBorder: false,
        textColor: C.ink,
      });
    }

    if (this._selectedDay < epCount) {
      drawGuofengBtn(ctx, w - 14 - 90, btnY, 90, btnH, '下一集', {
        bgColor: C.jadeLight,
        fontSize: 12,
        doubleBorder: false,
        textColor: C.ink,
      });
    }

    drawGuofengBtn(ctx, (w - 60) / 2, btnY, 60, btnH, '返回', {
      bgColor: C.inkLight,
      fontSize: 12,
      doubleBorder: false,
    });
  }

  handleTap(x, y) {
    var w = this.sm.canvas.width;
    var h = this.sm.canvas.height;

    this._touchStartY = y;
    this._touchMoved = false;

    if (this._selectedDay !== null) {
      this._handleDetailTap(x, y, w, h);
    } else {
      this._handleListTap(x, y, w, h);
    }
  }

  handleDrag(x, y) {
    if (this._selectedDay !== null) return;
    var dy = y - this._touchStartY;
    if (Math.abs(dy) > 5) {
      this._touchMoved = true;
      this._scrollOffset -= dy * 0.8;
      this._touchStartY = y;
    }
  }

  handleDragEnd(x, y) {
    if (this._selectedDay !== null) return;
    if (!this._touchMoved) {
      this._checkListTap(x, y);
    }
  }

  _handleListTap(x, y, w, h) {
    if (x >= 14 && x <= 94 && y >= h - 46 && y <= h - 12) {
      this.sm.transitionTo(STATUS.HOME, { player: this.player });
    }
  }

  _handleDetailTap(x, y, w, h) {
    var btnY = h - 46;
    var btnH = 34;
    var epCount = STORY_EPISODES.length;

    if (y >= btnY && y <= btnY + btnH) {
      var backX = (w - 60) / 2;
      if (x >= backX && x <= backX + 60) {
        this._selectedDay = null;
        return;
      }
      if (this._selectedDay > 1 && x >= 14 && x <= 104) {
        this._selectedDay--;
        return;
      }
      if (this._selectedDay < epCount && x >= w - 14 - 90 && x <= w - 14) {
        this._selectedDay++;
        return;
      }
    }
  }

  _checkListTap(x, y) {
    var w = this.sm.canvas.width;
    var h = this.sm.canvas.height;
    var SLOT = 60;
    var headerH = 48;
    var navH = 50;
    var viewY = headerH + 8;
    var viewH = h - headerH - navH - 16;

    if (y < viewY || y > viewY + viewH || x < 8 || x > w - 8) return;

    var tapY = y - viewY + this._scrollOffset;
    var idx = Math.floor(tapY / SLOT);
    if (idx < 0 || idx >= STORY_EPISODES.length) return;

    var ep = STORY_EPISODES[idx];
    var unlocked = this.player.completedDays >= ep.day - 1;
    if (!unlocked) {
      this._toastText = '继续修行以解锁此章';
      this._toastAlpha = 1;
      return;
    }

    this._selectedDay = ep.day;

    if (!this.player.storyWatched.includes(ep.day)) {
      this.player.storyWatched.push(ep.day);
      this.player.stats.dunwu = (this.player.stats.dunwu || 1) + 1;
      this._toastText = '顿悟 +1';
      this._toastAlpha = 1.2;
      StorageManager.save(this.player);
    }
  }
}

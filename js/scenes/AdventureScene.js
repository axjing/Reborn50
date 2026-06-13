import { STATUS, STAT_LABELS } from '../utils/constants.js';
import {
  C, drawBg, drawCard, roundRect, fs, drawInkBtn,
  drawMist, drawStars, drawSparkle, getFont,
} from '../utils/color.js';
import { StorageManager } from '../systems/StorageManager.js';
import { ParticleSystem } from '../entities/Particle.js';

var ADVENTURES = [
  {
    id: 'zqld', name: '紫气东来', desc: '清晨第一缕紫气入体，真气暴涨',
    cond: function(p) { return p.stats.zhenqi >= 5 && p.completedDays >= 3; },
    reward: { zhenqi: 3, exp: 10 },
  },
  {
    id: 'jxwd', name: '静心悟道', desc: '在书院中偶然读到一本失传古籍，心境豁然开朗',
    cond: function(p) { return p.stats.xinjing >= 5 && p.streak >= 5; },
    reward: { xinjing: 3, exp: 10 },
  },
  {
    id: 'qxtc', name: '勤学天赐', desc: '刻苦钻研感动上天，功力大增',
    cond: function(p) { return p.stats.gongli >= 5 && p.completedDays >= 7; },
    reward: { gongli: 3, xueshi: 2, exp: 15 },
  },
  {
    id: 'yscs', name: '养生餐食', desc: '山中老农赠你一筐灵草，清气充盈',
    cond: function(p) { return p.stats.qingqi >= 5 && p.streak >= 3; },
    reward: { qingqi: 3, tipo: 1, exp: 8 },
  },
  {
    id: 'xylb', name: '星夜论道', desc: '在望月台偶遇一位神秘老者，与你论道一夜',
    cond: function(p) { return p.completedDays >= 10 && p.streak >= 7; },
    reward: { dunwu: 5, xinjing: 3, exp: 20 },
  },
  {
    id: 'swfc', name: '山林访翠', desc: '在山林中发现一处隐秘温泉，体魄得到淬炼',
    cond: function(p) { return p.stats.tipo >= 5 && p.completedDays >= 5; },
    reward: { tipo: 3, exp: 8 },
  },
  {
    id: 'bzbl', name: '宝藏秘录', desc: '在书院暗格中发现一本上古修行手札',
    cond: function(p) { return p.stats.xueshi >= 8 && p.completedDays >= 15; },
    reward: { xueshi: 5, gongli: 3, exp: 25 },
  },
  {
    id: 'tydg', name: '天运大观', desc: '天地感应，七窍贯通，全属性提升',
    cond: function(p) { return p.streak >= 14 && p.completedDays >= 20; },
    reward: { zhenqi: 2, xinjing: 2, tipo: 2, xueshi: 2, gongli: 2, qingqi: 2, dunwu: 2, exp: 30 },
  },
];

export class AdventureScene {
  constructor(sm) {
    this.sm = sm;
    this.player = null;
    this._unlocked = [];
    this._found = [];
    this._timer = 0;
    this._showResult = null;
    this._pts = new ParticleSystem();
    this._rollTimer = 0;
    this._rolling = false;
  }

  onEnter(data) {
    this.player = data.player;
    this._timer = 0;
    this._showResult = null;
    this._rolling = false;
    this._pts = new ParticleSystem();
    this._found = this.player.adventures || [];

    this._unlocked = [];
    for (var i = 0; i < ADVENTURES.length; i++) {
      var a = ADVENTURES[i];
      if (!this._found.includes(a.id) && a.cond(this.player)) {
        this._unlocked.push(a);
      }
    }
  }

  update(dt) {
    this._timer += dt;
    this._pts.update();

    if (this._rolling) {
      this._rollTimer -= dt;
      this._pts.emit(
        Math.random() * this.sm.canvas.width,
        Math.random() * this.sm.canvas.height * 0.3,
        2
      );
      if (this._rollTimer <= 0) {
        this._rolling = false;
      }
    }
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    drawBg(ctx, w, h);
    drawStars(ctx, w, h, this._timer * 0.5, 15);
    drawMist(ctx, w, h, this._timer * 0.2);
    drawSparkle(ctx, w * 0.3, 20, 4, this._timer * 1.3);
    drawSparkle(ctx, w * 0.7, 40, 3, this._timer * 1.7 + 1);

    ctx.save();
    ctx.globalAlpha = 0.92;
    drawCard(ctx, 8, 6, w - 16, h - 12, 12);
    ctx.restore();

    ctx.fillStyle = C.ink;
    ctx.font = getFont(w, 18, 'song');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('江湖奇遇', w / 2, 16);

    ctx.fillStyle = C.inkMuted;
    ctx.font = getFont(w, 11, 'sans');
    ctx.fillText('待触发: ' + this._unlocked.length + '  |  已触发: ' + this._found.length, w / 2, 40);

    ctx.save();
    roundRect(ctx, 14, 55, w - 28, h - 120, 0);
    ctx.clip();

    var y = 60;
    if (this._unlocked.length === 0 && this._found.length === 0) {
      ctx.fillStyle = C.inkMuted;
      ctx.font = getFont(w, 13, 'sans');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('暂无奇遇，继续修行以触发', w / 2, h / 2);
    } else {
      if (this._unlocked.length > 0) {
        ctx.fillStyle = C.red;
        ctx.font = getFont(w, 13, 'song');
        ctx.textAlign = 'left';
        ctx.fillText('—— 可触发 ——', 24, y);
        y += 25;

        for (var i = 0; i < this._unlocked.length; i++) {
          var a = this._unlocked[i];
          roundRect(ctx, 18, y, w - 36, 60, 8);
          ctx.fillStyle = 'rgba(212,160,74,0.08)';
          ctx.fill();
          ctx.strokeStyle = C.gold;
          ctx.lineWidth = 1;
          roundRect(ctx, 18, y, w - 36, 60, 8);
          ctx.stroke();

          ctx.fillStyle = C.gold;
          ctx.font = getFont(w, 14, 'song');
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(a.name, 28, y + 6);

          ctx.fillStyle = C.inkLight;
          ctx.font = getFont(w, 10, 'sans');
          ctx.fillText(a.desc, 28, y + 28);

          ctx.fillStyle = C.gold;
          ctx.font = getFont(w, 10, 'sans');
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          ctx.fillText('触发', w - 30, y + 20);

          y += 66;
        }
      }

      if (this._found.length > 0) {
        y += 6;
        ctx.fillStyle = C.jade;
        ctx.font = getFont(w, 13, 'song');
        ctx.textAlign = 'left';
        ctx.fillText('—— 已触发 ——', 24, y);
        y += 25;

        for (var j = 0; j < this._found.length; j++) {
          for (var k = 0; k < ADVENTURES.length; k++) {
            if (ADVENTURES[k].id === this._found[j]) {
              ctx.fillStyle = C.jade;
              ctx.font = getFont(w, 10, 'sans');
              ctx.fillText('✔ ' + ADVENTURES[k].name, 28, y);
              y += 18;
              break;
            }
          }
        }
      }
    }

    ctx.restore();

    drawInkBtn(ctx, (w - 100) / 2, h - 50, 100, 36, '返回', C.inkMuted);
    this._pts.draw(ctx);

    if (this._showResult) {
      ctx.save();
      ctx.fillStyle = 'rgba(60,45,30,0.5)';
      ctx.fillRect(0, 0, w, h);

      var rw = Math.min(280, w - 40);
      var rh = 180;
      var rx = (w - rw) / 2;
      var ry = (h - rh) / 2;
      drawCard(ctx, rx, ry, rw, rh, 14);

      ctx.fillStyle = C.gold;
      ctx.font = getFont(w, 20, 'song');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(this._showResult.name, w / 2, ry + 16);

      ctx.fillStyle = C.inkLight;
      ctx.font = getFont(w, 12, 'sans');
      ctx.fillText(this._showResult.desc, w / 2, ry + 46);

      ctx.fillStyle = C.jade;
      ctx.font = getFont(w, 14, 'sans');
      ctx.fillText('修为 +' + (this._showResult.reward.exp || 0), w / 2, ry + 80);

      var rewardKeys = Object.keys(this._showResult.reward).filter(function(k) { return k !== 'exp'; });
      if (rewardKeys.length > 0) {
        ctx.fillStyle = C.gold;
        ctx.font = getFont(w, 12, 'sans');
        ctx.fillText(rewardKeys.map(function(k) { return (STAT_LABELS[k] || k) + '+' + this._showResult.reward[k]; }.bind(this)).join('  '), w / 2, ry + 106);
      }

      drawInkBtn(ctx, (w - 100) / 2, ry + rh - 44, 100, 32, '收下', C.gold);
      ctx.restore();
    }
  }

  handleTap(x, y) {
    var w = this.sm.canvas.width;
    var h = this.sm.canvas.height;

    if (this._showResult) {
      var advId = this._showResult.id;
      this._found.push(advId);
      this.player.adventures = this._found;
      var reward = this._showResult.reward;
      Object.keys(reward).forEach(function(k) {
        if (k === 'exp') {
          this.player.exp += reward[k];
        } else if (this.player.stats[k] !== undefined) {
          this.player.stats[k] += reward[k];
        }
      }.bind(this));
      StorageManager.save(this.player);
      this._unlocked = this._unlocked.filter(function(a) { return a.id !== advId; });
      this._showResult = null;
      return;
    }

    if (x >= (w - 100) / 2 && x <= (w - 100) / 2 + 100 && y >= h - 50 && y <= h - 14) {
      this.sm.transitionTo(STATUS.HOME, { player: this.player });
      return;
    }

    var clickY = 60;
    if (this._unlocked.length > 0) {
      clickY += 25;
      for (var i = 0; i < this._unlocked.length; i++) {
        if (x >= 18 && x <= w - 18 && y >= clickY && y <= clickY + 60) {
          this._showResult = this._unlocked[i];
          this._rolling = true;
          this._rollTimer = 0.8;
          return;
        }
        clickY += 66;
      }
    }
  }
}



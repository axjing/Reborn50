import { STATUS } from '../utils/constants.js';
import { C, drawBg, drawCard, roundRect, fs, drawBtn, drawDecoLine } from '../utils/color.js';
import { RULES } from '../data/rules.js';
import { ITEMS } from '../data/items.js';
import { StorageManager } from '../systems/StorageManager.js';
import { ProgressBar } from '../ui/ProgressBar.js';
import { ParticleSystem } from '../entities/Particle.js';

var EMOJI = ['🌅', '🧘', '🏃', '📖', '🔧', '🥗', '✍️'];
var LABELS = { wil: '意志', spi: '灵力', str: '力量', int: '智慧', skl: '技巧', vit: '活力', mnd: '心境' };

export class ChallengeScene {
  constructor(sm) {
    this.sm = sm;
    this.player = null;
    this.pts = new ParticleSystem();
    this.done = [];
    this.bar = null;
    this.toast = '';
    this.toastT = 0;
    this.rew = 0;
    this.phase = 0;
    this.rTimer = 0;
    this.rItem = null;
    this.rBonus = null;
    this.rAch = null;
    this.celeT = 0;
    this.charBob = 0;
  }

  onEnter(data) {
    this.player = data.player;
    this.done = [];
    for (var i = 0; i < 7; i++) this.done[i] = false;
    this.toast = '';
    this.toastT = 0;
    this.rew = 0;
    this.phase = 0;
    this.rTimer = 0;
    this.rItem = null;
    this.rBonus = null;
    this.rAch = null;
    this.celeT = 0;
    this.charBob = 0;
    this.pts = new ParticleSystem();
    var w = this.sm.canvas.width;
    this.bar = new ProgressBar(16, 12, w - 32, 8, 7, C.jade);
  }

  tapRule(i) {
    if (this.done[i]) return;
    this.done[i] = true;
    this.player.applyRule(i);
    this.toast = EMOJI[i] + ' ' + RULES[i].name;
    this.toastT = 1.2;
    this.pts.emit(this.sm.canvas.width * 0.3, 120 + i * 60, 6);
    StorageManager.save(this.player);
    if (this.player.isAllRulesDone()) this.startRew();
  }

  startRew() {
    this.toast = '';
    this.toastT = 0;
    this.rew = 1;
    this.phase = 0;
    this.rTimer = 0.8;
    this.celeT = 0;
    this.bar.color = C.gold;

    this.player.completeDay();

    if (Math.random() < 0.35) {
      var pool = [];
      for (var i = 0; i < ITEMS.length; i++) {
        if (ITEMS[i].type === 'consumable' || ITEMS[i].type === 'permanent') pool.push(ITEMS[i]);
      }
      if (pool.length > 0) this.rItem = pool[Math.floor(Math.random() * pool.length)];
    }

    if (Math.random() < 0.5) {
      var keys = Object.keys(this.player.stats);
      var k = keys[Math.floor(Math.random() * keys.length)];
      var v = 1 + Math.floor(this.player.streak / 7);
      this.rBonus = { label: LABELS[k] || k, val: v };
      this.player.stats[k] = (this.player.stats[k] || 0) + v;
    }

    var ach = StorageManager.checkAchievements(this.player);
    if (ach.length > 0) this.rAch = ach[0];
    StorageManager.save(this.player);
  }

  update(dt) {
    if (this.toastT > 0) this.toastT -= dt;
    this.pts.update();
    this.charBob += dt * 2.5;

    var c = 0;
    for (var i = 0; i < 7; i++) { if (this.done[i]) c++; }
    this.bar.val = c;

    if (this.rew === 1) {
      this.rTimer -= dt;
      this.celeT += dt;
      if (this.celeT % 0.12 < 0.04) {
        this.pts.emit(Math.random() * this.sm.canvas.width, Math.random() * this.sm.canvas.height * 0.5, 3);
      }
      if (this.rTimer <= 0) {
        this.phase++;
        this.rTimer = 1.0;
        var maxP = this.rAch ? 6 : 5;
        if (this.phase >= maxP) this.rew = 2;
      }
    }
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    drawBg(ctx, w, h);

    drawCard(ctx, 10, 6, w - 20, h - 12, 10);
    this.bar.draw(ctx);

    var done = 0;
    for (var i = 0; i < 7; i++) { if (this.done[i]) done++; }

    ctx.fillStyle = C.ink;
    ctx.font = 'bold ' + fs(w, 16) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('今日挑战 ' + done + '/7', w / 2, 26);

    for (var j = 0; j < 7; j++) {
      var isDone = this.done[j];
      var y = 64 + j * 58;
      var rh = 48;

      roundRect(ctx, 18, y, w - 36, rh, 8);
      ctx.fillStyle = isDone ? 'rgba(46,139,87,0.08)' : 'rgba(255,255,248,0.5)';
      ctx.fill();
      ctx.strokeStyle = isDone ? C.jade : C.goldLight;
      ctx.lineWidth = 1;
      if (!isDone) { ctx.setLineDash([3, 3]); }
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = fs(w, 18) + 'px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(EMOJI[j], 26, y + 5);

      ctx.fillStyle = isDone ? C.inkMuted : C.ink;
      ctx.font = fs(w, 13) + 'px sans-serif';
      ctx.fillText(RULES[j].name, 56, y + 7);

      ctx.fillStyle = C.inkMuted;
      ctx.font = fs(w, 9) + 'px sans-serif';
      ctx.fillText(RULES[j].desc, 56, y + 25);

      if (isDone) {
        ctx.fillStyle = C.jade;
        ctx.font = 'bold ' + fs(w, 14) + 'px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('✔', w - 26, y + rh / 2);
      }

      ctx.fillStyle = isDone ? C.jade : C.inkMuted;
      ctx.font = fs(w, 9) + 'px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('+' + RULES[j].stat.toUpperCase(), w - 26, y + rh - 10);
    }

    if (this.rew > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(44,44,44,0.55)';
      ctx.fillRect(0, 0, w, h);

      var rCount = 2;
      if (this.rAch) rCount++;
      if (this.rBonus) rCount++;
      rCount++; // streak always shown

      var cellH = 38;
      var gap = 6;
      var titleH = 58;
      var btnH = 42;
      var padV = 16;
      var contentH = rCount * cellH + (rCount - 1) * gap;
      var panelH = titleH + contentH + btnH + padV * 3;
      panelH = Math.min(panelH, h - 40);
      var rw = Math.min(280, w - 40);
      var rx = (w - rw) / 2;
      var ry = (h - panelH) / 2;

      drawCard(ctx, rx, ry, rw, panelH, 12, true);

      ctx.fillStyle = C.red;
      ctx.font = 'bold ' + fs(w, 20) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('今日功成', w / 2, ry + 10);

      ctx.fillStyle = C.inkLight;
      ctx.font = fs(w, 12) + 'px sans-serif';
      ctx.fillText('第 ' + this.player.completedDays + ' 天', w / 2, ry + 36);

      var cellY = ry + titleH;
      var cellW = (rw - 32) / 2;

      if (this.phase >= 1) {
        this.rewardCell(ctx, rx + 12, cellY, cellW, cellH, '修为', '+10', C.red);
      }
      if (this.phase >= 2) {
        var nm = this.rItem ? this.rItem.name : '根骨';
        var vl = this.rItem ? '+' + (this.rItem.effect ? Object.values(this.rItem.effect)[0] : '') : '+' + Math.floor(this.player.streak / 2);
        this.rewardCell(ctx, rx + 14 + cellW, cellY, cellW, cellH, nm, vl, C.jade);
      }

      var row2 = cellY + cellH + gap;
      var row3 = row2 + cellH + gap;
      var used = 2;

      if (this.phase >= 3 && this.rAch) {
        this.rewardCell(ctx, rx + 12, row2, cellW, cellH, '成就', this.rAch.name, C.gold);
        used++;
      }
      if (this.phase >= (this.rAch ? 4 : 3) && this.rBonus) {
        var by = this.rAch ? row3 : row2;
        this.rewardCell(ctx, rx + 14 + cellW, by, cellW, cellH, this.rBonus.label, '+' + this.rBonus.val, C.inkLight);
        used++;
      }
      if (this.phase >= (this.rAch ? 5 : 4)) {
        var sy = row2;
        if (this.rAch && this.rBonus) sy = row3 + cellH + gap;
        else if (this.rAch || this.rBonus) sy = row3;
        var sw = (this.rAch && this.rBonus) ? cellW : rw - 24;
        var sx = (this.rAch && this.rBonus) ? rx + 12 : rx + 12;
        this.rewardCell(ctx, sx, sy, sw, cellH, '连击', this.player.streak + '天', C.gold);
      }

      var btnY = panelH - btnH - padV;
      if (this.phase >= (this.rAch ? 6 : 5) || this.rew === 2) {
        drawBtn(ctx, rx + 40, ry + btnY, rw - 80, btnH, '出征', C.red);
      }

      ctx.restore();
    }

    this.pts.draw(ctx);

    if (this.toastT > 0) {
      roundRect(ctx, w / 2 - 80, 220, 160, 26, 8);
      ctx.fillStyle = 'rgba(44,44,44,0.85)';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = fs(w, 13) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.toast, w / 2, 233);
    }
  }

  rewardCell(ctx, x, y, w, h, label, val, color) {
    var c = color || C.gold;
    ctx.save();
    ctx.shadowColor = C.shadow;
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    roundRect(ctx, x, y, w, h, 6);
    ctx.fillStyle = C.white;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = c;
    ctx.lineWidth = 1;
    roundRect(ctx, x + 1, y + 1, w - 2, h - 2, 5);
    ctx.stroke();
    ctx.fillStyle = C.inkLight;
    ctx.font = Math.min(fs(ctx.canvas.width, 11), 14) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x + w / 2, y + 4);
    ctx.fillStyle = c;
    ctx.font = 'bold ' + Math.min(fs(ctx.canvas.width, 13), 16) + 'px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(val, x + w / 2, y + h / 2 + 4);
    ctx.restore();
  }

  handleTap(x, y) {
    var w = this.sm.canvas.width;
    var h = this.sm.canvas.height;

    if (this.player.completedToday && this.rew === 0) return;

    if (this.rew === 2 || (this.rew === 1 && this.phase >= (this.rAch ? 6 : 5))) {
      var rCount = 2;
      if (this.rAch) rCount++;
      if (this.rBonus) rCount++;
      rCount++;
      var cellH = 38;
      var gap = 6;
      var titleH = 58;
      var btnH = 42;
      var padV = 16;
      var contentH = rCount * cellH + (rCount - 1) * gap;
      var panelH = titleH + contentH + btnH + padV * 3;
      panelH = Math.min(panelH, h - 40);
      var rw = Math.min(280, w - 40);
      var rx = (w - rw) / 2;
      var ry = (h - panelH) / 2;
      var btnY = panelH - btnH - padV;
      var bx = rx + 40;
      var by = ry + btnY;

      if (x >= bx && x <= bx + rw - 80 && y >= by && y <= by + btnH) {
        var cd = this.player.completedDays;
        this.sm.switchTo(cd % 7 === 0 && cd >= 7 ? STATUS.BOSS : STATUS.BATTLE, { player: this.player });
      }
      return;
    }
    if (this.rew === 1) return;
    if (this.player.isAllRulesDone()) return;

    for (var j = 0; j < 7; j++) {
      var ry2 = 64 + j * 58;
      if (x >= 18 && x <= w - 18 && y >= ry2 && y <= ry2 + 48) {
        if (!this.done[j]) this.tapRule(j);
        return;
      }
    }
  }
}

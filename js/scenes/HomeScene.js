import { STATUS, TOTAL_DAYS } from '../utils/constants.js';
import { C, drawBg, drawCard, roundRect, fs, drawBtn, drawChar, drawCloud, drawSparkle } from '../utils/color.js';
import { RULES } from '../data/rules.js';
import { Player } from '../entities/Player.js';
import { StorageManager } from '../systems/StorageManager.js';
import { Button } from '../ui/Button.js';
import { ProgressBar } from '../ui/ProgressBar.js';
import { StatsPanel } from '../ui/StatsPanel.js';

export class HomeScene {
  constructor(sm) {
    this.sm = sm;
    this.player = null;
    this.buttons = [];
    this.panel = null;
    this.bars = {};
    this.toast = '';
    this.toastT = 0;
    this.lvFlash = 0;
    this.charBob = 0;
    this.clouds = [];
    for (var i = 0; i < 3; i++) this.clouds.push({ x: Math.random(), s: 0.6 + Math.random() * 0.8, sp: 0.1 + Math.random() * 0.15 });
  }

  onEnter(data) {
    var w = this.sm.canvas.width;

    if (data && data.newGame) {
      this.player = new Player({});
      this.toast = '完成今日挑战，开启重生之旅';
      this.toastT = 3;
    } else {
      this.player = StorageManager.load();
      if (!this.player) this.player = new Player({});
      if (StorageManager.checkNewDay(this.player)) {
        this.toast = '新的一天，新的挑战';
        this.toastT = 2;
      }
    }

    this.lvFlash = (data && data.levelUp) ? 2 : 0;
    this.panel = new StatsPanel();
    this.buttons = [];
    this.charBob = 0;

    var bw = Math.min(160, w - 60);
    var bh = 44;
    var cx = (w - bw) / 2;
    var by = Math.max(210, this.sm.canvas.height - 250);

    this.buttons.push(new Button(cx, by, bw, bh, '今日挑战', C.red));
    this.buttons.push(new Button(cx, by + bh + 10, bw, bh, '开始冒险', C.jade));
    this.buttons.push(new Button(cx, by + (bh + 10) * 2, bw, bh, '记录', C.gold));
    this.buttons.push(new Button(cx, by + (bh + 10) * 3, bw, bh, '状态', C.inkLight));

    this.bars.day = new ProgressBar(16, 14, w - 32, 10, TOTAL_DAYS, C.gold);
    this.bars.hp = new ProgressBar(16, 38, w - 32, 8, this.player.maxHP, C.red);
    this.bars.sp = new ProgressBar(16, 54, w - 32, 8, this.player.maxSP, C.jade);
  }

  act(i) {
    if (i === 0) {
      if (this.player.completedToday) {
        this.toast = '今日已完成，明日再来吧';
        this.toastT = 2;
        return;
      }
      this.sm.switchTo(STATUS.CHALLENGE, { player: this.player });
    } else if (i === 1) this.goBattle();
    else if (i === 2) this.sm.switchTo(STATUS.HISTORY, { player: this.player });
    else this.panel.visible = !this.panel.visible;
  }

  goBattle() {
    if (!this.player.isAllRulesDone()) {
      this.toast = '请先完成今日全部挑战';
      this.toastT = 2;
      return;
    }
    var cd = this.player.completedDays;
    this.sm.switchTo(cd % 7 === 0 && cd >= 7 ? STATUS.BOSS : STATUS.BATTLE, { player: this.player });
  }

  update(dt) {
    if (this.toastT > 0) this.toastT -= dt;
    if (this.lvFlash > 0) this.lvFlash -= dt;
    this.charBob += dt * 2.5;
    var p = this.player;
    this.bars.hp.maxVal = p.maxHP;
    this.bars.hp.val = p.hp;
    this.bars.sp.maxVal = p.maxSP;
    this.bars.sp.val = p.sp;
    this.bars.day.val = p.day - 1;
    this.bars.hp.label = 'HP ' + p.hp + '/' + p.maxHP;
    this.bars.sp.label = 'SP ' + p.sp + '/' + p.maxSP;
    this.bars.day.label = 'Day ' + (p.day - 1) + '/' + TOTAL_DAYS;

    for (var i = 0; i < this.clouds.length; i++) {
      this.clouds[i].x += this.clouds[i].sp * 0.003;
      if (this.clouds[i].x > 1.2) this.clouds[i].x = -0.2;
    }
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    drawBg(ctx, w, h);

    for (var ci = 0; ci < this.clouds.length; ci++) {
      drawCloud(ctx, w * this.clouds[ci].x, 40 + ci * 30, this.clouds[ci].s);
    }

    drawCard(ctx, 10, 6, w - 20, 62, 8);
    for (var k in this.bars) this.bars[k].draw(ctx);

    ctx.fillStyle = C.ink;
    ctx.font = fs(w, 13) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Lv.' + this.player.level + '  连击 ' + this.player.streak + '天', w / 2, 76);

    var done = this.player.completedRules.length;
    ctx.fillStyle = C.inkMuted;
    ctx.font = fs(w, 12) + 'px sans-serif';
    ctx.fillText('已完成 ' + done + '/' + RULES.length + ' 项挑战', w / 2, 94);

    drawChar(ctx, w / 2, 168, 1.6, this.charBob);

    drawSparkle(ctx, w / 2 - 40, 132, 4, this.charBob * 1.3);
    drawSparkle(ctx, w / 2 + 40, 140, 3, this.charBob * 1.7 + 1);
    drawSparkle(ctx, w / 2 - 30, 148, 3, this.charBob * 2.1 + 2);

    if (this.player.isAllRulesDone()) {
      drawBtn(ctx, w / 2 - 50, 204, 100, 26, '今日完成', C.jade);
    }

    for (var i = 0; i < this.buttons.length; i++) this.buttons[i].draw(ctx);

    if (this.lvFlash > 0) {
      drawCard(ctx, w / 2 - 80, h * 0.55, 160, 36, 8, true);
      ctx.fillStyle = C.red;
      ctx.font = 'bold ' + fs(w, 16) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Lv.' + this.player.level + ' 升级！', w / 2, h * 0.55 + 18);
    }

    if (this.toastT > 0) {
      var tw = Math.min(280, w - 40);
      roundRect(ctx, (w - tw) / 2, h * 0.42, tw, 30, 8);
      ctx.fillStyle = 'rgba(44,44,44,0.85)';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = fs(w, 13) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.toast, w / 2, h * 0.42 + 15);
    }

    this.panel.draw(ctx, this.player);
  }

  handleTap(x, y) {
    if (this.panel && this.panel.visible) { this.panel.visible = false; return; }
    for (var i = 0; i < this.buttons.length; i++) {
      var b = this.buttons[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        this.act(i);
        return;
      }
    }
  }
}

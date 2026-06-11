import { STATUS } from '../utils/constants.js';
import { C, drawBg, drawCard, roundRect, fs, drawBtn } from '../utils/color.js';
import { StorageManager } from '../systems/StorageManager.js';
import { Button } from '../ui/Button.js';
import { ParticleSystem } from '../entities/Particle.js';

export class GameOverScene {
  constructor(sm) {
    this.sm = sm;
    this.player = null;
    this.btns = [];
    this.pts = new ParticleSystem();
    this.win = false;
    this.t = 0;
  }

  onEnter(data) {
    this.player = data.player;
    this.win = data.isVictory || false;
    this.t = 0;
    this.pts = new ParticleSystem();
    var w = this.sm.canvas.width;
    this.btns = [new Button((w - 200) / 2, this.sm.canvas.height - 90, 200, 48, '重新开始', C.red)];
  }

  update(dt) {
    this.t += dt;
    if (this.win && this.t < 4) {
      if (Math.floor(this.t * 6) % 3 === 0) {
        this.pts.emit(Math.random() * this.sm.canvas.width, Math.random() * this.sm.canvas.height * 0.5, 10);
      }
    }
    this.pts.update();
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    drawBg(ctx, w, h);

    if (this.win) {
      ctx.fillStyle = C.gold;
      ctx.font = 'bold ' + fs(w, 32) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('恭喜通关！', w / 2, h * 0.2);

      ctx.fillStyle = C.ink;
      ctx.font = fs(w, 15) + 'px sans-serif';
      ctx.fillText('你完成了 50 天自律挑战', w / 2, h * 0.2 + 40);

      ctx.fillStyle = C.jade;
      ctx.font = 'bold ' + fs(w, 18) + 'px sans-serif';
      ctx.fillText('旧我已死，重生归来', w / 2, h * 0.2 + 70);
    } else {
      ctx.fillStyle = C.red;
      ctx.font = 'bold ' + fs(w, 28) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('挑战失败', w / 2, h * 0.22);

      ctx.fillStyle = C.ink;
      ctx.font = fs(w, 14) + 'px sans-serif';
      ctx.fillText('未能在 50 天内完成挑战', w / 2, h * 0.22 + 36);
    }

    drawCard(ctx, w / 2 - 130, h * 0.36, 260, 165, 12);

    var stats = [
      '完成天数：' + this.player.completedDays + ' / 50',
      '最终等级：Lv.' + this.player.level,
      '总重置次数：' + this.player.totalResets,
      '最高连击：' + this.player.streak + ' 天',
      '击败 BOSS：' + this.player.defeatedBosses.length,
    ];
    ctx.fillStyle = C.inkLight;
    ctx.font = fs(w, 13) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (var i = 0; i < stats.length; i++) {
      ctx.fillText(stats[i], w / 2 - 110, h * 0.36 + 16 + i * 26);
    }

    for (var j = 0; j < this.btns.length; j++) this.btns[j].draw(ctx);
    this.pts.draw(ctx);
  }

  handleTap(x, y) {
    for (var i = 0; i < this.btns.length; i++) {
      var b = this.btns[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        this.player.resetDay();
        StorageManager.save(this.player);
        this.sm.switchTo(STATUS.HOME, { player: this.player });
        return;
      }
    }
  }
}

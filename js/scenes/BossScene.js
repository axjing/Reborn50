import { STATUS } from '../utils/constants.js';
import { C, drawBg, drawCard, roundRect, fs, drawBtn, drawDecoLine } from '../utils/color.js';
import { BOSSES } from '../data/monsters.js';
import { Monster } from '../entities/Monster.js';
import { StorageManager } from '../systems/StorageManager.js';
import { Button } from '../ui/Button.js';
import { ProgressBar } from '../ui/ProgressBar.js';
import { ParticleSystem } from '../entities/Particle.js';

export class BossScene {
  constructor(sm) {
    this.sm = sm;
    this.player = null;
    this.m = null;
    this.btns = [];
    this.pts = new ParticleSystem();
    this.log = [];
    this.over = false;
    this.pHP = null;
    this.mHP = null;
    this._phase = 0;
    this.won = false;
    this._anim = 0;
    this._res = '';
    this._shake = 0;
    this._ach = '';
    this._achT = 0;
    this._dialT = 2;
  }

  onEnter(data) {
    this.player = data.player;
    this.over = false;
    this.won = false;
    this.log = [];
    this._phase = 0;
    this._anim = 0;
    this._res = '';
    this._shake = 0;
    this._ach = '';
    this._achT = 0;
    this._dialT = 2;

    var cfg = BOSSES[BOSSES.length - 1];
    for (var i = 0; i < BOSSES.length; i++) {
      if (BOSSES[i].day === this.player.completedDays) { cfg = BOSSES[i]; break; }
    }
    this.m = new Monster(cfg);

    var w = this.sm.canvas.width;
    this.pHP = new ProgressBar(16, 38, w - 32, 10, this.player.maxHP, C.red);
    this.mHP = new ProgressBar(16, 80, w - 32, 10, this.m.maxHP, C.red);

    var bw = Math.min(86, (w - 50) / 2);
    var bh = 38;
    var by = this.sm.canvas.height - 78;
    this.btns = [
      new Button(16, by, bw, bh, '攻击', C.red),
      new Button(26 + bw, by, bw, bh, '技能', C.jade),
      new Button(16, by + bh + 8, bw, bh, '防御', C.gold),
      new Button(26 + bw, by + bh + 8, bw, bh, '物品', C.inkLight),
    ];
    this.log.push('"' + this.m.quote + '"');
  }

  btap(i) {
    if (this.over || this._dialT > 0) return;
    if (i === 0) this.atk();
    else if (i === 1) this.skl();
    else if (i === 2) this.def();
    else this.item();
  }

  atk() {
    var d = Math.max(1, this.player.attack - Math.floor(this.m.skl / 2) + Math.floor(Math.random() * 4));
    if (Math.random() < this.player.critChance) { d = Math.floor(d * 1.5); this.log.push('暴击！' + d); }
    else this.log.push('攻击 ' + d);
    this.hitM(d);
  }

  skl() {
    if (this.player.sp < 8) { this.log.push('灵力不足'); return; }
    this.player.sp -= 8;
    var d = Math.max(1, this.player.magicAttack * 3 - Math.floor(this.m.skl / 2));
    this.log.push('技能 ' + d);
    this.hitM(d);
  }

  def() {
    this.log.push('防御');
    var dmg = Math.max(0, this.m.dealDamage() - this.player.defense - 5);
    this.player.takeDamage(dmg);
    this.log.push('受到 ' + dmg);
    this._shake = 4;
    this.chkDeath();
    if (!this.over) this.mTurn();
  }

  item() {
    if (!this.player.inventory.includes('potion_hp')) { this.log.push('无药水'); this.mTurn(); return; }
    this.player.inventory = this.player.inventory.filter(function(i) { return i !== 'potion_hp'; });
    this.player.hp = Math.min(this.player.maxHP, this.player.hp + 30);
    this.log.push('使用药水 +30HP');
    this.mTurn();
  }

  hitM(dmg) {
    this.pts.emit(this.sm.canvas.width * 0.7, this.sm.canvas.height * 0.22, 12);
    this.m.takeDamage(dmg);
    this._anim = 3;
    this._shake = 5;
    if (!this.m.isAlive()) {
      this.log.push('击败 BOSS！');
      this.over = true;
      this.won = true;
      this._res = 'win';
      this.player.defeatedBosses.push(this.player.completedDays);
      this.player.exp += 30;
      var ach = StorageManager.checkAchievements(this.player);
      if (ach.length > 0) { this._ach = '成就：' + ach[0].name; this._achT = 3; }
      StorageManager.save(this.player);
      return;
    }
    this.mTurn();
  }

  mTurn() {
    if (this.over) return;
    if (this.m.hp < this.m.maxHP * 0.3 && this._phase === 0) {
      this._phase = 1;
      this.log.push('BOSS 狂暴！');
      this.m.str += 5;
    }
    var d = this.m.dealDamage() + (this._phase > 0 ? 3 : 0);
    var a = this.player.takeDamage(d);
    this.log.push('受到 ' + a);
    this._shake = 4;
    this.chkDeath();
  }

  chkDeath() {
    if (!this.player.isAlive()) {
      this.log.push('你被击败了');
      this.over = true;
      this.won = false;
      this._res = 'lose';
      this.player.hp = Math.floor(this.player.maxHP / 2);
      StorageManager.save(this.player);
    }
  }

  update(dt) {
    if (this._dialT > 0) this._dialT -= dt;
    if (this._achT > 0) this._achT -= dt;
    this.pts.update();
    this.pHP.maxVal = this.player.maxHP;
    this.pHP.val = this.player.hp;
    this.mHP.maxVal = this.m.maxHP;
    this.mHP.val = this.m.hp;
    if (this._anim > 0) this._anim -= dt;
    if (this._shake > 0) this._shake *= 0.85;
    if (this.log.length > 5) this.log.shift();
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;

    ctx.save();
    if (this._shake > 0.5) {
      ctx.translate((Math.random() - 0.5) * this._shake, (Math.random() - 0.5) * this._shake);
    }

    drawBg(ctx, w, h);

    ctx.fillStyle = C.red;
    ctx.font = 'bold ' + fs(w, 20) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('BOSS 战', w / 2, 12);

    ctx.fillStyle = C.inkLight;
    ctx.font = fs(w, 12) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('勇者', 16, 50);
    this.pHP.draw(ctx);

    var bc = this._phase > 0 ? C.red : C.gold;
    ctx.fillStyle = bc;
    ctx.font = 'bold ' + fs(w, 13) + 'px sans-serif';
    ctx.fillText(this.m.name, 16, 92);
    this.mHP.draw(ctx);

    var ao = Math.sin(this._anim * 8) * 5;
    var mx = Math.floor(w * 0.7);
    var my = Math.floor(h * 0.24);

    ctx.save();
    ctx.shadowColor = C.shadow;
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 2;
    roundRect(ctx, mx - 32, my - 28, 64, 56, 12);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = bc;
    ctx.lineWidth = 2;
    roundRect(ctx, mx - 29, my - 25, 58, 50, 10);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = bc;
    ctx.font = 'bold ' + fs(w, 34) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('凶', mx, my + ao);
    ctx.restore();

    roundRect(ctx, 10, h - 116, w - 20, 28, 6);
    ctx.fillStyle = 'rgba(44,44,44,0.06)';
    ctx.fill();
    ctx.strokeStyle = C.goldLight;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    this.log.slice(-4).forEach(function(m, i) {
      ctx.fillStyle = C.inkLight;
      ctx.font = fs(w, 11) + 'px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(m, 18, h - 113 + i * 7);
    });

    for (var i = 0; i < this.btns.length; i++) this.btns[i].draw(ctx);
    this.pts.draw(ctx);

    if (this._achT > 0) {
      roundRect(ctx, w / 2 - 100, 130, 200, 26, 8);
      ctx.fillStyle = 'rgba(44,44,44,0.85)';
      ctx.fill();
      ctx.fillStyle = C.gold;
      ctx.font = 'bold ' + fs(w, 12) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this._ach, w / 2, 143);
    }

    if (this._dialT > 0) {
      drawCard(ctx, w / 2 - 120, h * 0.45, 240, 34, 10, true);
      ctx.fillStyle = bc;
      ctx.font = 'italic ' + fs(w, 13) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('"' + this.m.quote + '"', w / 2, h * 0.45 + 17);
    }

    if (this.over) {
      ctx.restore();
      ctx.fillStyle = 'rgba(44,44,44,0.55)';
      ctx.fillRect(0, 0, w, h);
      var rc = this.won ? C.gold : C.red;
      var rt = this.won ? '胜利！' : '战败';
      drawCard(ctx, w / 2 - 70, h / 2 - 30, 140, 60, 12, true);
      ctx.fillStyle = rc;
      ctx.font = 'bold ' + fs(w, 24) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rt, w / 2, h / 2 - 8);
      ctx.fillStyle = C.inkMuted;
      ctx.font = fs(w, 12) + 'px sans-serif';
      ctx.fillText('点击返回', w / 2, h / 2 + 18);
      return;
    }

    ctx.restore();
  }

  handleTap(x, y) {
    if (this.over) { this.sm.switchTo(STATUS.HOME, { player: this.player }); return; }
    for (var i = 0; i < this.btns.length; i++) {
      var b = this.btns[i];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        this.btap(i);
        return;
      }
    }
  }
}

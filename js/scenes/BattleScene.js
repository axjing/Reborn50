import { STATUS } from '../utils/constants.js';
import { C, drawBg, drawCard, roundRect, fs, drawBtn, drawDecoLine } from '../utils/color.js';
import { COMMON_MONSTERS } from '../data/monsters.js';
import { Monster } from '../entities/Monster.js';
import { StorageManager } from '../systems/StorageManager.js';
import { Button } from '../ui/Button.js';
import { ProgressBar } from '../ui/ProgressBar.js';
import { ParticleSystem } from '../entities/Particle.js';

var M_CHAR = { bat: '🦇', bug: '🐛', flower: '🌸', butterfly: '🦋', slime: '💧', crow: '🐦' };

export class BattleScene {
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
    this._anim = 0;
    this._res = '';
    this._shake = 0;
  }

  onEnter(data) {
    this.player = data.player;
    this.over = false;
    this.log = [];
    this._anim = 0;
    this._res = '';
    this._shake = 0;
    var cfg = COMMON_MONSTERS[Math.floor(Math.random() * COMMON_MONSTERS.length)];
    this.m = new Monster(cfg);

    var w = this.sm.canvas.width;
    this.pHP = new ProgressBar(16, 38, w - 32, 10, this.player.maxHP, C.red);
    this.mHP = new ProgressBar(16, 80, w - 32, 10, this.m.maxHP, C.inkLight);

    var bw = Math.min(86, (w - 50) / 2);
    var bh = 38;
    var by = this.sm.canvas.height - 78;
    this.btns = [
      new Button(16, by, bw, bh, '攻击', C.red),
      new Button(26 + bw, by, bw, bh, '技能', C.jade),
      new Button(16, by + bh + 8, bw, bh, '防御', C.gold),
      new Button(26 + bw, by + bh + 8, bw, bh, '逃跑', C.inkMuted),
    ];
    this.log.push(this.m.name + ' 出现了！');
  }

  btap(i) {
    if (this.over) return;
    if (i === 0) this.atk();
    else if (i === 1) this.skl();
    else if (i === 2) this.def();
    else this.run();
  }

  atk() {
    var d = Math.max(1, this.player.attack - this.m.skl + Math.floor(Math.random() * 3));
    if (Math.random() < this.player.critChance) { d = Math.floor(d * 1.5); this.log.push('暴击！' + d); }
    else this.log.push('攻击 ' + d);
    this.hit(d, true);
  }

  skl() {
    if (this.player.sp < 5) { this.log.push('灵力不足'); return; }
    this.player.sp -= 5;
    var d = Math.max(1, this.player.magicAttack * 2 - this.m.skl);
    this.log.push('技能 ' + d);
    this.hit(d, true);
  }

  def() {
    this.log.push('防御');
    var d = Math.max(1, this.m.dealDamage() - this.player.defense - 3);
    this.player.takeDamage(d);
    this.log.push('受到 ' + d);
    this._shake = 3;
    this.chkDeath();
  }

  run() {
    this.log.push('成功逃跑');
    this.over = true;
    this._res = 'flee';
  }

  hit(dmg, isP) {
    if (isP) {
      this.pts.emit(this.sm.canvas.width * 0.7, this.sm.canvas.height * 0.22, 8);
      this.m.takeDamage(dmg);
      this._anim = 3;
      this._shake = 4;
      if (!this.m.isAlive()) {
        this.log.push('击败 ' + this.m.name);
        this.over = true;
        this._res = 'win';
        this.player.exp += 5;
        StorageManager.save(this.player);
        return;
      }
    }
    var d = this.m.dealDamage();
    var a = this.player.takeDamage(d);
    this.log.push('受到 ' + a);
    this._shake = 3;
    this.chkDeath();
  }

  chkDeath() {
    if (!this.player.isAlive()) {
      this.log.push('你被击败了');
      this.over = true;
      this._res = 'lose';
      this.player.hp = Math.floor(this.player.maxHP / 2);
      StorageManager.save(this.player);
    }
  }

  update(dt) {
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

    ctx.fillStyle = C.ink;
    ctx.font = 'bold ' + fs(w, 18) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('战斗', w / 2, 12);

    ctx.fillStyle = C.inkLight;
    ctx.font = fs(w, 12) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('勇者', 16, 50);
    this.pHP.draw(ctx);

    ctx.fillStyle = C.red;
    ctx.font = 'bold ' + fs(w, 13) + 'px sans-serif';
    ctx.fillText(this.m.name, 16, 92);
    this.mHP.draw(ctx);

    var ao = Math.sin(this._anim * 10) * 6;
    var mx = Math.floor(w * 0.7);
    var my = Math.floor(h * 0.24);

    ctx.save();
    ctx.shadowColor = C.shadow;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    roundRect(ctx, mx - 28, my - 24, 56, 48, 10);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = C.red;
    ctx.lineWidth = 1.5;
    roundRect(ctx, mx - 25, my - 21, 50, 42, 8);
    ctx.stroke();
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 1;
    roundRect(ctx, mx - 22, my - 18, 44, 36, 6);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.font = fs(w, 30) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(M_CHAR[this.m.sprite] || '?', mx, my + ao);
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

    if (this.over) {
      ctx.restore();
      ctx.fillStyle = 'rgba(44,44,44,0.55)';
      ctx.fillRect(0, 0, w, h);
      var rc = this._res === 'win' ? C.jade : this._res === 'flee' ? C.inkLight : C.red;
      var rt = this._res === 'win' ? '胜利' : this._res === 'flee' ? '已撤退' : '战败';
      drawCard(ctx, w / 2 - 70, h / 2 - 30, 140, 60, 12, true);
      ctx.fillStyle = rc;
      ctx.font = 'bold ' + fs(w, 22) + 'px sans-serif';
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

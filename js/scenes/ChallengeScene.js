import { STATUS, XINFA_LIST, SCENES_CONFIG, STAT_ICONS } from '../utils/constants.js';
import {
  C, drawBg, drawCard, roundRect, fs, drawInkBtn,
  drawMist, drawStars, drawSparkle, drawTree,
} from '../utils/color.js';
import { StorageManager } from '../systems/StorageManager.js';
import { ParticleSystem } from '../entities/Particle.js';

var STAR_TEXTS = ['☆', '★'];

export class ChallengeScene {
  constructor(sm) {
    this.sm = sm;
    this.player = null;
    this._done = [];
    this._toast = '';
    this._toastT = 0;
    this._timer = 0;
    this._pts = new ParticleSystem();
    this._phase = 0;
    this._rewardTimer = 0;
    this._rewardPhase = 0;
    this._showReward = false;
    this._stars = 0;
    this._levelUp = false;
  }

  onEnter(data) {
    this.player = data.player;
    this._done = [];
    for (var i = 0; i < XINFA_LIST.length; i++) {
      this._done[i] = this.player.completedRules.includes(XINFA_LIST[i].id);
    }
    this._toast = '';
    this._toastT = 0;
    this._timer = 0;
    this._pts = new ParticleSystem();
    this._phase = 0;
    this._rewardTimer = 0;
    this._rewardPhase = 0;
    this._showReward = false;
    this._stars = 0;
    this._levelUp = false;
  }

  tapXinfa(i) {
    if (this._done[i] || this._showReward) return;
    this._done[i] = true;
    this.player.applyRule(i);
    var xf = XINFA_LIST[i];
    this._toast = xf.name + ' · 完成';
    this._toastT = 1.2;
    this._pts.emitInkSplash(this.sm.canvas.width * 0.3, 130 + i * 54);
    if (this.sm.audio) this.sm.audio.playComplete();
    StorageManager.save(this.player);

    if (this.player.isAllRulesDone()) {
      this._startReward();
    }
  }

  _startReward() {
    this._toast = '';
    this._toastT = 0;
    this._showReward = true;
    this._phase = 1;
    this._rewardTimer = 0.5;
    this._rewardPhase = 0;

    var done = 0;
    for (var i = 0; i < 7; i++) { if (this._done[i]) done++; }
    this._stars = done >= 7 ? 3 : done >= 4 ? 2 : 1;

    var oldRealm = this.player.realm;
    this._levelUp = this.player.completeDay(this._stars);
    this._newRealm = this.player.realm;
    this._realmBreak = this._newRealm > oldRealm;
    StorageManager.save(this.player);
    if (this.sm.audio) this.sm.audio.playReward();
  }

  update(dt) {
    this._timer += dt;
    if (this._toastT > 0) this._toastT -= dt;
    this._pts.update();

    if (this._showReward && this._phase === 1) {
      this._rewardTimer -= dt;
      if (Math.random() < 0.2) {
        this._pts.emitGoldSplash(
          Math.random() * this.sm.canvas.width,
          Math.random() * this.sm.canvas.height * 0.3
        );
      }
      if (this._rewardTimer <= 0) {
        this._rewardPhase++;
        this._rewardTimer = 0.8;
        var maxP = this._levelUp ? 5 : 4;
        if (this._rewardPhase >= maxP) this._phase = 2;
      }
    }
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;

    drawBg(ctx, w, h);
    drawMist(ctx, w, h, this._timer * 0.4);
    drawTree(ctx, w * 0.12, h * 0.5, 0.8, this._timer * 0.2);
    drawTree(ctx, w * 0.88, h * 0.53, 0.9, this._timer * 0.2 + 1);
    drawSparkle(ctx, w * 0.15, h * 0.1, 3, this._timer * 1.3);
    drawSparkle(ctx, w * 0.85, h * 0.08, 4, this._timer * 1.7 + 1);

    ctx.save();
    ctx.globalAlpha = 0.92;
    drawCard(ctx, 8, 6, w - 16, h - 12, 12);
    ctx.restore();

    ctx.fillStyle = C.ink;
    ctx.font = 'bold ' + fs(w, 16) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('心法修行', w / 2, 16);

    var done = 0;
    for (var i = 0; i < 7; i++) { if (this._done[i]) done++; }

    ctx.fillStyle = C.inkMuted;
    ctx.font = fs(w, 12) + 'px "SimSun", "KaiTi", serif';
    ctx.fillText('完成 ' + done + ' / 7', w / 2, 40);

    for (var j = 0; j < 7; j++) {
      var y = 62 + j * 54;
      var rh = 46;
      var isDone = this._done[j];
      var xf = XINFA_LIST[j];
      var sceneCfg = SCENES_CONFIG[xf.scene] || SCENES_CONFIG.morning;

      roundRect(ctx, 16, y, w - 32, rh, 8);
      ctx.fillStyle = isDone ? 'rgba(92,140,90,0.08)' : 'rgba(255,254,248,0.5)';
      ctx.fill();
      ctx.strokeStyle = isDone ? C.jade : sceneCfg.gradient[3];
      ctx.lineWidth = isDone ? 1 : 0.5;
      if (!isDone) { ctx.setLineDash([3, 3]); }
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = fs(w, 16) + 'px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(STAT_ICONS[j], 24, y + 4);

      ctx.fillStyle = isDone ? C.inkMuted : C.ink;
      ctx.font = 'bold ' + fs(w, 13) + 'px "SimSun", "KaiTi", serif';
      ctx.fillText(xf.name, 50, y + 4);

      ctx.fillStyle = C.inkMuted;
      ctx.font = fs(w, 9) + 'px sans-serif';
      ctx.fillText(xf.desc, 50, y + 23);

      if (isDone) {
        ctx.fillStyle = C.jade;
        ctx.font = 'bold ' + fs(w, 16) + 'px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('✔', w - 24, y + rh / 2);
      }

      ctx.fillStyle = isDone ? C.jade : C.inkMuted;
      ctx.font = fs(w, 9) + 'px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(sceneCfg.name, w - 24, y + rh - 10);
    }

    if (this._showReward) {
      ctx.save();
      ctx.fillStyle = 'rgba(44,44,44,0.5)';
      ctx.fillRect(0, 0, w, h);

      var rw = Math.min(290, w - 40);
      var rh2 = Math.min(320, h - 60);
      var rx = (w - rw) / 2;
      var ry = (h - rh2) / 2;

      drawCard(ctx, rx, ry, rw, rh2, 14);

      ctx.fillStyle = C.ink;
      ctx.font = 'bold ' + fs(w, 20) + 'px "SimSun", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('修行圆满', w / 2, ry + 16);

      ctx.fillStyle = C.inkLight;
      ctx.font = fs(w, 12) + 'px sans-serif';
      ctx.fillText('已修行 ' + this.player.completedDays + ' 天', w / 2, ry + 44);

      var starsY = ry + 66;
      for (var s = 0; s < 3; s++) {
        ctx.fillStyle = s < this._stars ? C.gold : C.inkMuted;
        ctx.font = fs(w, 28) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(STAR_TEXTS[s < this._stars ? 1 : 0], w / 2 + (s - 1) * 40, starsY);
      }

      var cellY = ry + 100;
      var cellW = (rw - 36) / 2;

      if (this._rewardPhase >= 1) {
        this._drawRewardCell(ctx, rx + 14, cellY, cellW, 34, '修为', '+' + (5 + this._stars * 3), C.red);
      }
      if (this._rewardPhase >= 2) {
        this._drawRewardCell(ctx, rx + 18 + cellW, cellY, cellW, 34, '连击', this.player.streak + '天', C.gold);
      }
      if (this._rewardPhase >= 3 && this._stars) {
        this._drawRewardCell(ctx, rx + 14, cellY + 40, rw - 28, 34, '星级评定', this._stars + '星', C.goldLight);
      }
    if (this._rewardPhase >= 4 && this._levelUp) {
      if (this._rewardPhase === 4 && this._rewardTimer > 0.7 && this.sm.audio) this.sm.audio.playLevelUp();
      this._drawRewardCell(ctx, rx + 14, cellY + 80, rw - 28, 34, '等级突破', 'Lv.' + this.player.level, C.red);
    }

      var btnY = rh2 - 48;
      if (this._phase === 2) {
        drawInkBtn(ctx, rx + 40, ry + btnY, rw - 80, 36, '返回江湖', C.red);
      }

      ctx.restore();
    }

    this._pts.draw(ctx);

    if (this._toastT > 0) {
      ctx.save();
      roundRect(ctx, w / 2 - 80, h * 0.3, 160, 26, 8);
      ctx.fillStyle = 'rgba(44,44,44,0.82)';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = fs(w, 12) + 'px "SimSun", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this._toast, w / 2, h * 0.3 + 13);
      ctx.restore();
    }
  }

  _drawRewardCell(ctx, x, y, w, h, label, val, color) {
    var c = color || C.gold;
    ctx.save();
    ctx.shadowColor = C.shadow;
    ctx.shadowBlur = 3;
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
    ctx.font = Math.min(fs(ctx.canvas.width, 11), 14) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x + w / 2, y + 3);
    ctx.fillStyle = c;
    ctx.font = 'bold ' + Math.min(fs(ctx.canvas.width, 13), 16) + 'px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(val, x + w / 2, y + h / 2 + 3);
    ctx.restore();
  }

  handleTap(x, y) {
    var w = this.sm.canvas.width;
    var h = this.sm.canvas.height;

    if (this._showReward && this._phase === 2) {
      var rw = Math.min(290, w - 40);
      var rh2 = Math.min(320, h - 60);
      var rx = (w - rw) / 2;
      var ry = (h - rh2) / 2;
      var btnY = rh2 - 48;
      var bx = rx + 40;
      var by = ry + btnY;
      if (x >= bx && x <= bx + rw - 80 && y >= by && y <= by + 36) {
        if (this._realmBreak) {
          this.sm.transitionTo(STATUS.REALM, { player: this.player, oldRealm: this.player.realm - 1 });
        } else {
          this.sm.transitionTo(STATUS.HOME, { player: this.player, levelUp: this._levelUp });
        }
      }
      return;
    }

    if (this._showReward) return;
    if (this.player.completedToday) return;
    if (this.player.isAllRulesDone()) return;

    for (var j = 0; j < 7; j++) {
      var ry3 = 62 + j * 54;
      if (x >= 16 && x <= w - 16 && y >= ry3 && y <= ry3 + 46) {
        this.tapXinfa(j);
        return;
      }
    }
  }
}

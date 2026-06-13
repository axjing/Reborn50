import { STATUS, REALMS } from '../utils/constants.js';
import {
  C, drawBg, drawCard, roundRect, fs, drawInkBtn,
  drawMist, drawSparkle, drawStars, getFont,
} from '../utils/color.js';
import { StorageManager } from '../systems/StorageManager.js';
import { ParticleSystem } from '../entities/Particle.js';

export class RealmScene {
  constructor(sm) {
    this.sm = sm;
    this.player = null;
    this._timer = 0;
    this._phase = 0;
    this._newRealm = 0;
    this._oldRealm = 0;
    this._pts = new ParticleSystem();
    this._alpha = 0;
    this._textAlpha = 0;
    this._realmUpPlayed = false;
  }

  onEnter(data) {
    this.player = data.player;
    this._oldRealm = data.oldRealm || 0;
    this._newRealm = this.player.realm;
    this._timer = 0;
    this._phase = 0;
    this._alpha = 0;
    this._textAlpha = 0;
    this._realmUpPlayed = false;
    this._pts = new ParticleSystem();
  }

  update(dt) {
    this._timer += dt;
    this._pts.update();

    if (this._phase === 0) {
      this._alpha = Math.min(1, this._alpha + dt * 1.5);
      if (this._alpha >= 1) {
        this._phase = 1;
        this._timer = 0;
      }
      for (var i = 0; i < 3; i++) {
        this._pts.emit(
          Math.random() * this.sm.canvas.width,
          Math.random() * this.sm.canvas.height * 0.5,
          5
        );
      }
    }

    if (this._phase === 1) {
      if (!this._realmUpPlayed && this.sm.audio) {
        this.sm.audio.playRealmUp();
        this._realmUpPlayed = true;
      }
      this._textAlpha = Math.min(1, this._textAlpha + dt * 0.8);
      if (this._timer > 2.5) {
        this._phase = 2;
      }
    }

    if (this._phase === 2 && this._timer > 3.5) {
      this.sm.transitionTo(STATUS.HOME, { player: this.player });
    }
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    drawBg(ctx, w, h);
    drawStars(ctx, w, h, this._timer * 0.3, 20);
    drawMist(ctx, w, h, this._timer * 0.2);

    ctx.save();
    ctx.globalAlpha = this._alpha;

    ctx.fillStyle = 'rgba(0,0,0,' + (0.3 * this._alpha) + ')';
    ctx.fillRect(0, 0, w, h);

    var realm = REALMS[this._newRealm];
    var oldRealm = REALMS[this._oldRealm];

    drawSparkle(ctx, w * 0.5, h * 0.15, 8, this._timer * 2);
    drawSparkle(ctx, w * 0.3, h * 0.25, 5, this._timer * 2.5 + 1);
    drawSparkle(ctx, w * 0.7, h * 0.22, 6, this._timer * 1.8 + 2);

    if (this._phase >= 1) {
      ctx.globalAlpha = this._textAlpha;

      ctx.fillStyle = C.inkMuted;
      ctx.font = getFont(w, 16, 'song');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('境界突破', w / 2, h * 0.32);

      ctx.fillStyle = C.inkLight;
      ctx.font = getFont(w, 14, 'song');
      ctx.fillText(oldRealm.name + ' →', w / 2, h * 0.40);

      ctx.fillStyle = realm.color;
      ctx.font = getFont(w, 30, 'song');
      ctx.fillText(realm.name, w / 2, h * 0.50);

      ctx.fillStyle = C.inkLight;
      ctx.font = getFont(w, 16, 'song');
      ctx.fillText('「' + realm.title + '」', w / 2, h * 0.60);

      ctx.fillStyle = C.inkMuted;
      ctx.font = getFont(w, 13, 'sans');
      ctx.fillText(realm.desc, w / 2, h * 0.70);

      if (this._phase >= 2) {
        ctx.fillStyle = C.inkMuted;
        ctx.font = getFont(w, 11, 'sans');
        ctx.fillText('点击继续修行', w / 2, h * 0.82);
      }
    }

    ctx.restore();
    this._pts.draw(ctx);
  }

  handleTap(x, y) {
    if (this._phase >= 2) {
      if (this.sm.audio) this.sm.audio.playTap();
      this.sm.transitionTo(STATUS.HOME, { player: this.player });
    }
  }
}

import { C } from '../utils/color.js';

var COLORS = [
  { body: '#4A4A4A', ear: '#3D3D3D', earInner: '#5A5A5A', glow: 'rgba(0,0,0,0)' },
  { body: '#5B8C5A', ear: '#4A7B49', earInner: '#7BA87B', glow: 'rgba(0,0,0,0)' },
  { body: '#7BA87B', ear: '#6A976A', earInner: '#9BC09B', glow: 'rgba(0,0,0,0)' },
  { body: '#D4A04A', ear: '#C0903A', earInner: '#E8C87A', glow: 'rgba(212,160,74,0.25)' },
  { body: '#E8C87A', ear: '#D8B86A', earInner: '#F0D8A0', glow: 'rgba(232,200,122,0.35)' },
  { body: '#FFF8E0', ear: '#F0E8D0', earInner: '#FFFEF0', glow: 'rgba(255,248,224,0.5)' },
];

var SPECIAL_SKINS = [
  null,
  {
    body: '#E8D0A0', ear: '#D8C090', earInner: '#F0E0C0',
    glow: 'rgba(232,200,160,0.35)',
    accent: '#FFE8B0',
    desc: '灵狐',
  },
  {
    body: '#FFE8C0', ear: '#F0D8A0', earInner: '#FFF0D0',
    glow: 'rgba(255,232,192,0.5)',
    accent: '#FFD700',
    desc: '仙狐',
  },
];

var TAIL_COUNTS = [0, 1, 1, 2, 3, 5];
var MAX_GROWTH = 100;

export class Pet {
  constructor(data) {
    data = data || {};
    this.state = 'idle';
    this.timer = 0;
    this.blinkTimer = 0;
    this.earTwitchTimer = 0;
    this.evolveProgress = 0;
    this._evolved = true;
    this._dragVelX = 0;
    this._dragVelY = 0;
    this._squishX = 0;
    this._squishY = 0;
    this._squishDecay = 0.85;
    this._idleAction = 'none';
    this._idleActionTimer = 0;
    this._idleBreatheDir = 1;
    this._microMoveX = 0;
    this._microMoveY = 0;
    this._growth = data.growth || 0;
    this._skinTier = data.skinTier || 0;
    this._growthPop = 0;
    if (this._skinTier > 0) this._evolved = true;
  }

  addGrowth(amount) {
    var oldTier = this._skinTier;
    var oldGrowth = this._growth;
    this._growth = Math.min(MAX_GROWTH, this._growth + amount);
    this._growthPop = 0.15;
    var newTier = this._getSkinTier();
    if (newTier > this._skinTier) {
      this._skinTier = newTier;
      this._evolved = false;
      this.evolveProgress = 0.01;
      this._growthPop = 0.3;
      return true;
    }
    return false;
  }

  get sizeMul() {
    // Base size: 1.0 at growth 0, 1.9 at MAX_GROWTH
    var t = this._growth / MAX_GROWTH;
    var base = 1.0 + t * 0.9;
    // Add growth pop (quick pulse that decays)
    var pop = this._growthPop > 0 ? 1 + this._growthPop * 0.15 : 1;
    return base * pop;
  }

  get growth() {
    return this._growth;
  }

  get maxGrowth() {
    return MAX_GROWTH;
  }

  get skinInfo() {
    return SPECIAL_SKINS[this._skinTier] || null;
  }

  loadFromPlayer(p) {
    this._growth = p.petGrowth || 0;
    this._skinTier = p.petSkinTier || 0;
    if (this._skinTier > 0) this._evolved = true;
  }

  saveToPlayer(p) {
    p.petGrowth = this._growth;
    p.petSkinTier = this._skinTier;
  }

  _getSkinTier() {
    if (this._growth >= MAX_GROWTH) return 2;
    if (this._growth >= Math.floor(MAX_GROWTH * 0.4)) return 1;
    return 0;
  }

  update(dt) {
    this.timer += dt;
    this.blinkTimer += dt;
    this.earTwitchTimer += dt;

    if (this.evolveProgress > 0 && this.evolveProgress < 1) {
      this.evolveProgress = Math.min(1, this.evolveProgress + dt * 2);
      if (this.evolveProgress >= 1) this._evolved = true;
    }

    this._squishX *= this._squishDecay;
    this._squishY *= this._squishDecay;
    if (Math.abs(this._squishX) < 0.01) this._squishX = 0;
    if (Math.abs(this._squishY) < 0.01) this._squishY = 0;
    if (this._growthPop > 0) this._growthPop -= dt * 2;

    var idleFloatScale = this.state === 'sleep' ? 0.3 : 1;
    this._microMoveX = Math.sin(this.timer * 0.3) * 2.0 * idleFloatScale;
    this._microMoveY = Math.sin(this.timer * 0.5 + 0.5) * 1.5 * idleFloatScale;

    this._idleActionTimer -= dt;
    if (this._idleActionTimer <= 0) {
      var actions = ['none', 'none', 'none', 'none', 'earTwitch', 'earTwitch', 'lookAround', 'sniff'];
      this._idleAction = actions[Math.floor(Math.random() * actions.length)];
      this._idleActionTimer = 0.5 + Math.random() * 2;
    }
  }

  setState(s) {
    if (s === 'evolving') {
      this.evolveProgress = 0.01;
      this._evolved = false;
    }
    if (s === 'drag') {
      this._squishX = 0;
      this._squishY = 0;
    }
    this.state = s;
  }

  applyDragForce(dx, dy) {
    this._squishX += dx * 0.03;
    this._squishY += dy * 0.03;
    this._squishX = Math.max(-0.3, Math.min(0.3, this._squishX));
    this._squishY = Math.max(-0.3, Math.min(0.3, this._squishY));
  }

  getStage(days) {
    if (days >= 50) return 5;
    if (days >= 35) return 4;
    if (days >= 25) return 3;
    if (days >= 15) return 2;
    if (days >= 5) return 1;
    return 0;
  }

  draw(ctx, x, y, size, days) {
    var stage = this.getStage(days);
    var baseColors = COLORS[stage];
    var special = SPECIAL_SKINS[this._skinTier];
    var c = special || baseColors;

    var breath = Math.sin(this.timer * 3) * 0.05;
    var blink = (this.blinkTimer % 4) > 3.85 ? 0.15 : 1;
    var bounce = 0;
    var earAngle = 0;
    var earTwitch = Math.sin(this.earTwitchTimer * 6) * 0.02;

    if (this.state === 'happy') {
      bounce = Math.sin(this.timer * 10) * 1.5;
      earAngle = -0.15;
      earTwitch *= 1.5;
    }
    if (this.state === 'excited') {
      bounce = -Math.abs(Math.sin(this.timer * 12)) * 2.5;
      earAngle = -0.2;
      earTwitch *= 2;
    }
    if (this.state === 'sad') {
      bounce = Math.sin(this.timer * 2) * 0.5;
      earAngle = 0.2;
    }

    var s = size * (1 + breath + this._microMoveY * 0.005);
    var evolveScale = 1;
    if (this.evolveProgress > 0 && this.evolveProgress < 1) {
      evolveScale = this.evolveProgress < 0.5
        ? 1 + this.evolveProgress * 0.6
        : 1.3 - (this.evolveProgress - 0.5) * 0.6;
    }
    s *= evolveScale;

    var sqX = 1 + this._squishX;
    var sqY = 1 - this._squishX * 0.5 + this._squishY;
    s *= Math.max(0.7, Math.min(1.3, (sqX + sqY) / 2));

    var r = s * 0.44;

    ctx.save();
    ctx.translate(x + this._microMoveX, y + bounce + this._microMoveY);
    ctx.scale(sqX, sqY);

    // Special skin sparkle aura
    if (special && this._evolved) {
      ctx.save();
      var auraAlpha = 0.06 + Math.sin(this.timer * 1.5) * 0.03;
      ctx.fillStyle = special.accent || c.glow;
      ctx.globalAlpha = auraAlpha;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Fur edge
    ctx.save();
    var furSegments = 12;
    var furDepth = r * 0.04;
    ctx.strokeStyle = c.ear;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (var fi = 0; fi <= furSegments; fi++) {
      var fa = (fi / furSegments) * Math.PI * 2;
      var fr = r + Math.sin(fa * 5 + this.timer * 2) * furDepth;
      if (special && this._skinTier >= 2) {
        fr += Math.sin(fa * 3 + this.timer * 3) * furDepth * 0.5;
      }
      var fx = Math.cos(fa) * fr;
      var fy = Math.sin(fa) * fr;
      if (fi === 0) ctx.moveTo(fx, fy);
      else ctx.lineTo(fx, fy);
    }
    ctx.closePath();
    ctx.fillStyle = c.body;
    ctx.fill();

    // 3D body shading
    var g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    g.addColorStop(0, 'rgba(255,255,255,0.2)');
    g.addColorStop(0.4, 'rgba(255,255,255,0)');
    g.addColorStop(0.7, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.08)');
    ctx.fillStyle = g;
    ctx.fill();

    ctx.stroke();
    ctx.restore();

    // Tail(s)
    ctx.strokeStyle = c.ear;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (var t = 0; t < TAIL_COUNTS[stage]; t++) {
      var wagSpeed = (this.state === 'excited' || this.state === 'happy') ? 1.8 : 1;
      var tt = this.timer * (3 + (special ? 1 : 0)) * wagSpeed;
      var tw = Math.sin(tt + t * 1.5) * r * 0.15;
      var tw2 = Math.sin(tt * 1.2 + t * 2 + 0.5) * r * 0.08;
      ctx.lineWidth = r * 0.22 - t * r * 0.02;
      ctx.globalAlpha = 0.7 + t * 0.05;
      ctx.beginPath();
      ctx.moveTo(r * 0.35, -r * 0.15 + t * r * 0.06);
      ctx.quadraticCurveTo(
        r * 0.8 + tw,
        -r * 0.65 - t * r * 0.08,
        r * 0.7 + tw * 0.5,
        -r * 0.85 - t * r * 0.1
      );
      ctx.quadraticCurveTo(
        r * 0.6 + tw * 0.3 + tw2,
        -r * 1.0 - t * r * 0.12,
        r * 0.5 + tw2,
        -r * 1.05 - t * r * 0.14
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Body glow (stage + special skin)
    if ((stage >= 3 && this._evolved) || special) {
      ctx.save();
      var glowColor = special ? (special.accent || c.glow) : c.glow;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = (10 + Math.sin(this.timer * 2) * 4) * (special ? 1.5 : 1);
      ctx.fillStyle = 'transparent';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Special skin floating particles
    if (special && this._skinTier >= 2 && this._evolved) {
      ctx.save();
      for (var pi = 0; pi < 3; pi++) {
        var pa = this.timer * 0.8 + pi * 2.1;
        var pd = r * 0.6 + Math.sin(this.timer * 0.5 + pi) * r * 0.2;
        var px2 = Math.cos(pa) * pd;
        var py2 = Math.sin(pa) * pd * 0.4 - r * 0.2;
        ctx.fillStyle = special.accent || C.goldLight;
        ctx.globalAlpha = 0.2 + Math.sin(this.timer * 2 + pi) * 0.1;
        ctx.beginPath();
        ctx.arc(px2, py2, r * 0.04, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Ears
    if (stage >= 1) {
      var earSpread = r * 0.48;
      var earHeight = r * 0.95;
      var earW = r * 0.26;

      var idleEarShift = 0;
      if (this._idleAction === 'earTwitch') {
        idleEarShift = Math.sin(this.earTwitchTimer * 20) * 0.08;
      }

      var baseAngle = earAngle + earTwitch + idleEarShift;

      // Special skin: ears slightly bigger
      var earMul = special ? 1.12 : 1;

      ctx.fillStyle = c.ear;
      ctx.strokeStyle = c.earInner;
      ctx.lineWidth = 0.5;

      ctx.save();
      ctx.translate(-earSpread * earMul, -r * 0.55);
      ctx.rotate(-0.2 + baseAngle);
      ctx.beginPath();
      ctx.moveTo(-earW * earMul, 0);
      ctx.quadraticCurveTo(-earW * 0.3 * earMul, -earHeight * earMul, 0, -earHeight * 0.8 * earMul);
      ctx.quadraticCurveTo(earW * 0.3 * earMul, -earHeight * earMul, earW * earMul, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.earInner;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.ellipse(-earW * 0.1 * earMul, -earHeight * 0.5 * earMul, earW * 0.4 * earMul, earHeight * 0.25 * earMul, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = c.ear;
      ctx.globalAlpha = 1;
      ctx.lineWidth = 0.5;
      ctx.save();
      ctx.translate(earSpread * earMul, -r * 0.55);
      ctx.rotate(0.2 - baseAngle);
      ctx.beginPath();
      ctx.moveTo(-earW * earMul, 0);
      ctx.quadraticCurveTo(-earW * 0.3 * earMul, -earHeight * earMul, 0, -earHeight * 0.8 * earMul);
      ctx.quadraticCurveTo(earW * 0.3 * earMul, -earHeight * earMul, earW * earMul, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c.earInner;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.ellipse(earW * 0.1 * earMul, -earHeight * 0.5 * earMul, earW * 0.4 * earMul, earHeight * 0.25 * earMul, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // Eyes
    var eyeY = -r * 0.06;
    var eyeR = r * 0.21;
    ctx.fillStyle = '#2C2C2C';

    var eyeShiftX = 0;
    var eyeShiftY = 0;
    if (this._idleAction === 'lookAround') {
      eyeShiftX = Math.sin(this.timer * 2) * r * 0.04;
      eyeShiftY = Math.cos(this.timer * 1.5) * r * 0.03;
    }
    if (this._idleAction === 'sniff') {
      eyeShiftX = Math.sin(this.timer * 5) * r * 0.02;
    }

    // Special skin: sparkly eyes
    if (special && this._evolved) {
      eyeR *= 1.1;
    }

    var isHappy = this.state === 'happy' || this.state === 'excited';
    if (blink < 0.5) {
      var blY = eyeY + eyeShiftY;
      ctx.fillRect(-r * 0.38 - eyeR + eyeShiftX, blY, eyeR * 2, Math.max(1, blink * eyeR * 2));
      ctx.fillRect(r * 0.38 - eyeR + eyeShiftX, blY, eyeR * 2, Math.max(1, blink * eyeR * 2));
    } else {
      var eyeBright = isHappy ? 1.15 : 1;
      var curEyeR = eyeR * eyeBright;
      ctx.beginPath();
      ctx.arc(-r * 0.33 + eyeShiftX, eyeY + eyeShiftY, curEyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(r * 0.33 + eyeShiftX, eyeY + eyeShiftY, curEyeR, 0, Math.PI * 2);
      ctx.fill();

      // Main highlight
      var hl1R = isHappy ? r * 0.08 : r * 0.07;
      var hl1Off = isHappy ? 0.32 : 0.35;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-r * 0.33 + eyeShiftX + curEyeR * hl1Off, eyeY + eyeShiftY - curEyeR * 0.3, hl1R, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(r * 0.33 + eyeShiftX + curEyeR * hl1Off, eyeY + eyeShiftY - curEyeR * 0.3, hl1R, 0, Math.PI * 2);
      ctx.fill();

      // Secondary highlight (smaller, upper-left)
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(-r * 0.33 + eyeShiftX - curEyeR * 0.2, eyeY + eyeShiftY - curEyeR * 0.35, r * 0.035, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(r * 0.33 + eyeShiftX - curEyeR * 0.2, eyeY + eyeShiftY - curEyeR * 0.35, r * 0.035, 0, Math.PI * 2);
      ctx.fill();

      // Happy/excited extra sparkle
      if (isHappy) {
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.3 + Math.sin(this.timer * 6) * 0.15;
        ctx.beginPath();
        ctx.arc(-r * 0.33 + eyeShiftX + curEyeR * 0.5, eyeY + eyeShiftY - curEyeR * 0.1, r * 0.025, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.33 + eyeShiftX + curEyeR * 0.5, eyeY + eyeShiftY - curEyeR * 0.1, r * 0.025, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Special skin: extra sparkle in eyes
      if (special && this._evolved) {
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.6 + Math.sin(this.timer * 3) * 0.3;
        ctx.beginPath();
        ctx.arc(-r * 0.33 + eyeShiftX - eyeR * 0.2, eyeY + eyeShiftY - eyeR * 0.35, r * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(r * 0.33 + eyeShiftX - eyeR * 0.2, eyeY + eyeShiftY - eyeR * 0.35, r * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Cheeks (special skin: rosier)
    ctx.fillStyle = special ? 'rgba(255,180,180,0.35)' : 'rgba(255,150,150,0.25)';
    ctx.save();
    ctx.translate(-r * 0.52, r * 0.06);
    ctx.scale(1.4, 1);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(r * 0.52, r * 0.06);
    ctx.scale(1.4, 1);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Nose
    ctx.fillStyle = special ? c.ear : '#D48B8B';
    ctx.beginPath();
    ctx.arc(0, r * 0.12, r * 0.035, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = special ? c.ear : C.inkLight;
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    var mouthY = r * 0.18;
    var mouthX = r * 0.08;
    var mouthCurve = 0;
    if (this.state === 'happy' || this.state === 'excited') mouthCurve = -r * 0.04;
    else if (this.state === 'sad') mouthCurve = r * 0.04;
    else mouthCurve = -r * 0.01;
    if (special) mouthCurve -= r * 0.01;
    ctx.beginPath();
    ctx.moveTo(-mouthX, mouthY);
    ctx.quadraticCurveTo(0, mouthY + mouthCurve, mouthX, mouthY);
    ctx.stroke();

    ctx.restore();
  }
}

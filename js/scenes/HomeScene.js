import { STATUS, TOTAL_DAYS, REALMS, XINFA_LIST, SCENES_CONFIG, STAT_LABELS, CALENDAR_RANGES, ATTEMPT_COLORS, CALENDAR_STATE } from '../utils/constants.js';
import {
  C, roundRect, fs,
  drawMountain, drawMist, drawSparkle, drawStars, drawTree,
  drawFallingLeaves, drawPaperTexture, drawInkWash,
  drawGuofengIcon, drawSeal, drawCalligraphy, drawGuofengToast,
  drawSongCard, drawSongBtn, getFont,
} from '../utils/color.js';
import { Player } from '../entities/Player.js';
import { StorageManager } from '../systems/StorageManager.js';
import { ParticleSystem } from '../entities/Particle.js';
import { Pet } from '../entities/Pet.js';

var REALM_COLORS = ['#8B8B8B', '#7BA87B', '#6B9FB5', '#B58B6B', '#9B7BB5', '#D4A04A'];
var STAR_TEXTS = ['☆', '★'];
var WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
var TODO_ICONS = ['☀', '❄', '⚔', '📖', '⚙', '🥗', '✦'];
var ENCOURAGE_MSGS = ['太棒了！', '继续加油！', '好厉害！', '加油！', '真不错！', '有进步！', '棒极了！', '厉害了！', '做得好！'];

function _todayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

export class HomeScene {
  constructor(sm) {
    this.sm = sm;
    this.player = null;
    this._timer = 0;
    this._buttons = [];
    this._toast = '';
    this._toastT = 0;
    this._showStats = false;
    this._mistOffset = 0;
    this._pts = new ParticleSystem();
    this._todoDone = [];
    this._dayComplete = false;
    this._pet = new Pet({});
    this._floatTexts = [];
    this._petX = 0;
    this._petY = 0;
    this._isDraggingPet = false;
    this._dragStartX = 0;
    this._dragStartY = 0;
    this._petDragOffX = 0;
    this._petDragOffY = 0;
    this._timeOfDay = 0;
    this._sceneTimer = 0;
    this._birdPositions = [];
    this._pressedBtn = null;
    this._calendarScrollY = 0;
    this._calendarTouchStartY = -1;
    this._calendarGridMetrics = null;
  }

  onEnter(data) {
    var w = this.sm.canvas.width;

    if (data && data.newGame) {
      this.player = new Player({});
      this.player.startDate = Date.now();
      this._toast = '踏入江湖，开启五十日渡劫修行';
      this._toastT = 3;
    } else {
      this.player = StorageManager.load();
      if (!this.player) {
        this.player = new Player({});
        this.player.startDate = Date.now();
      }
      if (!this.player.startDate) {
        if (this.player.history && this.player.history.length > 0) {
          this.player.startDate = this.player.history[0].timestamp;
        } else {
          this.player.startDate = Date.now();
        }
      }
      var dayResult = StorageManager.checkNewDay(this.player);
      if (dayResult.status === 'interrupted') {
        this._toast = '修行中断！第 ' + dayResult.interruptedDay + ' 天未完成，重新开始。';
        this._toastT = 3;
      } else if (dayResult.status === 'new') {
        this._toast = '新的一天，继续你的修行之路';
        this._toastT = 2;
      }
      if (data && data.levelUp) {
        this._toast = '境界突破 · Lv.' + this.player.level;
        this._toastT = 3;
      }
    }

    this._timer = 0;
    this._showStats = false;
    this._mistOffset = 0;
    this._pts = new ParticleSystem();
    this._dayComplete = false;

    this._initTodo();
    var h = this.sm.canvas.height;
    this._pet.loadFromPlayer(this.player);
    this._petX = w / 2;
    this._petY = Math.min(h * 0.48, h - 160);
    this._isDraggingPet = false;
    this._pressedBtn = null;
    this._buildButtons(w);
    this._timeOfDay = 0;
    this._sceneTimer = 0;
    this._birdPositions = [];
    for (var bi = 0; bi < 3; bi++) {
      this._birdPositions.push({ x: Math.random() * w, y: 10 + Math.random() * h * 0.15, speed: 20 + Math.random() * 30, phase: Math.random() * Math.PI * 2 });
    }
  }

  _initTodo() {
    this._todoDone = [];
    for (var i = 0; i < XINFA_LIST.length; i++) {
      this._todoDone[i] = this.player.completedRules.includes(XINFA_LIST[i].id);
    }
  }

  _buildButtons(w) {
    var h = this.sm.canvas.height;
    var btnW = 54;
    var btnH = 38;
    var gap = 12;
    var actions = [
      { label: '卷', action: 'story', hint: '江湖纪事', color: C.songCeladon },
      { label: '遇', action: 'adventure', hint: '江湖奇遇', color: C.songTea },
      { label: '牌', action: 'minigame', hint: '灵牌翻翻', color: C.songMutedRed },
      { label: '账', action: 'history', hint: '修行手账', color: C.songInkLight },
      { label: '属', action: 'stats', hint: '人物属性', color: C.songGold },
    ];
    var totalW = actions.length * btnW + (actions.length - 1) * gap;
    var startX = (w - totalW) / 2;
    var y = h - 60;
    this._buttons = [];
    for (var i = 0; i < actions.length; i++) {
      this._buttons.push({
        x: startX + i * (btnW + gap),
        y: y,
        w: btnW,
        h: btnH,
        label: actions[i].label,
        action: actions[i].action,
        hint: actions[i].hint,
        color: actions[i].color,
      });
    }
  }

  update(dt) {
    this._timer += dt;
    this._sceneTimer += dt;
    if (this._toastT > 0) this._toastT -= dt;
    this._mistOffset += dt * 0.3;
    this._pts.update();
    this._pet.update(dt);
    for (var i = this._floatTexts.length - 1; i >= 0; i--) {
      var ft = this._floatTexts[i];
      ft.y += ft.vy * dt;
      ft.vy *= 0.98;
      ft.life -= dt;
      if (ft.life <= 0) this._floatTexts.splice(i, 1);
    }

    var w = this.sm.canvas.width;
    this._timeOfDay = (this._sceneTimer * 0.02) % (Math.PI * 2);
    for (var bi = 0; bi < this._birdPositions.length; bi++) {
      var b = this._birdPositions[bi];
      b.x += b.speed * dt;
      b.y += Math.sin(this._sceneTimer * 0.5 + b.phase) * 0.3;
      if (b.x > w + 40) { b.x = -40; b.y = 10 + Math.random() * this.sm.canvas.height * 0.15; }
    }
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    var p = this.player;

    this._drawScene(ctx, w, h);

    // Main content card (lighter, no accent)
    var cardX = 12, cardY = 10, cardW = w - 24, cardH = h - 20;
    ctx.save();
    ctx.globalAlpha = 0.92;
    drawSongCard(ctx, cardX, cardY, cardW, cardH, 10, { bgColor: C.songCard, shadow: true });
    ctx.restore();

    this._drawHeader(ctx, w, p);

    // Todo as centerpiece
    this._drawTodo(ctx, w, p);

    // Calendar grid (always visible)
    this._drawCalendarGrid(ctx, w, p);

    // Pet (initial position between todo and calendar)
    var petBaseSize = 32;
    var petSize = petBaseSize * this._pet.sizeMul;
    var halfSize = petSize / 2;
    var safeRight = cardX + cardW - 10;
    var petCenterX = Math.min(this._petX, safeRight - halfSize);
    var petCenterY = this._petY;
    if (petSize > 35) petCenterY = this._petY + (petSize - 35) * 0.5;

    ctx.save();
    var ringR = halfSize + 12;
    var ringPct = this._pet.growth / this._pet.maxGrowth;
    ctx.strokeStyle = 'rgba(60,45,30,0.06)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(petCenterX, petCenterY, ringR, 0, Math.PI * 2);
    ctx.stroke();
    if (ringPct > 0) {
      ctx.strokeStyle = ringPct >= 1 ? C.songGold : C.jadeLight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(petCenterX, petCenterY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringPct);
      ctx.stroke();
    }
    ctx.restore();
    try {
      this._pet.draw(ctx, petCenterX, petCenterY, petSize, p.completedDays);
    } catch (petErr) {
      console.error('Pet draw error:', petErr);
    }

    var skinInfo = this._pet.skinInfo;
    if (skinInfo) {
      ctx.save();
      ctx.fillStyle = C.songCard;
      ctx.globalAlpha = 0.7 + Math.sin(this._timer * 2) * 0.12;
      ctx.font = 'bold ' + getFont(w, 7, 'sans');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('[' + skinInfo.desc + ']', petCenterX, petCenterY + halfSize + 6);
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = C.songInkLight;
    ctx.globalAlpha = 0.4;
    ctx.font = fs(w, 6) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(Math.round(this._pet.growth / this._pet.maxGrowth * 100) + '%', petCenterX, petCenterY + halfSize + (skinInfo ? 14 : 6));
    ctx.restore();

    // Bottom nav buttons
    this._drawNav(ctx);

    // Float texts (stat popups)
    for (var i = 0; i < this._floatTexts.length; i++) {
      var ft = this._floatTexts[i];
      ctx.save();
      ctx.globalAlpha = Math.min(1, ft.life / 0.5);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold ' + fs(w, 12) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(255,255,255,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.label, ft.x, ft.y);
      ctx.restore();
    }

    this._pts.draw(ctx);

    if (this._showStats) {
      this._drawStats(ctx, w, h, p);
    }

    if (this._toastT > 0) {
      drawGuofengToast(ctx, w, h, this._toast, Math.min(1, this._toastT));
    }
  }

  _drawScene(ctx, w, h) {
    var tod = this._timeOfDay;
    var dayPhase = (Math.sin(tod) + 1) / 2;
    var isNight = tod > Math.PI * 0.75 && tod < Math.PI * 1.75;

    // Sky gradient (time-of-day aware)
    ctx.save();
    var skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    if (isNight) {
      skyGrad.addColorStop(0, '#0A0E2A');
      skyGrad.addColorStop(0.3, '#141E3A');
      skyGrad.addColorStop(0.7, '#1A2A4A');
      skyGrad.addColorStop(1, '#2A3A5A');
    } else if (tod < Math.PI * 0.5) {
      skyGrad.addColorStop(0, '#F5C8A0');
      skyGrad.addColorStop(0.3, '#E8C8A8');
      skyGrad.addColorStop(0.7, '#D8C8B8');
      skyGrad.addColorStop(1, '#C8C0B8');
    } else if (tod < Math.PI) {
      skyGrad.addColorStop(0, '#D49A6A');
      skyGrad.addColorStop(0.3, '#C8A880');
      skyGrad.addColorStop(0.7, '#B8B0A0');
      skyGrad.addColorStop(1, '#A8A8A0');
    } else {
      skyGrad.addColorStop(0, '#6B8BA8');
      skyGrad.addColorStop(0.3, '#7B9BB8');
      skyGrad.addColorStop(0.7, '#8BA8C0');
      skyGrad.addColorStop(1, '#9BB8C8');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Ground gradient
    ctx.save();
    var groundGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
    if (isNight) {
      groundGrad.addColorStop(0, '#1A2A3A');
      groundGrad.addColorStop(1, '#0E1A2A');
    } else if (dayPhase > 0.6) {
      groundGrad.addColorStop(0, '#C8B898');
      groundGrad.addColorStop(1, '#B0A088');
    } else {
      groundGrad.addColorStop(0, '#D8C8A8');
      groundGrad.addColorStop(1, '#C0B090');
    }
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, h * 0.7, w, h * 0.3);
    ctx.restore();

    // Stars (night only)
    if (isNight) {
      drawStars(ctx, w, h * 0.6, this._sceneTimer, 20);
    }

    // Moon
    if (isNight) {
      ctx.save();
      var mx = w * 0.78 + Math.sin(this._sceneTimer * 0.05) * 5;
      var my = 45 + Math.sin(this._sceneTimer * 0.08) * 3;
      ctx.fillStyle = 'rgba(220,210,190,0.5)';
      ctx.beginPath();
      ctx.arc(mx, my, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(220,210,190,0.25)';
      ctx.beginPath();
      ctx.arc(mx + 3, my - 2, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isNight ? '#0A0E2A' : C.paper;
      ctx.beginPath();
      ctx.arc(mx + 7, my - 4, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Distant mountains (layer 1 - background)
    ctx.save();
    ctx.globalAlpha = 0.12;
    for (var mi = 0; mi < 4; mi++) {
      var ddx = (mi * w * 0.25 + Math.sin(this._sceneTimer * 0.02 + mi * 1.2) * 15) % (w + 100) - 50;
      var ddh = 40 + (mi % 2) * 30 + Math.sin(this._sceneTimer * 0.03 + mi * 2) * 8;
      var ddw = 100 + (mi % 3) * 40;
      ctx.fillStyle = isNight ? 'rgba(80,90,120,0.1)' : 'rgba(130,120,110,0.1)';
      ctx.beginPath();
      ctx.moveTo(ddx - ddw, h * 0.55);
      ctx.quadraticCurveTo(ddx, h * 0.55 - ddh, ddx + ddw, h * 0.55);
      ctx.fill();
    }
    ctx.restore();

    // Mid mountains (layer 2)
    drawMountain(ctx, w, h * 0.58, this._sceneTimer * 0.25);

    // Mist layer
    drawMist(ctx, w, h * 0.55, this._mistOffset);

    // Trees
    drawTree(ctx, w * 0.08, h * 0.56, 0.8, this._sceneTimer * 0.15);
    drawTree(ctx, w * 0.92, h * 0.59, 1, this._sceneTimer * 0.15 + 1);
    drawTree(ctx, w * 0.18, h * 0.62, 0.6, this._sceneTimer * 0.15 + 2);
    drawTree(ctx, w * 0.82, h * 0.64, 0.7, this._sceneTimer * 0.15 + 3);

    // Light spots / sparkles
    var sparkleCount = this.player && this.player.realm >= 3 ? 4 : 2;
    drawSparkle(ctx, w * 0.15, h * 0.12, 3, this._sceneTimer * 1.1);
    drawSparkle(ctx, w * 0.85, h * 0.10, 3.5, this._sceneTimer * 1.4 + 1);
    drawSparkle(ctx, w * 0.4, h * 0.08, 2.5, this._sceneTimer * 0.9 + 0.5);
    if (sparkleCount >= 3) drawSparkle(ctx, w * 0.6, h * 0.14, 4, this._sceneTimer * 1.2 + 2);
    if (sparkleCount >= 4) drawSparkle(ctx, w * 0.3, h * 0.18, 3, this._sceneTimer * 0.8 + 3);

    // Birds
    ctx.save();
    ctx.strokeStyle = isNight ? 'rgba(180,190,200,0.15)' : 'rgba(80,70,60,0.15)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    for (var bi = 0; bi < this._birdPositions.length; bi++) {
      var b = this._birdPositions[bi];
      var bw = 6 + (bi % 2) * 3;
      ctx.beginPath();
      ctx.moveTo(b.x - bw, b.y + 2);
      ctx.quadraticCurveTo(b.x - bw * 0.3, b.y - 3, b.x, b.y);
      ctx.quadraticCurveTo(b.x + bw * 0.3, b.y - 3, b.x + bw, b.y + 2);
      ctx.stroke();
    }
    ctx.restore();

    // Falling leaves
    drawFallingLeaves(ctx, w, h, this._sceneTimer, 4);

    // Decorative calligraphy in sky (subtle, floating)
    if (!isNight) {
      ctx.save();
      ctx.globalAlpha = 0.06 + Math.sin(this._sceneTimer * 0.15) * 0.02;
      drawCalligraphy(ctx, '修行渡劫', 24, h * 0.18, w, { size: 10, color: C.ink, bold: true, brushEffect: true });
      ctx.globalAlpha = 0.04 + Math.sin(this._sceneTimer * 0.12 + 1) * 0.015;
      drawCalligraphy(ctx, '五十日归', w - 80, h * 0.14, w, { size: 8, color: C.ink, bold: true, brushEffect: true });
      ctx.restore();
    }

    // Ink wash atmosphere
    if (this.player && this.player.realm >= 2) {
      drawInkWash(ctx, w * 0.1, h * 0.4, w * 0.3, h * 0.2, C.moLv, 0.04);
      drawInkWash(ctx, w * 0.6, h * 0.55, w * 0.35, h * 0.15, C.shiQing, 0.03);
    }
    if (this.player && this.player.realm >= 4) {
      drawInkWash(ctx, w * 0.35, h * 0.3, w * 0.25, h * 0.18, C.zhuSha, 0.02);
    }

    // Decorative Guofeng icons in background
    var iconAlpha = isNight ? 0.08 : 0.12;
    ctx.save();
    ctx.globalAlpha = iconAlpha;
    drawGuofengIcon(ctx, w * 0.5, h * 0.22, 50, isNight ? 'moon' : 'sun', this._sceneTimer);
    ctx.globalAlpha = iconAlpha * 0.6;
    drawGuofengIcon(ctx, w * 0.22, h * 0.32, 35, 'mountain', this._sceneTimer + 1);
    drawGuofengIcon(ctx, w * 0.78, h * 0.28, 30, 'cloud', this._sceneTimer + 2);
    ctx.restore();
  }

  _drawDivider(ctx, w, y) {
    ctx.save();
    var g = ctx.createLinearGradient(20, y, w - 20, y);
    g.addColorStop(0, 'rgba(60,45,30,0)');
    g.addColorStop(0.15, 'rgba(60,45,30,0.06)');
    g.addColorStop(0.85, 'rgba(60,45,30,0.06)');
    g.addColorStop(1, 'rgba(60,45,30,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(w - 20, y);
    ctx.stroke();
    ctx.restore();
  }

  _drawNav(ctx) {
    var w = ctx.canvas.width;

    // Decorative dots above each button
    ctx.save();
    for (var j = 0; j < this._buttons.length; j++) {
      var bd = this._buttons[j];
      ctx.fillStyle = 'rgba(60,45,30,0.08)';
      ctx.beginPath();
      ctx.arc(bd.x + bd.w / 2, bd.y - 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(60,45,30,0.04)';
      ctx.beginPath();
      ctx.arc(bd.x + bd.w / 2, bd.y - 6, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    for (var i = 0; i < this._buttons.length; i++) {
      var b = this._buttons[i];
      var pressed = this._pressedBtn === 'nav_' + b.action;
      drawSongBtn(ctx, b.x, b.y, b.w, b.h, b.label, {
        bgColor: pressed ? C.songInkLight : b.color,
        textColor: C.songCard,
        r: b.h / 2,
        fontSize: 16,
      });
    }
  }

  _drawHeader(ctx, w, p) {
    // Title with calligraphy style
    ctx.save();
    ctx.fillStyle = C.ink;
    ctx.font = 'bold ' + fs(w, 16) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(60,45,30,0.1)';
    ctx.shadowBlur = 2;
    ctx.fillText('自律 · 江湖', 18, 12);

    ctx.fillStyle = REALM_COLORS[p.realm] || C.inkLight;
    ctx.font = getFont(w, 11, 'sans');
    ctx.textAlign = 'right';
    ctx.shadowBlur = 0;
    ctx.fillText(p.realmName + '  Lv.' + p.level, w - 18, 14);
    ctx.restore();

    // Decorative seal stamp
    drawSeal(ctx, w - 18, 28, 24, '修', C.zhuSha);

    // Progress bar with realm milestones
    var bx = 18;
    var by = 32;
    var bw = w - 52;
    var bh = 8;
    roundRect(ctx, bx, by, bw, bh, bh / 2);
    ctx.fillStyle = 'rgba(60,45,30,0.06)';
    ctx.fill();
    var ratio = Math.min(1, p.completedDays / TOTAL_DAYS);
    var fw = Math.max(0, (bw - 2) * ratio);
    if (fw > 2) {
      roundRect(ctx, bx + 1, by + 1, fw, bh - 2, (bh - 2) / 2);
      var g = ctx.createLinearGradient(bx, by, bx + bw, by);
      g.addColorStop(0, C.jade);
      g.addColorStop(0.5, C.gold);
      g.addColorStop(1, C.red);
      ctx.fillStyle = g;
      ctx.fill();
    }
    for (var r = 0; r < REALMS.length; r++) {
      var rx = bx + (REALMS[r].reqDays / TOTAL_DAYS) * bw;
      ctx.fillStyle = REALMS[r].color;
      ctx.beginPath();
      ctx.arc(rx, by + bh / 2, 3, 0, Math.PI * 2);
      ctx.fill();
      if (p.realm >= r) {
        ctx.strokeStyle = C.white;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    ctx.fillStyle = C.gold;
    ctx.font = 'bold ' + getFont(w, 10, 'sans');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('⚡ ' + p.streak + '天连击', 18, 47);

    ctx.fillStyle = C.inkMuted;
    ctx.font = getFont(w, 9, 'sans');
    ctx.textAlign = 'right';
    ctx.fillText(p.completedDays + '/' + TOTAL_DAYS + '天', w - 18, 48);
  }

  _drawTodo(ctx, w, p) {
    var gap = 26;
    var todoW = Math.min(w * 0.78, 320);
    var todoX = (w - todoW) / 2;
    var itemH = 28;
    var count = XINFA_LIST.length;
    var titleH = 16;
    var titleY = 38;
    var itemStart = titleY + titleH + 4;
    var itemsEnd = itemStart + count * itemH;
    var progH = 6;
    var progY = itemsEnd + 4;
    var btnH = 26;
    var btnY = progY + progH + 4;
    var cardH = btnY + btnH + 8 - titleY + 8;

    // Centered card (lighter inset)
    drawSongCard(ctx, todoX, titleY - 6, todoW, cardH, 8, {
      bgColor: C.songPaper,
      noBorder: true,
      shadow: false,
    });

    // Corner ornaments (traditional document brackets)
    ctx.save();
    ctx.strokeStyle = 'rgba(60,45,30,0.08)';
    ctx.lineWidth = 1;
    var tx = todoX, ty = titleY - 6, tw = todoW, th = cardH;
    var cd = 10, cp = 5;
    ctx.beginPath();
    ctx.moveTo(tx + cd, ty + cp);
    ctx.lineTo(tx + cp, ty + cp);
    ctx.lineTo(tx + cp, ty + cd);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx + tw - cd, ty + cp);
    ctx.lineTo(tx + tw - cp, ty + cp);
    ctx.lineTo(tx + tw - cp, ty + cd);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx + cd, ty + th - cp);
    ctx.lineTo(tx + cp, ty + th - cp);
    ctx.lineTo(tx + cp, ty + th - cd);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx + tw - cd, ty + th - cp);
    ctx.lineTo(tx + tw - cp, ty + th - cp);
    ctx.lineTo(tx + tw - cp, ty + th - cd);
    ctx.stroke();
    ctx.restore();

    // Title
    ctx.fillStyle = C.songInk;
    ctx.font = getFont(w, 13, 'song');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('今日修行 · 第 ' + (p.completedDays + 1) + ' 天', todoX + 12, titleY);

    if (p.completedToday) {
      ctx.fillStyle = C.jade;
      ctx.font = getFont(w, 9, 'sans');
      ctx.textAlign = 'right';
      ctx.fillText('✓ 今日已毕', todoX + todoW - 12, titleY + 2);
    }

    // Todo items
    for (var i = 0; i < count; i++) {
      var y = itemStart + i * itemH;
      var done = this._todoDone[i];
      var xf = XINFA_LIST[i];

      if (done) {
        ctx.save();
        roundRect(ctx, todoX + 3, y, todoW - 6, itemH - 2, 4);
        ctx.fillStyle = 'rgba(92,140,90,0.06)';
        ctx.fill();
        ctx.restore();
      }

      ctx.fillStyle = done ? C.jade : C.songInkLight;
      ctx.font = fs(w, 12) + 'px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(done ? '☑' : '☐', todoX + 10, y + 2);

      ctx.fillStyle = done ? C.songInkLight : C.songInk;
      ctx.font = getFont(w, 10, 'sans');
      ctx.fillText(xf.name, todoX + 10 + gap, y + 2);

      ctx.fillStyle = C.songInkLight;
      ctx.font = fs(w, 8) + 'px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(xf.short, todoX + todoW - 10, y + 4);
    }

    var doneCount = 0;
    for (var j = 0; j < count; j++) { if (this._todoDone[j]) doneCount++; }

    // Progress bar
    var pW = todoW - 16;
    roundRect(ctx, todoX + 8, progY, pW, progH, progH / 2);
    ctx.fillStyle = 'rgba(60,45,30,0.05)';
    ctx.fill();
    var pct = doneCount / count;
    if (pct > 0) {
      roundRect(ctx, todoX + 9, progY + 1, Math.max(3, (pW - 2) * pct), progH - 2, (progH - 2) / 2);
      var pg = ctx.createLinearGradient(todoX + 8, 0, todoX + 8 + pW, 0);
      pg.addColorStop(0, C.jade);
      pg.addColorStop(0.6, C.songGold);
      pg.addColorStop(1, doneCount >= count ? C.goldLight : C.songMutedRed);
      ctx.fillStyle = pg;
      ctx.fill();
    }

    // Inline star+count
    var starCount = doneCount >= 7 ? 3 : doneCount >= 4 ? 2 : doneCount >= 1 ? 1 : 0;
    ctx.textBaseline = 'top';
    ctx.font = fs(w, 11) + 'px sans-serif';
    ctx.textAlign = 'left';
    for (var s = 0; s < 3; s++) {
      ctx.fillStyle = s < starCount ? C.songGold : C.songInkLight;
      ctx.fillText(s < starCount ? STAR_TEXTS[1] : STAR_TEXTS[0], todoX + 12 + s * 16, btnY + 4);
    }
    ctx.fillStyle = C.songInkLight;
    ctx.font = getFont(w, 8, 'sans');
    ctx.fillText(doneCount + '/' + count, todoX + 12 + 54, btnY + 5);

    // "完成修行" button
    if (!p.completedToday && doneCount > 0) {
      var btnW = doneCount >= count ? 100 : 84;
      var bx = todoX + todoW - btnW - 10;
      var btnColor = doneCount >= count ? C.songGold : C.songMutedRed;
      ctx.save();
      drawSongBtn(ctx, bx, btnY, btnW, btnH, '完成修行', {
        bgColor: btnColor,
        textColor: doneCount >= count ? C.songInk : C.songCard,
        fontSize: 13,
        fontStyle: 'sans',
        pressed: this._pressedBtn === 'complete',
      });
      ctx.restore();
      if (doneCount >= count) {
        ctx.save();
        ctx.fillStyle = C.songGold;
        ctx.globalAlpha = 0.3 + Math.sin(this._timer * 3) * 0.15;
        ctx.font = fs(w, 7) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✦ 可圆满完成 ✦', bx + btnW / 2, btnY + btnH + 2);
        ctx.restore();
      }
    }

    this._todoMetrics = {
      todoX: todoX, todoW: todoW, todoEnd: titleY - 6 + cardH,
      count: count, itemStart: itemStart, itemH: itemH,
      progY: progY, progH: progH, btnY: btnY, btnH: btnH,
    };
  }

  _buildCalendarEntries(p) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var todayStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

    var startDateStr = '';
    if (p.startDate) {
      if (typeof p.startDate === 'number') {
        var sd2 = new Date(p.startDate);
        startDateStr = sd2.getFullYear() + '-' + (sd2.getMonth() + 1) + '-' + sd2.getDate();
      } else {
        startDateStr = p.startDate;
      }
    }

    var rangeMonths = p.calendarRange || 6;
    var earliestDate;
    if (rangeMonths === 0) {
      earliestDate = new Date(864e13);
      var allAttempts = (p.attempts || []).concat([{
        startDate: startDateStr,
        endDate: todayStr,
      }]);
      for (var ai = 0; ai < allAttempts.length; ai++) {
        var as = allAttempts[ai].startDate;
        if (as) {
          var ad = new Date(as);
          if (ad < earliestDate) earliestDate = ad;
        }
      }
      if (earliestDate.getTime() === 864e13) earliestDate = new Date();
    } else {
      earliestDate = new Date(today.getFullYear(), today.getMonth() - rangeMonths + 1, 1);
      if (earliestDate > today) earliestDate = new Date(today.getFullYear(), 0, 1);
    }

    var firstGridDay = new Date(earliestDate);
    firstGridDay.setDate(firstGridDay.getDate() - firstGridDay.getDay());

    var entries = [];
    var hist = p.history || [];
    var missed = p.missedDays || [];

    function dateStr(d) {
      return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    }

    var cursor = new Date(firstGridDay);
    while (cursor <= today) {
      var ds = dateStr(cursor);
      var dow = cursor.getDay();

      var state = CALENDAR_STATE.EMPTY;
      var attemptDay = 0;
      var attemptNum = 0;
      var stars = 0;

      var isToday = ds === todayStr;

      var foundCompleted = false;
      for (var hi = 0; hi < hist.length; hi++) {
        if (hist[hi].dateStr === ds && !hist[hi].failed) {
          foundCompleted = true;
          attemptDay = hist[hi].day;
          attemptNum = hist[hi].attempt || 0;
          stars = hist[hi].stars || 0;
          state = isToday ? CALENDAR_STATE.TODAY_DONE : CALENDAR_STATE.COMPLETED;
          break;
        }
      }

      if (foundCompleted) {
        // already set
      }

      // Check if this date is an interruption point (end of an interrupted attempt)
      if (state !== CALENDAR_STATE.COMPLETED && state !== CALENDAR_STATE.TODAY_DONE) {
        for (var ai3 = 0; ai3 < (p.attempts || []).length; ai3++) {
          var aa = p.attempts[ai3];
          if (aa.reason === 'interrupted' && aa.endDate === ds) {
            state = CALENDAR_STATE.INTERRUPTION;
            attemptNum = aa.attempt;
            attemptDay = aa.completedDays;
            break;
          }
        }
      }

      if (state === CALENDAR_STATE.INTERRUPTION) {
        // already set above
      } else if (isToday) {
        state = p.completedToday ? CALENDAR_STATE.TODAY_DONE : CALENDAR_STATE.TODAY_UNDONE;
        attemptDay = p.day;
        attemptNum = p.currentAttempt;
      } else {
        var inAnyAttempt = false;
        var curDateNum = cursor.getTime();
        var attempts = p.attempts || [];
        for (var ai2 = 0; ai2 < attempts.length; ai2++) {
          var a = attempts[ai2];
          var aStart = new Date(a.startDate);
          var aEnd = new Date(a.endDate);
          aEnd.setHours(23, 59, 59, 999);
          if (curDateNum >= aStart.getTime() && curDateNum <= aEnd.getTime()) {
            inAnyAttempt = true;
            attemptNum = a.attempt;
            var diff = Math.round((curDateNum - aStart.getTime()) / 86400000);
            attemptDay = diff + 1;
            break;
          }
        }
        if (!inAnyAttempt && startDateStr) {
          var curStart = new Date(startDateStr);
          if (curDateNum >= curStart.getTime()) {
            inAnyAttempt = true;
            attemptNum = p.currentAttempt;
            var diff2 = Math.round((curDateNum - curStart.getTime()) / 86400000);
            attemptDay = diff2 + 1;
          }
        }

        if (inAnyAttempt) {
          var foundMissed = false;
          for (var mi = 0; mi < missed.length; mi++) {
            if (missed[mi].dateStr === ds) {
              foundMissed = true;
              attemptDay = missed[mi].day;
              attemptNum = missed[mi].attempt || attemptNum;
              break;
            }
          }
          state = CALENDAR_STATE.MISSED;
        }
      }

      entries.push({
        date: new Date(cursor),
        dateStr: ds,
        dayOfMonth: cursor.getDate(),
        month: cursor.getMonth(),
        year: cursor.getFullYear(),
        dayOfWeek: dow,
        state: state,
        attemptDay: attemptDay,
        attemptNum: attemptNum,
        stars: stars,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return entries;
  }

  _drawCalendarGrid(ctx, w, p) {
    var m = this._todoMetrics;
    var startY = (m ? m.todoEnd : 240) + 6;
    var h = this.sm.canvas.height;
    var navY = h - 60;
    var availH = navY - startY - 8;
    if (availH < 40) return;

    var cols = 7;
    var gap = 1.5;
    var maxTotalW = w - 20;
    var cellSize = Math.floor(Math.min(36, (maxTotalW - (cols - 1) * gap) / cols));
    if (cellSize < 20) cellSize = 20;
    var totalW = cols * cellSize + (cols - 1) * gap;
    var ox = (w - totalW) / 2;
    var todoX = m ? m.todoX : ox;
    var titleY = startY;
    var titleH = 14;
    var rangePillH = 18;
    var headerH = 12;

    // Title
    ctx.fillStyle = C.songInk;
    ctx.font = getFont(w, 13, 'song');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('修行日历', todoX + 12, titleY);

    // Counter
    ctx.fillStyle = C.songInkLight;
    ctx.font = getFont(w, 8, 'sans');
    ctx.textAlign = 'right';
    ctx.fillText(p.completedDays + '/' + TOTAL_DAYS + '天', todoX + (m ? m.todoW : totalW + 12) - 12, titleY + 2);

    // Underline
    ctx.save();
    ctx.strokeStyle = 'rgba(60,45,30,0.06)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(todoX + 12, titleY + 18);
    ctx.lineTo(todoX + 80, titleY + 18);
    ctx.stroke();
    ctx.restore();

    // Range pills
    var rangePillY = titleY + 22;
    var pillGap = 6;
    var pillMargin = 3;
    var totalPillW = 0;
    for (var ri = 0; ri < CALENDAR_RANGES.length; ri++) {
      totalPillW += CALENDAR_RANGES[ri].label.length * 8 + 14;
    }
    totalPillW += (CALENDAR_RANGES.length - 1) * pillGap;
    var pillStartX = (w - totalPillW) / 2;
    this._calendarPillRects = [];

    for (var ri2 = 0; ri2 < CALENDAR_RANGES.length; ri2++) {
      var rg = CALENDAR_RANGES[ri2];
      var pw = rg.label.length * 8 + 14;
      var ph = rangePillH;
      var px2 = pillStartX + ri2 * (pw + pillGap);
      var active = (p.calendarRange === rg.value);
      roundRect(ctx, px2, rangePillY, pw, ph, ph / 2);
      if (active) {
        ctx.fillStyle = C.ink;
        ctx.globalAlpha = 0.12;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = active ? C.ink : C.inkMuted;
      ctx.globalAlpha = active ? 0.25 : 0.12;
      ctx.lineWidth = 0.5;
      roundRect(ctx, px2 + 0.5, rangePillY + 0.5, pw - 1, ph - 1, ph / 2);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.fillStyle = active ? C.ink : C.inkMuted;
      ctx.font = fs(w, 8) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rg.label, px2 + pw / 2, rangePillY + ph / 2);

      this._calendarPillRects.push({ x: px2, y: rangePillY, w: pw, h: ph, value: rg.value });
    }

    var headerY = rangePillY + rangePillH + 2;

    // Weekday header pills
    for (var d = 0; d < cols; d++) {
      var hx = ox + d * (cellSize + gap) + cellSize / 2;
      var hw = cellSize - 6;
      roundRect(ctx, hx - hw / 2, headerY + 1, hw, headerH - 2, 4);
      ctx.fillStyle = 'rgba(60,45,30,0.03)';
      ctx.fill();
      ctx.fillStyle = (d === 0 || d === 6) ? C.songMutedRed : C.songInkLight;
      ctx.font = getFont(w, 7, 'sans');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(WEEKDAYS[d], hx, headerY + headerH / 2);
    }

    var gridY = headerY + headerH + 2;
    var viewportH = navY - 8 - gridY;
    if (viewportH < 20) return;

    // Build calendar entries from start boundary to today
    var entries = this._buildCalendarEntries(p);
    var numWeeks = Math.ceil(entries.length / cols);
    var totalGridH = numWeeks * (cellSize + gap);
    var maxScroll = Math.max(0, totalGridH - viewportH);
    this._calendarScrollY = Math.max(0, Math.min(this._calendarScrollY, maxScroll));

    this._calendarGridMetrics = {
      ox: ox, gridY: gridY, cellSize: cellSize, gap: gap,
      cols: cols, viewportH: viewportH, maxScroll: maxScroll,
      totalGridH: totalGridH, entries: entries,
    };

    // Clip to grid viewport
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, ox - 2, gridY - 2, totalW + 4, viewportH + 4, 4);
    ctx.clip();

    var scrollOff = this._calendarScrollY;

    // Collect month boundaries for labels
    var monthLabels = [];
    var lastMonth = -1;

    for (var ei = 0; ei < entries.length; ei++) {
      var ent = entries[ei];
      var week = Math.floor(ei / cols);
      var weekY = gridY + week * (cellSize + gap) - scrollOff;
      if (weekY + cellSize < gridY) continue;
      if (weekY > gridY + viewportH) break;

      var cx = ox + ent.dayOfWeek * (cellSize + gap);
      var cy = weekY;

      // Month label at month boundary (first day of month, or first entry)
      if (ent.month !== lastMonth && ei > 0) {
        monthLabels.push({ month: ent.month, year: ent.year, y: cy - gap / 2 });
      }
      lastMonth = ent.month;

      var pulseA = 0.06 + Math.sin(this._timer * 3 + ei) * 0.03;
      var cornerR = 3;

      // Cell background
      roundRect(ctx, cx + 0.5, cy + 0.5, cellSize - 1, cellSize - 1, cornerR);

      switch (ent.state) {
        case CALENDAR_STATE.COMPLETED:
        case CALENDAR_STATE.TODAY_DONE:
          ctx.fillStyle = 'rgba(74,156,123,0.25)';
          break;
        case CALENDAR_STATE.TODAY_UNDONE:
          ctx.fillStyle = 'rgba(212,160,74,' + pulseA + ')';
          break;
        case CALENDAR_STATE.MISSED:
          ctx.fillStyle = 'rgba(232,138,58,0.12)';
          break;
        default:
          ctx.fillStyle = 'rgba(60,45,30,0.02)';
      }
      ctx.fill();

      // Border
      if (ent.state === CALENDAR_STATE.TODAY_UNDONE || ent.state === CALENDAR_STATE.TODAY_DONE) {
        ctx.save();
        ctx.shadowColor = 'rgba(212,160,74,0.3)';
        ctx.shadowBlur = 4 + Math.sin(this._timer * 3) * 2;
        ctx.strokeStyle = C.gold;
        ctx.lineWidth = 1;
        roundRect(ctx, cx + 1, cy + 1, cellSize - 2, cellSize - 2, Math.max(cornerR - 0.5, 1));
        ctx.stroke();
        ctx.restore();
      } else if (ent.state === CALENDAR_STATE.COMPLETED) {
        ctx.strokeStyle = C.jade;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.15;
        roundRect(ctx, cx + 0.5, cy + 0.5, cellSize - 1, cellSize - 1, cornerR);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else {
        ctx.strokeStyle = 'rgba(60,45,30,0.03)';
        ctx.lineWidth = 0.3;
        roundRect(ctx, cx + 0.5, cy + 0.5, cellSize - 1, cellSize - 1, cornerR);
        ctx.stroke();
      }

      // Real date (day of month) - prominent, top-left
      ctx.fillStyle = C.ink;
      ctx.font = 'bold ' + fs(w, 11) + 'px "PingFang SC", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(ent.dayOfMonth + '', cx + 2, cy + 2);

      // Attempt dot + day number - bottom-right
      if (ent.attemptDay > 0) {
        var dotColor = ATTEMPT_COLORS[(ent.attemptNum - 1) % ATTEMPT_COLORS.length];
        if (ent.state === CALENDAR_STATE.MISSED) dotColor = C.orange;
        var dotR = 2.5;
        ctx.fillStyle = dotColor;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(cx + cellSize - 4 - dotR - 1, cy + cellSize - 5, dotR, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = C.inkMuted;
        ctx.font = fs(w, 6) + 'px "PingFang SC", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(ent.attemptDay + '', cx + cellSize - 3, cy + cellSize - 2);
      }

      // Star for completed
      if (ent.state === CALENDAR_STATE.COMPLETED || ent.state === CALENDAR_STATE.TODAY_DONE) {
        if (ent.stars >= 3) {
          ctx.fillStyle = C.songGold;
          ctx.font = fs(w, 7) + 'px sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.fillText('★', cx + cellSize - 2, cy + cellSize - 2);
        } else {
          ctx.fillStyle = C.songGold;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.arc(cx + cellSize - 4, cy + cellSize - 4, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // Interruption line: draw between rows where one attempt ends and next begins
      if (ei > 0) {
        var prev = entries[ei - 1];
        if (prev.attemptNum > 0 && ent.attemptNum > 0 && prev.attemptNum !== ent.attemptNum) {
          ctx.save();
          ctx.strokeStyle = C.red;
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(ox + 4, cy - gap / 2);
          ctx.lineTo(ox + totalW - 4, cy - gap / 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;

          // X marker
          ctx.fillStyle = C.red;
          ctx.globalAlpha = 0.5;
          ctx.font = fs(w, 9) + 'px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✕', ox + totalW / 2, cy - gap / 2);
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      }
    }

    // Month labels (drawn after grid, in the margin)
    for (var mi2 = 0; mi2 < monthLabels.length; mi2++) {
      var ml = monthLabels[mi2];
      var ly = ml.y - scrollOff;
      if (ly >= gridY && ly <= gridY + viewportH) {
        ctx.save();
        ctx.fillStyle = C.ink;
        ctx.globalAlpha = 0.08;
        ctx.font = 'bold ' + fs(w, 10) + 'px "PingFang SC", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(ml.year + '年' + (ml.month + 1) + '月', ox + 2, ly - 10);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  _handleAction(action, p) {
    switch (action) {
      case 'story':
        this.sm.transitionTo(STATUS.STORY, { player: p });
        break;
      case 'adventure':
        this.sm.transitionTo(STATUS.ADVENTURE, { player: p });
        break;
      case 'minigame':
        this.sm.transitionTo(STATUS.MINIGAME, { player: p });
        break;
      case 'history':
        this.sm.transitionTo(STATUS.HISTORY, { player: p });
        break;
    }
  }

  _drawStats(ctx, w, h, p) {
    if (!this._showStats) return;

    ctx.save();
    ctx.fillStyle = 'rgba(60,45,30,0.45)';
    ctx.fillRect(0, 0, w, h);

    var pw = Math.min(280, w - 40);
    var ph = Math.min(340, h - 60);
    var px = (w - pw) / 2;
    var py = (h - ph) / 2;
    drawSongCard(ctx, px, py, pw, ph, 10, { bgColor: C.songCard, shadow: true });

    ctx.fillStyle = C.songInk;
    ctx.font = getFont(w, 16, 'song');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('江湖属性', w / 2, py + 14);

    // Gold divider beneath title
    ctx.save();
    var dg = ctx.createLinearGradient(px + 20, py + 42, px + pw - 20, py + 42);
    dg.addColorStop(0, 'rgba(189,148,64,0)');
    dg.addColorStop(0.15, 'rgba(189,148,64,0.3)');
    dg.addColorStop(0.5, 'rgba(189,148,64,0.5)');
    dg.addColorStop(0.85, 'rgba(189,148,64,0.3)');
    dg.addColorStop(1, 'rgba(189,148,64,0)');
    ctx.strokeStyle = dg;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(px + 20, py + 42);
    ctx.lineTo(px + pw - 20, py + 42);
    ctx.stroke();
    ctx.restore();

    var ly = py + 52;
    var keys = Object.keys(STAT_LABELS);
    var half = Math.ceil(keys.length / 2);
    var colW = (pw - 40) / 2;

    // Subtle card for each stat row
    for (var i = 0; i < keys.length; i++) {
      var col = i < half ? 0 : 1;
      var row2 = i < half ? i : i - half;
      var sx = px + 16 + col * (colW + 8);
      var sy = ly + row2 * 38 + 2;

      // Subtle background card
      roundRect(ctx, sx - 4, sy - 2, colW + 8, 32, 4);
      ctx.fillStyle = 'rgba(245,239,224,0.3)';
      ctx.fill();

      var val = p.stats[keys[i]] || 1;
      ctx.fillStyle = C.songInkLight;
      ctx.font = getFont(w, 10, 'sans');
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(STAT_LABELS[keys[i]], sx, sy);

      ctx.fillStyle = REALM_COLORS[Math.min(val, 5)];
      ctx.font = 'bold ' + fs(w, 15) + 'px "PingFang SC", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val + '', sx + colW, sy);

      var bx = sx;
      var by = sy + 20;
      var bw3 = colW;
      roundRect(ctx, bx, by, bw3, 6, 3);
      ctx.fillStyle = 'rgba(60,45,30,0.06)';
      ctx.fill();
      var fr = Math.min(1, val / 20);
      if (fr > 0.01) {
        roundRect(ctx, bx + 1, by + 1, Math.max(2, (bw3 - 2) * fr), 4, 2);
        ctx.fillStyle = REALM_COLORS[Math.min(val, 5)];
        ctx.fill();
      }
    }

    ly += half * 36 + 10;
    ctx.fillStyle = C.songInk;
    ctx.font = getFont(w, 11, 'sans');
    ctx.textAlign = 'left';
    ctx.fillText('连续修行: ' + p.streak + '天', px + 16, ly); ly += 18;
    ctx.fillText('总获星数: ' + p.totalStars, px + 16, ly); ly += 18;
    ctx.fillText('当前境界: ' + p.realmName, px + 16, ly);

    ctx.fillStyle = C.songInkLight;
    ctx.font = getFont(w, 9, 'sans');
    ctx.textAlign = 'center';
    ctx.fillText('点击任意处关闭', w / 2, py + ph - 14);

    // Decorative bottom line
    ctx.save();
    var bg2 = ctx.createLinearGradient(px + 30, py + ph - 18, px + pw - 30, py + ph - 18);
    bg2.addColorStop(0, 'rgba(60,45,30,0)');
    bg2.addColorStop(0.5, 'rgba(60,45,30,0.06)');
    bg2.addColorStop(1, 'rgba(60,45,30,0)');
    ctx.strokeStyle = bg2;
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(px + 30, py + ph - 18);
    ctx.lineTo(px + pw - 30, py + ph - 18);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  handleTap(x, y) {
    var w = this.sm.canvas.width;
    var p = this.player;

    if (this._showStats) {
      this._showStats = false;
      return;
    }

    // Calendar range pills
    if (this._calendarPillRects) {
      for (var pri = 0; pri < this._calendarPillRects.length; pri++) {
        var pr = this._calendarPillRects[pri];
        if (x >= pr.x && x <= pr.x + pr.w && y >= pr.y && y <= pr.y + pr.h) {
          if (p.calendarRange !== pr.value) {
            p.calendarRange = pr.value;
            StorageManager.save(p);
          }
          return;
        }
      }
    }

    // Pet hit - start drag (check before calendar so pet stays interactive)
    var petCX = this._petX;
    var petCY = this._petY;
    if (x >= petCX - 20 && x <= petCX + 20 && y >= petCY - 20 && y <= petCY + 20) {
      this._isDraggingPet = true;
      this._dragStartX = x;
      this._dragStartY = y;
      this._petDragOffX = petCX - x;
      this._petDragOffY = petCY - y;
      this._pet.setState('drag');
      return;
    }

    // Calendar grid touch start (for scroll)
    var cgm = this._calendarGridMetrics;
    if (cgm) {
      if (x >= cgm.ox && x <= cgm.ox + cgm.cols * (cgm.cellSize + cgm.gap) &&
          y >= cgm.gridY && y <= cgm.gridY + cgm.viewportH) {
        this._calendarTouchStartY = y;
        return;
      }
    }

    // Bottom nav buttons
    for (var bi = 0; bi < this._buttons.length; bi++) {
      var b = this._buttons[bi];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        this._pressedBtn = 'nav_' + b.action;
        if (b.action === 'stats') {
          this._showStats = !this._showStats;
        } else {
          if (this.sm.audio) this.sm.audio.playTap();
          this._handleAction(b.action, p);
        }
        return;
      }
    }

    // Todo section
    var m = this._todoMetrics;
    if (m && !p.completedToday && !this._dayComplete) {
      // Tap on todo items
      for (var i = 0; i < m.count; i++) {
        var iy = m.itemStart + i * m.itemH;
        if (x >= m.todoX && x <= m.todoX + m.todoW && y >= iy && y <= iy + m.itemH) {
          if (!this._todoDone[i]) {
            this._completeTodo(i);
          }
          return;
        }
      }

      // Complete button
      var doneCount = 0;
      for (var j = 0; j < m.count; j++) { if (this._todoDone[j]) doneCount++; }
      if (doneCount > 0) {
        var btnW = doneCount >= m.count ? 100 : 84;
        var bx = m.todoX + m.todoW - btnW - 10;
        if (x >= bx && x <= bx + btnW && y >= m.btnY && y <= m.btnY + m.btnH) {
          this._pressedBtn = 'complete';
          this._finishDay(p);
          return;
        }
      }
    }
  }

  handleDrag(x, y) {
    if (this._calendarTouchStartY >= 0) {
      var dy = y - this._calendarTouchStartY;
      if (Math.abs(dy) > 3) {
        var cgm = this._calendarGridMetrics;
        if (cgm) {
          this._calendarScrollY = Math.max(0, Math.min(cgm.maxScroll, this._calendarScrollY - dy));
        }
        this._calendarTouchStartY = y;
      }
      return;
    }
    if (!this._isDraggingPet) return;
    var prevX = this._petX;
    var prevY = this._petY;
    this._petX = x + this._petDragOffX;
    this._petY = y + this._petDragOffY;
    // clamp to screen bounds
    var w = this.sm.canvas.width;
    var h = this.sm.canvas.height;
    this._petX = Math.max(20, Math.min(w - 20, this._petX));
    this._petY = Math.max(20, Math.min(h - 20, this._petY));
    // Apply drag squish force
    var dx = this._petX - prevX;
    var dy = this._petY - prevY;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      this._pet.applyDragForce(dx, dy);
    }
  }

  handleDragEnd(x, y) {
    this._calendarTouchStartY = -1;
    if (!this._isDraggingPet) return;
    this._isDraggingPet = false;
    var dx = x - this._dragStartX;
    var dy = y - this._dragStartY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 8) {
      // was a tap, not a drag → show encouragement
      this._pet.setState('happy');
      this._emitPetText(ENCOURAGE_MSGS[Math.floor(Math.random() * ENCOURAGE_MSGS.length)]);
      this._pts.emitInkSplash(this._petX, this._petY);
      if (this.sm.audio) this.sm.audio.playTap();
    } else {
      this._pet.setState('idle');
    }
  }

  handleWheel(dx, dy) {
    if (this._calendarGridMetrics) {
      this._calendarScrollY = Math.max(0, Math.min(
        this._calendarGridMetrics.maxScroll,
        this._calendarScrollY + dy * 36
      ));
    }
  }

  _emitPetText(text) {
    this._floatTexts.push({
      x: this._petX,
      y: this._petY - 12,
      label: text,
      color: C.gold,
      vy: -40,
      life: 1.8,
    });
  }

  _completeTodo(i) {
    if (this._todoDone[i]) return;
    this._todoDone[i] = true;
    this.player.applyRule(XINFA_LIST[i].id);
    this.player.petAffection = (this.player.petAffection || 0) + 1;

    // floating stat text
    var m2 = this._todoMetrics;
    var ftX = this.sm.canvas.width * 0.3;
    var ftY = m2 ? (m2.itemStart + i * m2.itemH) : 120;
    var xf = XINFA_LIST[i];
    var statLabel = STAT_LABELS[xf.stat] || xf.stat;
    var statColors = {
      zhenqi: C.jade, xinjing: C.jadeLight, tipo: C.earth,
      xueshi: C.gold, gongli: C.earthLight, qingqi: C.jadeDark,
      dunwu: C.purple,
    };
    this._floatTexts.push({
      x: ftX,
      y: ftY,
      label: '+1 ' + statLabel,
      color: statColors[xf.stat] || C.gold,
      vy: -50,
      life: 1.5,
    });

    // ink splash
    this._pts.emitInkSplash(ftX, ftY);
    if (this.sm.audio) this.sm.audio.playComplete();

    // pet encouragement + growth
    this._pet.setState('happy');
    var skinUpgraded = this._pet.addGrowth(1);
    if (skinUpgraded && this._pet.skinInfo) {
      this._toast = '宠物进化 · ' + this._pet.skinInfo.desc + '!';
      this._toastT = 3;
      this._pts.emitGoldSplash(this._petX, this._petY);
    }
    this._pet.saveToPlayer(this.player);
    StorageManager.save(this.player);
    this._emitPetText(ENCOURAGE_MSGS[Math.floor(Math.random() * ENCOURAGE_MSGS.length)]);
    this._pts.emitInkSplash(this._petX, this._petY);

    var allDone = true;
    for (var j = 0; j < XINFA_LIST.length; j++) { if (!this._todoDone[j]) { allDone = false; break; } }
    if (allDone) {
      this._pet.setState('excited');
      this._pts.emitGoldSplash(this.sm.canvas.width * 0.5, m2.progY);
      // burst of encouragement from pet
      for (var e = 0; e < 3; e++) {
        setTimeout(function(ee) {
          this._emitPetText(ENCOURAGE_MSGS[Math.floor(Math.random() * ENCOURAGE_MSGS.length)]);
        }.bind(this, e), e * 300);
      }
      if (this.sm.audio) this.sm.audio.playReward();
    }
  }

  _finishDay(p) {
    var doneCount = 0;
    for (var i = 0; i < XINFA_LIST.length; i++) { if (this._todoDone[i]) doneCount++; }
    if (doneCount === 0) return;

    var oldStage = this._pet.getStage(p.completedDays);
    var stars = doneCount >= 7 ? 3 : doneCount >= 4 ? 2 : 1;
    var oldRealm = p.realm;
    var levelUp = p.completeDay(stars);
    var newRealm = p.realm;

    // check achievements
    var newAchievements = StorageManager.checkAchievements(p);
    if (newAchievements.length > 0) {
      this._toast = '成就解锁: ' + newAchievements[0].name;
      this._toastT = 3;
      this._pts.emitGoldSplash(this.sm.canvas.width * 0.5, this.sm.canvas.height * 0.3);
    } else {
      this._toast = stars + '星评定 · 修行圆满';
      this._toastT = 2.5;
    }

    this._dayComplete = true;

    // pet growth bonus for completing all 7 tasks (before toast to check skin)
    var skinUpgraded = this._pet.addGrowth(7);
    this._pet.saveToPlayer(p);
    StorageManager.save(p);

    // WeChat Game Center cloud storage (daily reminder badge)
    try {
      wx.setUserCloudStorage({
        KVDataList: [
          { key: 'day', value: String(p.completedDays) },
          { key: 'streak', value: String(p.streak) },
          { key: 'lastActive', value: _todayStr() },
        ],
      });
    } catch (_) {}

    // Skin upgrade toast (takes priority)
    if (skinUpgraded && this._pet.skinInfo) {
      this._toast = '宠物进化 · ' + this._pet.skinInfo.desc + '!';
      this._toastT = 3;
      this._pts.emitGoldSplash(this.sm.canvas.width * 0.5, 48);
    }

    if (this.sm.audio) this.sm.audio.playReward();

    // pet evolution check
    var newStage = this._pet.getStage(p.completedDays);
    if (newStage > oldStage) {
      this._pet.setState('evolving');
      this._pts.emitGoldSplash(this.sm.canvas.width * 0.5, 48);
    } else {
      this._pet.setState('excited');
    }

    if (newRealm > oldRealm) {
      if (this.sm.audio) this.sm.audio.playRealmUp();
      this._toast = '境界突破 → ' + p.realmName + ' ★ ' + stars + '星';
      this.sm.transitionTo(STATUS.REALM, { player: p, oldRealm: oldRealm });
    }
  }


}

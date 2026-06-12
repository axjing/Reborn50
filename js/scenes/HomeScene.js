import { STATUS, TOTAL_DAYS, REALMS, XINFA_LIST, SCENES_CONFIG, STAT_LABELS } from '../utils/constants.js';
import {
  C, drawBg, drawCard, roundRect, fs, drawInkBtn,
  drawMountain, drawMist, drawSparkle, drawStars, drawTree,
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
    this._pet = new Pet();
    this._floatTexts = [];
    this._petX = 0;
    this._petY = 0;
    this._isDraggingPet = false;
    this._dragStartX = 0;
    this._dragStartY = 0;
    this._petDragOffX = 0;
    this._petDragOffY = 0;
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
      if (StorageManager.checkNewDay(this.player)) {
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

    this._startDayOfWeek = 0;
    var sd = this.player.startDate;
    if (sd) {
      this._startDayOfWeek = new Date(sd).getDay();
    }

    this._initTodo();
    this._petX = w - 50;
    this._petY = 42;
    this._isDraggingPet = false;
    this._buildButtons(w);
  }

  _initTodo() {
    this._todoDone = [];
    for (var i = 0; i < XINFA_LIST.length; i++) {
      this._todoDone[i] = this.player.completedRules.includes(XINFA_LIST[i].id);
    }
  }

  _buildButtons(w) {
    var h = this.sm.canvas.height;
    var bw = Math.min(64, (w - 44) / 4);
    var bh = 32;
    var gap = Math.max(2, (w - 28 - bw * 4) / 3);
    var rowY = h - 52;

    this._buttons = [
      { x: 14, y: rowY, w: bw, h: bh, text: '剧情', color: C.sky, action: 'story' },
      { x: 14 + (bw + gap), y: rowY, w: bw, h: bh, text: '奇遇', color: C.earth, action: 'adventure' },
      { x: 14 + (bw + gap) * 2, y: rowY, w: bw, h: bh, text: '翻牌', color: C.purple, action: 'minigame' },
      { x: 14 + (bw + gap) * 3, y: rowY, w: bw, h: bh, text: '手账', color: C.inkMuted, action: 'history' },
      { x: w - 14 - bw, y: rowY - bh - 8, w: bw, h: bh, text: '属性', color: C.jade, action: 'stats' },
    ];
  }

  update(dt) {
    this._timer += dt;
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
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    var p = this.player;

    this._drawScene(ctx, w, h);

    ctx.save();
    ctx.globalAlpha = 0.92;
    drawCard(ctx, 8, 6, w - 16, h - 12, 12);
    ctx.restore();

    this._drawHeader(ctx, w, p);
    this._pet.draw(ctx, this._petX, this._petY, 28, p.completedDays);

    var m = this._getTodoMetrics(w);
    this._drawDivider(ctx, w, m.titleY - 2);
    this._drawTodo(ctx, w, p);
    this._drawDivider(ctx, w, m.calY - 2);
    var calEnd = this._drawCalendar(ctx, w, p);
    this._drawDivider(ctx, w, calEnd);
    this._drawNav(ctx);

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
      ctx.save();
      var tw = Math.min(260, w - 40);
      roundRect(ctx, w / 2 - tw / 2, h * 0.28, tw, 30, 8);
      ctx.fillStyle = 'rgba(44,44,44,0.82)';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = fs(w, 13) + 'px "SimSun", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this._toast, w / 2, h * 0.28 + 15);
      ctx.restore();
    }
  }

  _drawScene(ctx, w, h) {
    drawBg(ctx, w, h);
    drawMountain(ctx, w, h, this._timer * 0.3);
    drawMist(ctx, w, h, this._mistOffset);
    drawTree(ctx, w * 0.1, h * 0.55, 1, this._timer * 0.2);
    drawTree(ctx, w * 0.9, h * 0.58, 1.2, this._timer * 0.2 + 1);
    drawSparkle(ctx, w * 0.2, h * 0.15, 4, this._timer * 1.3);
    drawSparkle(ctx, w * 0.8, h * 0.12, 3, this._timer * 1.7 + 1);
    if (this.player && this.player.realm >= 3) {
      drawSparkle(ctx, w * 0.5, h * 0.08, 5, this._timer * 0.9 + 2);
    }
  }

  _drawDivider(ctx, w, y) {
    ctx.save();
    var g = ctx.createLinearGradient(20, y, w - 20, y);
    g.addColorStop(0, 'rgba(44,44,44,0)');
    g.addColorStop(0.15, 'rgba(44,44,44,0.06)');
    g.addColorStop(0.85, 'rgba(44,44,44,0.06)');
    g.addColorStop(1, 'rgba(44,44,44,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(w - 20, y);
    ctx.stroke();
    ctx.restore();
  }

  _drawHeader(ctx, w, p) {
    ctx.fillStyle = C.ink;
    ctx.font = 'bold ' + fs(w, 15) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Reborn·江湖', 18, 14);

    ctx.fillStyle = REALM_COLORS[p.realm] || C.inkLight;
    ctx.font = fs(w, 11) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'right';
    ctx.fillText(p.realmName + '  Lv.' + p.level, w - 18, 14);

    var bx = 18;
    var by = 30;
    var bw = w - 36;
    var bh = 8;
    roundRect(ctx, bx, by, bw, bh, bh / 2);
    ctx.fillStyle = 'rgba(44,44,44,0.06)';
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
    ctx.font = 'bold ' + fs(w, 10) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    var streakEmoji = p.streak >= 14 ? '🔥' : (p.streak >= 7 ? '⭐' : '⚡');
    ctx.fillText(streakEmoji + ' ' + p.streak + '天连击', 18, 46);

    ctx.fillStyle = C.inkMuted;
    ctx.font = fs(w, 9) + 'px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(p.completedDays + '/' + TOTAL_DAYS + '天', w - 18, 46);
  }

  _getTodoMetrics(w) {
    var titleY = 60;
    var itemStart = titleY + 16;
    var itemH = 24;
    var count = XINFA_LIST.length;
    var itemsEnd = itemStart + count * itemH;
    var progY = itemsEnd + 4;
    var progH = 14;
    var btnH = 20;
    var calY = progY + progH + 10 + btnH + 6;
    return {
      titleY: titleY,
      itemStart: itemStart,
      itemH: itemH,
      count: count,
      itemsEnd: itemsEnd,
      progY: progY,
      progH: progH,
      btnH: btnH,
      calY: calY,
    };
  }

  _drawTodo(ctx, w, p) {
    var m = this._getTodoMetrics(w);
    var gap = 26;

    // background card
    var cardH = m.progY + m.progH + m.btnH + 12 - (m.titleY - 8);
    roundRect(ctx, 14, m.titleY - 8, w - 28, cardH, 6);
    ctx.fillStyle = 'rgba(250,246,238,0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(44,44,44,0.04)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // decorative left accent bar
    var barG = ctx.createLinearGradient(0, m.titleY - 4, 0, m.titleY + 12);
    barG.addColorStop(0, 'rgba(91,140,90,0.4)');
    barG.addColorStop(1, 'rgba(212,160,74,0.15)');
    ctx.fillStyle = barG;
    roundRect(ctx, 18, m.titleY - 4, 4, 18, 2);
    ctx.fill();

    ctx.fillStyle = C.ink;
    ctx.font = 'bold ' + fs(w, 14) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('今日修行 · 第 ' + (p.completedDays + 1) + ' 天', 28, m.titleY);

    if (!p.completedToday && !this._dayComplete) {
      ctx.fillStyle = C.inkMuted;
      ctx.font = fs(w, 8) + 'px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('详细 →', w - 22, m.titleY + 3);
    }

    if (p.completedToday) {
      ctx.fillStyle = C.jade;
      ctx.font = fs(w, 10) + 'px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('✓ 今日已毕', w - 22, m.titleY + 2);
    }

    for (var i = 0; i < m.count; i++) {
      var y = m.itemStart + i * m.itemH;
      var done = this._todoDone[i];
      var xf = XINFA_LIST[i];

      if (done) {
        ctx.save();
        roundRect(ctx, 16, y - 1, w - 32, m.itemH - 1, 4);
        ctx.fillStyle = 'rgba(92,140,90,0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(92,140,90,0.15)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
      }

      ctx.fillStyle = done ? C.jade : C.inkMuted;
      ctx.font = fs(w, 14) + 'px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(done ? '☑' : '☐', 22, y);

      ctx.fillStyle = done ? C.inkMuted : C.inkLight;
      ctx.font = fs(w, 11) + 'px sans-serif';
      ctx.fillText(TODO_ICONS[i] + ' ' + xf.name, 22 + gap, y);

      ctx.fillStyle = C.inkMuted;
      ctx.font = fs(w, 9) + 'px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(xf.short, w - 22, y + 1);
    }

    var doneCount = 0;
    for (var j = 0; j < m.count; j++) { if (this._todoDone[j]) doneCount++; }
    var pW = w - 36;

    // progress bar 14px tall
    var progH = 14;
    roundRect(ctx, 18, m.progY, pW, progH, progH / 2);
    ctx.fillStyle = 'rgba(44,44,44,0.06)';
    ctx.fill();
    var pct = doneCount / m.count;
    if (pct > 0) {
      roundRect(ctx, 19, m.progY + 1, Math.max(4, (pW - 2) * pct), progH - 2, (progH - 2) / 2);
      var pg = ctx.createLinearGradient(18, 0, 18 + pW, 0);
      pg.addColorStop(0, C.jade);
      pg.addColorStop(0.6, C.gold);
      pg.addColorStop(1, doneCount >= m.count ? C.goldLight : C.red);
      ctx.fillStyle = pg;
      ctx.fill();
    }

    // star rating (bigger)
    var starY = m.progY + progH + 2;
    var starCount = doneCount >= 7 ? 3 : doneCount >= 4 ? 2 : doneCount >= 1 ? 1 : 0;
    var allDone = doneCount >= m.count;
    ctx.font = fs(w, 14) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (var s = 0; s < 3; s++) {
      if (allDone && s < starCount && this._pet._evolved) {
        ctx.save();
        ctx.shadowColor = C.gold;
        ctx.shadowBlur = 6 + Math.sin(this._timer * 3 + s) * 3;
        ctx.fillStyle = C.gold;
        ctx.fillText(STAR_TEXTS[1], 56 + s * 18, starY);
        ctx.restore();
      } else {
        ctx.fillStyle = s < starCount ? C.gold : C.inkMuted;
        ctx.fillText(s < starCount ? STAR_TEXTS[1] : STAR_TEXTS[0], 56 + s * 18, starY);
      }
    }

    // count text
    ctx.fillStyle = C.inkMuted;
    ctx.font = fs(w, 9) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(doneCount + '/' + m.count, 18, starY + 1);

    if (!p.completedToday && doneCount > 0) {
      var bx = w - 18 - 88;
      var by = m.progY - 1;
      var btnColor = doneCount >= m.count ? C.gold : C.red;
      if (doneCount >= m.count) {
        ctx.save();
        var glow = 6 + Math.sin(this._timer * 4) * 4;
        ctx.shadowColor = C.gold;
        ctx.shadowBlur = glow;
        drawInkBtn(ctx, bx, by, 100, m.progH + 8, '完成修行', btnColor);
        ctx.restore();
      } else {
        drawInkBtn(ctx, bx, by, 88, m.progH + 6, '完成修行', btnColor);
      }
    }
  }

  _drawCalendar(ctx, w, p) {
    var calY = this._getTodoMetrics(w).calY;
    var h = this.sm.canvas.height;
    var navEnd = h - 54;
    var availH = navEnd - calY;
    if (availH < 60) return calY + 10;

    var cols = 7;
    var rows = Math.ceil(TOTAL_DAYS / cols);
    var gap = 2;
    var cellW = Math.max(14, Math.floor((w - 36 - gap * (cols - 1)) / cols));
    var cellH = Math.max(12, Math.floor((availH - 30) / rows) - gap);
    var cellSize = Math.min(cellW, cellH, 32);
    var totalW = cols * cellSize + (cols - 1) * gap;
    var ox = 18 + (w - 36 - totalW) / 2;
    var hdrY = calY + 2;

    // title with brush underline
    ctx.fillStyle = C.ink;
    ctx.font = 'bold ' + fs(w, 11) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('修行日历', 18, calY);
    var tuW = fs(w, 11) * 4 + 4;
    var g2 = ctx.createLinearGradient(0, calY + 14, tuW, calY + 14);
    g2.addColorStop(0, 'rgba(44,44,44,0.12)');
    g2.addColorStop(0.5, 'rgba(44,44,44,0.08)');
    g2.addColorStop(1, 'rgba(44,44,44,0)');
    ctx.strokeStyle = g2;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(18, calY + 14);
    ctx.lineTo(18 + tuW, calY + 14);
    ctx.stroke();

    for (var d = 0; d < cols; d++) {
      var hx = ox + d * (cellSize + gap) + cellSize / 2;
      ctx.fillStyle = (d === 0 || d === 6) ? C.redLight : C.inkMuted;
      ctx.font = 'bold ' + fs(w, 9) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(WEEKDAYS[d], hx, hdrY);
    }

    var startDow = this._startDayOfWeek !== undefined ? this._startDayOfWeek : 0;
    var todayIdx = p.completedDays;
    var gridY = hdrY + 12;

    // clip
    var clipH = rows * (cellSize + gap) + 4;
    ctx.save();
    roundRect(ctx, ox - 2, gridY - 2, totalW + 4, clipH, 4);
    ctx.clip();

    for (var day = 1; day <= TOTAL_DAYS; day++) {
      var dow = (startDow + day - 1) % cols;
      var week = Math.floor((startDow + day - 1) / cols);

      var cx = ox + dow * (cellSize + gap);
      var cy = gridY + week * (cellSize + gap);

      var isPast = day <= p.completedDays;
      var isToday = day === p.completedDays + 1 && !p.completedToday;
      var isFuture = day > p.completedDays + 1;

      var cellDone = false;
      var cellStars = 0;
      var hist = p.history || [];
      for (var k = 0; k < hist.length; k++) {
        if (hist[k].day === day && !hist[k].failed) {
          cellDone = true;
          cellStars = hist[k].stars || 0;
          break;
        }
      }

      var pulseA = 0.08 + Math.sin(this._timer * 3 + day) * 0.04;
      roundRect(ctx, cx, cy, cellSize, cellSize, 2);
      if (isToday) {
        ctx.fillStyle = 'rgba(194,53,49,' + pulseA + ')';
      } else if (isFuture) {
        ctx.fillStyle = 'rgba(44,44,44,0.03)';
      } else if (cellDone) {
        if (cellStars >= 3) ctx.fillStyle = C.jade;
        else if (cellStars >= 2) ctx.fillStyle = C.goldLight;
        else ctx.fillStyle = C.gold;
      } else if (isPast) {
        ctx.fillStyle = 'rgba(92,140,90,0.12)';
      } else {
        ctx.fillStyle = 'rgba(44,44,44,0.03)';
      }
      ctx.fill();

      // today glow
      if (isToday) {
        ctx.save();
        ctx.shadowColor = 'rgba(194,53,49,0.5)';
        ctx.shadowBlur = 8 + Math.sin(this._timer * 3) * 4;
        ctx.strokeStyle = C.red;
        ctx.lineWidth = 1.5;
        roundRect(ctx, cx + 0.5, cy + 0.5, cellSize - 1, cellSize - 1, 2);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.strokeStyle = cellDone ? 'rgba(92,140,90,0.15)' : 'rgba(44,44,44,0.05)';
        ctx.lineWidth = 0.3;
        roundRect(ctx, cx + 0.5, cy + 0.5, cellSize - 1, cellSize - 1, 2);
        ctx.stroke();
      }

      // realm marker dot (bottom-right)
      for (var r = 0; r < REALMS.length; r++) {
        if (REALMS[r].reqDays === day && day > 0) {
          ctx.fillStyle = REALMS[r].color;
          ctx.beginPath();
          ctx.arc(cx + cellSize - 3, cy + cellSize - 3, 2.5, 0, Math.PI * 2);
          ctx.fill();
          if (p.realm >= r) {
            ctx.strokeStyle = C.white;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // day number
      ctx.fillStyle = isToday ? C.red : (isFuture ? C.inkMuted : C.ink);
      ctx.font = fs(w, cellSize > 20 ? 9 : 7) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(day + '', cx + cellSize / 2, cy + cellSize / 2);

      // small star for completed
      if (cellDone && cellSize >= 18) {
        ctx.fillStyle = C.goldLight;
        ctx.font = fs(w, 4) + 'px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('★', cx + 1, cy + 1);
      }
    }

    ctx.restore();

    // colored legend
    var legY = gridY + clipH + 2;
    ctx.font = fs(w, 6) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    var legItems = [
      { label: '完成', color: C.jade },
      { label: '星级', color: C.gold },
      { label: '今日', color: C.red },
      { label: '境界', color: C.purple },
    ];
    var lx = 18;
    for (var li = 0; li < legItems.length; li++) {
      ctx.fillStyle = legItems[li].color;
      roundRect(ctx, lx, legY + 1, 5, 5, 1);
      ctx.fill();
      ctx.fillStyle = C.inkMuted;
      ctx.fillText(legItems[li].label, lx + 7, legY);
      lx += 12 + legItems[li].label.length * 7;
    }
    return legY + 10;
  }

  _drawStats(ctx, w, h, p) {
    if (!this._showStats) return;

    ctx.save();
    ctx.fillStyle = 'rgba(44,44,44,0.45)';
    ctx.fillRect(0, 0, w, h);

    var pw = Math.min(280, w - 40);
    var ph = Math.min(340, h - 60);
    var px = (w - pw) / 2;
    var py = (h - ph) / 2;
    drawCard(ctx, px, py, pw, ph, 14);

    ctx.fillStyle = C.ink;
    ctx.font = 'bold ' + fs(w, 18) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('江湖属性', w / 2, py + 14);

    var ly = py + 48;
    var keys = Object.keys(STAT_LABELS);
    var half = Math.ceil(keys.length / 2);
    var colW = (pw - 40) / 2;

    for (var i = 0; i < keys.length; i++) {
      var col = i < half ? 0 : 1;
      var row2 = i < half ? i : i - half;
      var sx = px + 16 + col * (colW + 8);
      var sy = ly + row2 * 36;

      ctx.fillStyle = C.inkLight;
      ctx.font = fs(w, 12) + 'px "SimSun", "KaiTi", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(STAT_LABELS[keys[i]], sx, sy);

      var val = p.stats[keys[i]] || 1;
      ctx.fillStyle = REALM_COLORS[Math.min(val, 5)];
      ctx.font = 'bold ' + fs(w, 16) + 'px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val + '', sx + colW, sy);

      var bx = sx;
      var by = sy + 20;
      var bw3 = colW;
      roundRect(ctx, bx, by, bw3, 6, 3);
      ctx.fillStyle = 'rgba(44,44,44,0.06)';
      ctx.fill();
      var fr = Math.min(1, val / 20);
      if (fr > 0.01) {
        roundRect(ctx, bx + 1, by + 1, Math.max(2, (bw3 - 2) * fr), 4, 2);
        ctx.fillStyle = REALM_COLORS[Math.min(val, 5)];
        ctx.fill();
      }
    }

    ly += half * 36 + 10;
    ctx.fillStyle = C.ink;
    ctx.font = fs(w, 12) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'left';
    ctx.fillText('连续修行: ' + p.streak + '天', px + 16, ly); ly += 20;
    ctx.fillText('总获星数: ' + p.totalStars, px + 16, ly); ly += 20;
    ctx.fillText('当前境界: ' + p.realmName, px + 16, ly);

    ctx.fillStyle = C.inkMuted;
    ctx.font = fs(w, 10) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('点击任意处关闭', w / 2, py + ph - 14);

    ctx.restore();
  }

  _drawNav(ctx) {
    for (var i = 0; i < this._buttons.length; i++) {
      var b = this._buttons[i];
      drawInkBtn(ctx, b.x, b.y, b.w, b.h, b.text, b.color);
    }
  }

  handleTap(x, y) {
    if (this._showStats) {
      this._showStats = false;
      return;
    }

    var w = this.sm.canvas.width;
    var p = this.player;

    // pet hit - start drag
    var petCX = this._petX;
    var petCY = this._petY;
    if (x >= petCX - 20 && x <= petCX + 20 && y >= petCY - 20 && y <= petCY + 20) {
      this._isDraggingPet = true;
      this._dragStartX = x;
      this._dragStartY = y;
      this._petDragOffX = petCX - x;
      this._petDragOffY = petCY - y;
      return;
    }

    var m = this._getTodoMetrics(w);

    // Tap on "今日修行" section title to open ChallengeScene
    if (!p.completedToday && !this._dayComplete) {
      if (y >= m.titleY && y <= m.titleY + 16 && x >= 18 && x <= w - 18) {
        if (this.sm.audio) this.sm.audio.playTap();
        this.sm.transitionTo(STATUS.CULTIVATION, { player: p });
        return;
      }
    }

    // Tap on todo items
    if (!p.completedToday && !this._dayComplete) {
      for (var i = 0; i < m.count; i++) {
        var iy = m.itemStart + i * m.itemH;
        if (x >= 18 && x <= w - 18 && y >= iy && y <= iy + m.itemH) {
          if (!this._todoDone[i]) {
            this._completeTodo(i);
          }
          return;
        }
      }

      // Tap "完成修行" button
      var doneCount = 0;
      for (var j = 0; j < m.count; j++) { if (this._todoDone[j]) doneCount++; }
      if (doneCount > 0) {
        var bx = w - 18 - 88;
        var by = m.progY - 1;
        if (x >= bx && x <= bx + 88 && y >= by && y <= by + m.progH + 6) {
          this._finishDay(p);
          return;
        }
      }
    }

    // Nav buttons
    for (var k = 0; k < this._buttons.length; k++) {
      var b = this._buttons[k];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        if (b.action === 'stats') {
          this._showStats = !this._showStats;
          return;
        }
        this._handleAction(b.action, p);
        return;
      }
    }
  }

  handleDrag(x, y) {
    if (!this._isDraggingPet) return;
    this._petX = x + this._petDragOffX;
    this._petY = y + this._petDragOffY;
    // clamp to screen bounds
    var w = this.sm.canvas.width;
    var h = this.sm.canvas.height;
    this._petX = Math.max(20, Math.min(w - 20, this._petX));
    this._petY = Math.max(20, Math.min(h - 20, this._petY));
  }

  handleDragEnd(x, y) {
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
    StorageManager.save(this.player);

    // floating stat text
    var m2 = this._getTodoMetrics(this.sm.canvas.width);
    var ftX = this.sm.canvas.width * 0.3;
    var ftY = m2.itemStart + i * m2.itemH;
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

    // pet encouragement
    this._pet.setState('happy');
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

    StorageManager.save(p);
    if (this.sm.audio) this.sm.audio.playReward();

    this._dayComplete = true;

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

  _handleAction(action, p) {
    switch (action) {
      case 'story':
        this.sm.transitionTo(STATUS.STORY, { player: p });
        break;
      case 'adventure':
        this.sm.transitionTo(STATUS.ADVENTURE, { player: p });
        break;
      case 'minigame':
        if (this.sm.audio) this.sm.audio.playTap();
        this.sm.transitionTo(STATUS.MINIGAME, { player: p });
        break;
      case 'history':
        this.sm.transitionTo(STATUS.HISTORY, { player: p });
        break;
    }
  }
}

import { STATUS, STAT_LABELS } from '../utils/constants.js';
import {
  C, drawBg, drawCard, roundRect, fs, drawInkBtn,
  drawMist, drawSparkle,
} from '../utils/color.js';
import { StorageManager } from '../systems/StorageManager.js';
import { ParticleSystem } from '../entities/Particle.js';

var CARD_SYMBOLS = [
  { char: '静', color: '#2C2C2C' },
  { char: '心', color: '#5B8C5A' },
  { char: '修', color: '#C23531' },
  { char: '行', color: '#6B9FB5' },
  { char: '悟', color: '#D4A04A' },
  { char: '道', color: '#9B7BB5' },
  { char: '禅', color: '#B58B6B' },
  { char: '真', color: '#8B8B8B' },
];

var GRID_COLS = 4;
var GRID_ROWS = 4;
var TOTAL_CARDS = GRID_COLS * GRID_ROWS;

export class MiniGameScene {
  constructor(sm) {
    this.sm = sm;
    this._cards = [];
    this._flipped = [];
    this._matched = [];
    this._blocked = false;
    this._blockTimer = 0;
    this._moves = 0;
    this._pairsFound = 0;
    this._pts = new ParticleSystem();
    this._timer = 0;
    this._gameOver = false;
    this._rewardGiven = false;
    this._showResult = false;
    this._resultTimer = 0;
  }

  onEnter(data) {
    this.player = data.player;
    this._timer = 0;
    this._gameOver = false;
    this._rewardGiven = false;
    this._showResult = false;
    this._resultTimer = 0;
    this._flipped = [];
    this._matched = [];
    this._blocked = false;
    this._blockTimer = 0;
    this._moves = 0;
    this._pairsFound = 0;
    this._pts = new ParticleSystem();
    this._initCards();
  }

  _initCards() {
    this._cards = [];
    var pairs = [];
    for (var i = 0; i < TOTAL_CARDS / 2; i++) {
      pairs.push(CARD_SYMBOLS[i % CARD_SYMBOLS.length]);
      pairs.push(CARD_SYMBOLS[i % CARD_SYMBOLS.length]);
    }
    for (var j = pairs.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = pairs[j];
      pairs[j] = pairs[k];
      pairs[k] = tmp;
    }
    for (var s = 0; s < pairs.length; s++) {
      this._cards.push({
        symbol: pairs[s],
        flipped: false,
        matched: false,
        x: 0, y: 0, w: 0, h: 0,
      });
    }
  }

  update(dt) {
    this._timer += dt;
    this._pts.update();
    if (this._showResult) {
      this._resultTimer -= dt;
    }
    if (this._blocked && this._flipped.length === 2) {
      this._blockTimer -= dt;
      if (this._blockTimer <= 0) {
        this._cards[this._flipped[0]].flipped = false;
        this._cards[this._flipped[1]].flipped = false;
        this._flipped = [];
        this._blocked = false;
        if (this.sm.audio) this.sm.audio.playCardFail();
      }
    }
  }

  render(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    drawBg(ctx, w, h);
    drawMist(ctx, w, h, this._timer * 0.2);
    drawSparkle(ctx, w * 0.1, 20, 3, this._timer * 1.3);
    drawSparkle(ctx, w * 0.9, 30, 4, this._timer * 1.7 + 1);

    ctx.save();
    ctx.globalAlpha = 0.92;
    drawCard(ctx, 8, 6, w - 16, h - 12, 12);
    ctx.restore();

    ctx.fillStyle = C.ink;
    ctx.font = 'bold ' + fs(w, 18) + 'px "SimSun", "KaiTi", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('水墨翻牌', w / 2, 14);

    ctx.fillStyle = C.inkMuted;
    ctx.font = fs(w, 11) + 'px sans-serif';
    ctx.fillText('翻牌配对  |  步数: ' + this._moves + '  |  已配对: ' + this._pairsFound + '/' + (TOTAL_CARDS / 2), w / 2, 38);

    this._drawGrid(ctx, w);
    this._pts.draw(ctx);

    if (this._gameOver && !this._showResult) {
      this._showResult = true;
      this._resultTimer = 1.5;
      this._giveReward();
    }

    if (this._showResult) {
      ctx.save();
      ctx.fillStyle = 'rgba(44,44,44,0.5)';
      ctx.fillRect(0, 0, w, h);

      var rw = Math.min(280, w - 40);
      var rh = 160;
      var rx = (w - rw) / 2;
      var ry = (h - rh) / 2;
      drawCard(ctx, rx, ry, rw, rh, 14);

      ctx.fillStyle = C.gold;
      ctx.font = 'bold ' + fs(w, 22) + 'px "SimSun", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('翻牌圆满', w / 2, ry + 16);

      ctx.fillStyle = C.inkLight;
      ctx.font = fs(w, 13) + 'px "SimSun", "KaiTi", serif';
      ctx.fillText('步数: ' + this._moves + '  |  修为 +' + this._rewardExp, w / 2, ry + 50);

      ctx.fillStyle = C.jade;
      ctx.font = fs(w, 12) + 'px "SimSun", "KaiTi", serif';
      ctx.fillText('顿悟 +2  ·  心境 +1', w / 2, ry + 76);

      ctx.fillStyle = C.inkMuted;
      ctx.font = fs(w, 11) + 'px sans-serif';

      if (this._resultTimer <= 0) {
        drawInkBtn(ctx, (w - 120) / 2, ry + rh - 50, 120, 36, '返回江湖', C.red);
      } else {
        ctx.fillText('即将返回...', w / 2, ry + rh - 40);
      }
      ctx.restore();
    }

    drawInkBtn(ctx, (w - 80) / 2, h - 46, 80, 32, '退出', C.inkMuted);
  }

  _drawGrid(ctx, w) {
    var padX = 20;
    var padY = 58;
    var areaW = w - padX * 2;
    var areaH = Math.min(this.sm.canvas.height - padY - 60, areaW * 1.2);
    var cellGap = 6;
    var cellW = (areaW - cellGap * (GRID_COLS - 1)) / GRID_COLS;
    var cellH = (areaH - cellGap * (GRID_ROWS - 1)) / GRID_ROWS;
    var cardSize = Math.min(cellW, cellH);
    var totalW = GRID_COLS * cardSize + (GRID_COLS - 1) * cellGap;
    var totalH = GRID_ROWS * cardSize + (GRID_ROWS - 1) * cellGap;
    var ox = padX + (areaW - totalW) / 2;
    var oy = padY + (areaH - totalH) / 2;

    for (var i = 0; i < this._cards.length; i++) {
      var col = i % GRID_COLS;
      var row = Math.floor(i / GRID_COLS);
      var cx = ox + col * (cardSize + cellGap);
      var cy = oy + row * (cardSize + cellGap);
      var card = this._cards[i];
      card.x = cx;
      card.y = cy;
      card.w = cardSize;
      card.h = cardSize;

      this._drawCard(ctx, card, cx, cy, cardSize);
    }
  }

  _drawCard(ctx, card, x, y, s) {
    var isFlipped = card.flipped || card.matched;
    ctx.save();

    ctx.shadowColor = C.shadow;
    ctx.shadowBlur = isFlipped ? 6 : 3;
    ctx.shadowOffsetY = 1;

    roundRect(ctx, x, y, s, s, 6);
    if (card.matched) {
      ctx.fillStyle = 'rgba(92,140,90,0.15)';
    } else if (isFlipped) {
      ctx.fillStyle = C.white;
    } else {
      var g = ctx.createLinearGradient(x, y, x, y + s);
      g.addColorStop(0, C.red);
      g.addColorStop(1, C.redDark);
      ctx.fillStyle = g;
    }
    ctx.fill();
    ctx.shadowBlur = 0;

    if (isFlipped) {
      ctx.strokeStyle = card.matched ? C.jade : C.inkMuted;
      ctx.lineWidth = card.matched ? 2 : 0.5;
      roundRect(ctx, x + 1, y + 1, s - 2, s - 2, 5);
      ctx.stroke();

      ctx.fillStyle = card.symbol.color;
      ctx.font = 'bold ' + fs(ctx.canvas.width, Math.min(s * 0.5, 40)) + 'px "SimSun", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.symbol.char, x + s / 2, y + s / 2);

      if (card.matched) {
        ctx.fillStyle = C.jade;
        ctx.font = fs(ctx.canvas.width, 10) + 'px sans-serif';
        ctx.textBaseline = 'bottom';
        ctx.fillText('✓', x + s - 6, y + s - 4);
      }
    } else {
      ctx.strokeStyle = C.goldLight;
      ctx.lineWidth = 0.8;
      roundRect(ctx, x + 1, y + 1, s - 2, s - 2, 5);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,248,0.3)';
      ctx.font = 'bold ' + fs(ctx.canvas.width, Math.min(s * 0.3, 24)) + 'px "SimSun", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('武', x + s / 2, y + s / 2);
    }

    ctx.restore();
  }

  _giveReward() {
    if (this._rewardGiven) return;
    this._rewardGiven = true;
    var bonus = Math.max(5, 15 - this._moves);
    this._rewardExp = bonus;
    this.player.exp += bonus;
    this.player.stats.dunwu = (this.player.stats.dunwu || 1) + 2;
    this.player.stats.xinjing = (this.player.stats.xinjing || 1) + 1;
    StorageManager.save(this.player);
  }

  handleTap(x, y) {
    var w = this.sm.canvas.width;
    var h = this.sm.canvas.height;

    if (this._showResult) {
      if (this._resultTimer <= 0) {
        var rh = 160;
        var ry = (h - rh) / 2;
        var bx1 = (w - 120) / 2;
        var by1 = ry + rh - 50;
        if (x >= bx1 && x <= bx1 + 120 && y >= by1 && y <= by1 + 36) {
          if (this.sm.audio) this.sm.audio.playTap();
          this.sm.transitionTo(STATUS.HOME, { player: this.player });
        }
      }
      return;
    }

    if (x >= (w - 80) / 2 && x <= (w - 80) / 2 + 80 && y >= h - 46 && y <= h - 14) {
      if (this.sm.audio) this.sm.audio.playTap();
      this.sm.transitionTo(STATUS.HOME, { player: this.player });
      return;
    }

    if (this._blocked || this._gameOver) return;

    for (var i = 0; i < this._cards.length; i++) {
      var c = this._cards[i];
      if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) {
        if (c.flipped || c.matched) return;
        if (this._flipped.length >= 2) return;

        c.flipped = true;
        this._flipped.push(i);
        if (this.sm.audio) this.sm.audio.playCardFlip();

        if (this._flipped.length === 2) {
          this._moves++;
          var a = this._cards[this._flipped[0]];
          var b = this._cards[this._flipped[1]];
          if (a.symbol === b.symbol) {
            a.matched = true;
            b.matched = true;
            this._pairsFound++;
            this._flipped = [];
            if (this.sm.audio) this.sm.audio.playCardMatch();
            this._pts.emitGoldSplash(a.x + a.w / 2, a.y + a.h / 2);
            this._pts.emitGoldSplash(b.x + b.w / 2, b.y + b.h / 2);
            if (this._pairsFound >= TOTAL_CARDS / 2) {
              this._gameOver = true;
              if (this.sm.audio) this.sm.audio.playReward();
            }
          } else {
            this._blocked = true;
            this._blockTimer = 0.6;
          }
        }
        return;
      }
    }
  }
}

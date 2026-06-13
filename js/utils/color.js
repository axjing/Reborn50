export var C = {
  ink: '#2C2C2C',
  inkLight: '#5A5A5A',
  inkMuted: '#999999',
  paper: '#F5F0E8',
  paperDark: '#E8E0D0',
  paperLight: '#FAF6EE',
  red: '#C23531',
  redDark: '#8B1A1A',
  redLight: '#E85A4A',
  gold: '#D4A04A',
  goldLight: '#E8C87A',
  goldDark: '#A07830',
  jade: '#5B8C5A',
  jadeLight: '#7BA87B',
  jadeDark: '#3D6B3C',
  sky: '#6B9FB5',
  skyLight: '#8BBDD5',
  earth: '#B58B6B',
  earthLight: '#D4B08C',
  purple: '#9B7BB5',
  purpleLight: '#B89BD4',
  shadow: 'rgba(44,44,44,0.1)',
  shadowHeavy: 'rgba(44,44,44,0.25)',
  white: '#FFFEF8',

  // Guofeng palette
  qingDai: '#1B3B6F',
  shiQing: '#4A7F9E',
  zhuSha: '#CC3333',
  yanZhi: '#B24A6E',
  zheShi: '#8B6F4E',
  moLv: '#2D5A3D',
  xuanZhi: '#F5F0E8',
  moHui: '#6B6B6B',
  cangBi: '#3B6B5E',
  shuiMo: '#D8D0C0',
  jinCha: '#C89B3C',
  daiMei: '#4A6B8B',
  luoFu: '#D4896E',
  yaQing: '#6B8B8B',
};

export function fs(cw, px) {
  return Math.max(px, Math.round(px * (cw / 375)));
}

export function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r || 0, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, 1.5 * Math.PI, 0);
  ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + w - r, y + h - r, r, 0, 0.5 * Math.PI);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + h - r, r, 0.5 * Math.PI, Math.PI);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 1.5 * Math.PI);
  ctx.closePath();
}

export function drawBg(ctx, w, h) {
  var g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#F0E8D8');
  g.addColorStop(0.3, '#F5F0E8');
  g.addColorStop(0.7, '#E8E0D0');
  g.addColorStop(1, '#DDD5C5');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  for (var i = 0; i < 3; i++) {
    var cx = Math.random() * w;
    var cy = 10 + Math.random() * h * 0.4;
    var r = 40 + Math.random() * 80;
    ctx.fillStyle = 'rgba(194,53,49,0.015)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawCard(ctx, x, y, w, h, r, noShadow) {
  r = r || 10;
  ctx.save();
  if (!noShadow) {
    ctx.shadowColor = C.shadow;
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
  }
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = C.white;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = C.inkMuted;
  ctx.lineWidth = 0.5;
  roundRect(ctx, x + 1, y + 1, w - 2, h - 2, r - 1);
  ctx.stroke();
  ctx.restore();
}

export function drawInkBtn(ctx, x, y, w, h, text, accent) {
  var c = accent || C.red;
  ctx.save();
  ctx.shadowColor = C.shadow;
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 1;
  roundRect(ctx, x, y, w, h, 8);
  var g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, c);
  g.addColorStop(1, darken(c, 0.2));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = C.goldLight;
  ctx.lineWidth = 1;
  roundRect(ctx, x + 1.5, y + 1.5, w - 3, h - 3, 7);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold ' + Math.min(fs(ctx.canvas.width, 15), h - 8) + 'px "SimSun", "KaiTi", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  ctx.restore();
}

function darken(c, f) {
  var r = parseInt(c.slice(1, 3), 16);
  var g = parseInt(c.slice(3, 5), 16);
  var b = parseInt(c.slice(5, 7), 16);
  r = Math.max(0, Math.floor(r * (1 - f)));
  g = Math.max(0, Math.floor(g * (1 - f)));
  b = Math.max(0, Math.floor(b * (1 - f)));
  return '#' + [r, g, b].map(function(v) { return v.toString(16).padStart(2, '0'); }).join('');
}

export function drawMountain(ctx, w, h, t) {
  t = t || 0;
  ctx.save();
  for (var i = 0; i < 5; i++) {
    var mi = (i + t * 0.05) % 5;
    var mx = w * 0.1 + i * w * 0.2;
    var mh = 60 + (i % 3) * 40 + Math.sin(t + i * 1.5) * 10;
    var mw = 80 + (i % 2) * 40;

    ctx.fillStyle = 'rgba(100,100,100,' + (0.04 + i * 0.015) + ')';
    ctx.beginPath();
    ctx.moveTo(mx - mw, h - 20);
    ctx.quadraticCurveTo(mx, h - 20 - mh, mx + mw, h - 20);
    ctx.fill();
  }
  ctx.restore();
}

export function drawMist(ctx, w, h, t) {
  t = t || 0;
  ctx.save();
  ctx.globalAlpha = 0.06;
  for (var i = 0; i < 3; i++) {
    var bx = (w * 0.3 + Math.sin(t + i * 2) * w * 0.2 + i * w * 0.2) % (w + 100) - 50;
    var by = h * 0.5 + Math.sin(t * 0.5 + i) * 20;
    ctx.fillStyle = '#fff';
    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(1, 0.3);
    ctx.beginPath();
    ctx.arc(0, 0, 60 + i * 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

export function drawSparkle(ctx, x, y, r, t) {
  t = t || 0;
  ctx.save();
  ctx.translate(x, y + Math.sin(t) * 2);
  ctx.fillStyle = 'rgba(212,160,74,' + (0.25 + Math.sin(t) * 0.2) + ')';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,248,0.5)';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawStars(ctx, w, h, t, count) {
  count = count || 12;
  ctx.save();
  for (var i = 0; i < count; i++) {
    var sx = ((i * 137 + 50) % w);
    var sy = ((i * 97 + 20) % Math.floor(h * 0.4));
    var sr = 0.5 + (i % 3) * 0.3;
    var sa = 0.3 + Math.sin(t + i * 1.7) * 0.3;
    ctx.fillStyle = 'rgba(255,248,230,' + sa + ')';
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawTree(ctx, x, y, s, t) {
  s = s || 1;
  t = t || 0;
  ctx.save();
  ctx.fillStyle = 'rgba(80,70,60,' + (0.08 + Math.sin(t * 0.5) * 0.02) + ')';
  ctx.fillRect(x - 2 * s, y - 20 * s, 4 * s, 20 * s);
  ctx.beginPath();
  ctx.arc(x, y - 28 * s, 16 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - 12 * s, y - 22 * s, 12 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 12 * s, y - 22 * s, 12 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - 6 * s, y - 36 * s, 10 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 6 * s, y - 36 * s, 10 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawMoon(ctx, w, t) {
  t = t || 0;
  ctx.save();
  var mx = w * 0.8 + Math.sin(t * 0.1) * 10;
  var my = 40 + Math.sin(t * 0.15) * 5;
  ctx.fillStyle = 'rgba(255,248,230,0.6)';
  ctx.beginPath();
  ctx.arc(mx, my, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,248,230,0.3)';
  ctx.beginPath();
  ctx.arc(mx + 4, my - 3, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.paper;
  ctx.beginPath();
  ctx.arc(mx + 8, my - 5, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawFallingLeaves(ctx, w, h, t, count) {
  count = count || 3;
  ctx.save();
  for (var i = 0; i < count; i++) {
    var lx = ((i * 97 + t * 30 * (0.5 + i * 0.2)) % (w + 40)) - 20;
    var ly = ((i * 53 + t * 20 * (0.3 + i * 0.15)) % h);
    var ls = 0.5 + (i % 3) * 0.3;
    ctx.fillStyle = 'rgba(139,107,85,' + (0.1 + Math.sin(t + i) * 0.05) + ')';
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(Math.sin(t + i) * 0.5);
    ctx.scale(1, 0.5);
    ctx.beginPath();
    ctx.arc(0, 0, 3 * ls, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// ---- Guofeng Phase 1 additions ----

export function drawPaperTexture(ctx, x, y, w, h, alpha) {
  alpha = alpha || 0.03;
  ctx.save();
  ctx.globalAlpha = alpha;
  var seed = 1;
  for (var i = 0; i < 60; i++) {
    seed = (seed * 16807) % 2147483647;
    var px = x + (seed % w);
    seed = (seed * 16807) % 2147483647;
    var py = y + (seed % h);
    seed = (seed * 16807) % 2147483647;
    var pr = 0.5 + (seed % 3);
    ctx.fillStyle = (seed % 2) ? '#8B7B6B' : '#A09080';
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawInkWash(ctx, x, y, w, h, color, density) {
  density = density || 0.12;
  ctx.save();
  ctx.globalAlpha = density;
  var cx = x + w / 2;
  var cy = y + h / 2;
  var rMax = Math.max(w, h) * 0.7;
  var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rMax);
  g.addColorStop(0, color);
  g.addColorStop(0.4, color);
  g.addColorStop(0.7, color);
  g.addColorStop(0.85, color);
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, rMax, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = density * 0.5;
  var spots = 5;
  for (var i = 0; i < spots; i++) {
    var sx = x + w * (0.2 + (i * 0.15) % 0.6);
    var sy = y + h * (0.2 + (i * 0.12) % 0.6);
    var sr = rMax * (0.15 + (i % 3) * 0.08);
    var sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    sg.addColorStop(0, color);
    sg.addColorStop(1, 'transparent');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawPaperCard(ctx, x, y, w, h, r, options) {
  options = options || {};
  r = r || 10;
  var shadow = options.noShadow ? 0 : (options.shadowBlur || 10);
  var noBorder = options.noBorder || false;
  var accentColor = options.accent || null;
  var accentSide = options.accentSide || 'left';
  var innerGlow = options.innerGlow || false;

  ctx.save();
  if (shadow > 0) {
    ctx.shadowColor = C.shadow;
    ctx.shadowBlur = shadow;
    ctx.shadowOffsetY = 2;
  }
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = options.bgColor || C.white;
  ctx.fill();
  ctx.restore();

  drawPaperTexture(ctx, x, y, w, h, 0.025);

  if (accentColor) {
    ctx.save();
    var ax = (accentSide === 'left') ? x + 3 : x + w - 6;
    var ay = y + 8;
    var aw = 3;
    var ah = h - 16;
    var g = ctx.createLinearGradient(ax, ay, ax, ay + ah);
    g.addColorStop(0, accentColor);
    g.addColorStop(0.5, C.goldLight);
    g.addColorStop(1, accentColor);
    ctx.fillStyle = g;
    roundRect(ctx, ax, ay, aw, ah, 1.5);
    ctx.fill();
    ctx.restore();
  }

  if (!noBorder) {
    ctx.save();
    ctx.strokeStyle = options.borderColor || C.inkMuted;
    ctx.lineWidth = 0.5;
    roundRect(ctx, x + 1, y + 1, w - 2, h - 2, r - 1);
    ctx.stroke();
    ctx.restore();
  }

  if (innerGlow) {
    ctx.save();
    var ig = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h) * 0.5);
    ig.addColorStop(0, 'rgba(255,248,230,0.15)');
    ig.addColorStop(1, 'transparent');
    ctx.fillStyle = ig;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
}

export function drawGuofengBtn(ctx, x, y, w, h, text, options) {
  options = options || {};
  var bgColor = options.bgColor || C.zhuSha;
  var textColor = options.textColor || C.white;
  var borderColor = options.borderColor || C.goldLight;
  var fontSize = options.fontSize || 16;
  var r = options.r || 6;
  var doubleBorder = options.doubleBorder !== false;
  var hasCornerDecor = options.cornerDecor || false;

  ctx.save();
  ctx.shadowColor = C.shadowHeavy;
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;

  roundRect(ctx, x, y, w, h, r);
  var g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, bgColor);
  g.addColorStop(0.4, lighten(bgColor, 0.15));
  g.addColorStop(1, bgColor);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  roundRect(ctx, x + 2, y + 2, w - 4, h - 4, r - 1);
  ctx.stroke();
  ctx.restore();

  if (doubleBorder) {
    ctx.save();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.5;
    roundRect(ctx, x + 5, y + 5, w - 10, h - 10, Math.max(r - 3, 1));
    ctx.stroke();
    ctx.restore();
  }

  if (hasCornerDecor) {
    ctx.save();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    var cd = 10;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(x + cd, y + 4);
    ctx.lineTo(x + 4, y + 4);
    ctx.lineTo(x + 4, y + cd);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + w - cd, y + 4);
    ctx.lineTo(x + w - 4, y + 4);
    ctx.lineTo(x + w - 4, y + cd);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x + cd, y + h - 4);
    ctx.lineTo(x + 4, y + h - 4);
    ctx.lineTo(x + 4, y + h - cd);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + w - cd, y + h - 4);
    ctx.lineTo(x + w - 4, y + h - 4);
    ctx.lineTo(x + w - 4, y + h - cd);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = textColor;
  var fSize = fs(ctx.canvas.width, fontSize);
  ctx.font = 'bold ' + fSize + 'px "SimSun", "KaiTi", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 1;
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  ctx.restore();
}

export function drawSeal(ctx, x, y, size, text, color) {
  color = color || C.zhuSha;
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;

  var s = size * 0.12;
  roundRect(ctx, x - size / 2, y - size / 2, size, size, s);
  ctx.fill();

  ctx.fillStyle = C.xuanZhi;
  ctx.globalAlpha = 1;
  var fn = Math.min(fs(ctx.canvas.width, Math.round(size * 0.5)), size - 6);
  ctx.font = fn + 'px "SimSun", "KaiTi", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text || '印', x, y + 1);

  ctx.restore();
}

function lighten(c, f) {
  var r = parseInt(c.slice(1, 3), 16);
  var g = parseInt(c.slice(3, 5), 16);
  var b = parseInt(c.slice(5, 7), 16);
  r = Math.min(255, Math.floor(r + (255 - r) * f));
  g = Math.min(255, Math.floor(g + (255 - g) * f));
  b = Math.min(255, Math.floor(b + (255 - b) * f));
  return '#' + [r, g, b].map(function(v) { return v.toString(16).padStart(2, '0'); }).join('');
}

export function drawGuofengIcon(ctx, x, y, size, type, t) {
  t = t || 0;
  ctx.save();
  switch (type) {
    case 'sun':
      ctx.fillStyle = C.zhuSha;
      ctx.globalAlpha = 0.6 + Math.sin(t) * 0.1;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.goldLight;
      ctx.globalAlpha = 0.4;
      var rays = 8;
      for (var ri = 0; ri < rays; ri++) {
        var ra = (ri / rays) * Math.PI * 2 + t * 0.2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(ra) * size, y + Math.sin(ra) * size);
        ctx.lineTo(x + Math.cos(ra + 0.1) * size * 0.6, y + Math.sin(ra + 0.1) * size * 0.6);
        ctx.fill();
      }
      break;
    case 'moon':
      ctx.fillStyle = C.goldLight;
      ctx.globalAlpha = 0.5 + Math.sin(t) * 0.1;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = C.xuanZhi;
      ctx.beginPath();
      ctx.arc(x + size * 0.06, y - size * 0.04, size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'cloud':
      ctx.fillStyle = C.shiQing;
      ctx.globalAlpha = 0.15 + Math.sin(t) * 0.05;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, 0.5);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
      ctx.arc(-size * 0.14, -size * 0.05, size * 0.16, 0, Math.PI * 2);
      ctx.arc(size * 0.14, -size * 0.05, size * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    case 'mountain':
      ctx.fillStyle = C.moLv;
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.moveTo(x - size * 0.3, y + size * 0.2);
      ctx.quadraticCurveTo(x - size * 0.1, y - size * 0.2, x, y - size * 0.1);
      ctx.quadraticCurveTo(x + size * 0.1, y - size * 0.25, x + size * 0.3, y + size * 0.2);
      ctx.fill();
      break;
  }
  ctx.restore();
}

export function drawCalligraphy(ctx, text, x, y, maxW, options) {
  options = options || {};
  var size = options.size || 20;
  var color = options.color || C.ink;
  var bold = options.bold !== false;

  ctx.save();
  ctx.fillStyle = color;
  ctx.font = (bold ? 'bold ' : '') + fs(ctx.canvas.width, size) + 'px ' + getFontFamily();
  ctx.textAlign = options.align || 'left';
  ctx.textBaseline = options.baseline || 'top';

  // Simulated brush texture: slight shadow offset
  if (options.brushEffect !== false) {
    ctx.shadowColor = 'rgba(44,44,44,0.12)';
    ctx.shadowBlur = 1.5;
    ctx.shadowOffsetX = 0.5;
    ctx.shadowOffsetY = 0.5;
  }

  ctx.fillText(text, x, y);

  // Decorative underline (like brush stroke)
  if (options.underline) {
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    var tw = ctx.measureText ? ctx.measureText(text).width : maxW || 80;
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    var uy = y + fs(ctx.canvas.width, size) * 1.1;
    ctx.moveTo(x, uy);
    ctx.quadraticCurveTo(x + tw * 0.3, uy + 2, x + tw * 0.6, uy + 1);
    ctx.quadraticCurveTo(x + tw * 0.8, uy + 3, x + tw, uy);
    ctx.stroke();
  }

  ctx.restore();
}

function getFontFamily() {
  try {
    var f = wx.getStorageSync('__font_family__');
    if (f) return f;
  } catch (e) { /* ignore */ }
  return '"SimSun", "KaiTi", serif';
}

export function drawGuofengToast(ctx, w, h, text, alpha) {
  alpha = Math.min(1, alpha || 1);
  if (alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  var tw = Math.min(240, w - 60);
  var tx = (w - tw) / 2;
  var ty = h * 0.26;
  var th = 34;

  // Background pill with guofeng border
  drawPaperCard(ctx, tx, ty, tw, th, th / 2, {
    bgColor: 'rgba(44,44,44,0.82)',
    noBorder: false,
    borderColor: C.goldLight,
    shadowBlur: 10,
    noShadow: false,
  });

  // Decorative side lines
  ctx.strokeStyle = C.goldLight;
  ctx.globalAlpha = alpha * 0.5;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(tx + 8, ty + 4);
  ctx.lineTo(tx + 8, ty + th - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tx + tw - 8, ty + 4);
  ctx.lineTo(tx + tw - 8, ty + th - 4);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold ' + fs(ctx.canvas.width, 12) + 'px ' + getFontFamily();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 2;
  ctx.fillText(text, w / 2, ty + th / 2);
  ctx.restore();
}

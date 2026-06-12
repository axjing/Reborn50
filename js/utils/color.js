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

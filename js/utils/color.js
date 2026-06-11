export var C = {
  bg: '#F5ECD7',
  bgDark: '#E8DCC4',
  red: '#C23531',
  redDark: '#8B1A1A',
  redLight: '#E85A4A',
  gold: '#D4A04A',
  goldLight: '#E8C87A',
  goldDark: '#A07830',
  ink: '#2C2C2C',
  inkLight: '#5A5A5A',
  inkMuted: '#888888',
  jade: '#2E8B57',
  jadeLight: '#4CAF6E',
  white: '#FFF8EE',
  cream: '#F5ECD7',
  shadow: 'rgba(44,44,44,0.12)',
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
  g.addColorStop(0, '#F0E4CC');
  g.addColorStop(0.5, C.cream);
  g.addColorStop(1, C.bgDark);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  for (var i = 0; i < 6; i++) {
    var cx = Math.random() * w;
    var cy = 20 + Math.random() * h * 0.3;
    var r = 30 + Math.random() * 50;
    ctx.fillStyle = 'rgba(194,53,49,0.02)';
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
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
  }
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = C.white;
  ctx.fill();
  ctx.restore();
  ctx.save();

  ctx.strokeStyle = C.red;
  ctx.lineWidth = 1.5;
  roundRect(ctx, x + 2, y + 2, w - 4, h - 4, r - 1);
  ctx.stroke();

  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 1;
  roundRect(ctx, x + 5, y + 5, w - 10, h - 10, r - 3);
  ctx.stroke();

  ctx.strokeStyle = C.goldLight;
  ctx.lineWidth = 0.5;
  roundRect(ctx, x + 8, y + 8, w - 16, h - 16, r - 5);
  ctx.stroke();

  var cl = 10;
  ctx.fillStyle = C.gold;
  ctx.fillRect(x + r + 10, y - 1, cl, 4);
  ctx.fillRect(x + w - r - 10 - cl, y - 1, cl, 4);
  ctx.fillRect(x + r + 10, y + h - 3, cl, 4);
  ctx.fillRect(x + w - r - 10 - cl, y + h - 3, cl, 4);

  ctx.fillStyle = C.red;
  ctx.fillRect(x - 1, y + r + 10, 4, cl);
  ctx.fillRect(x - 1, y + h - r - 10 - cl, 4, cl);
  ctx.fillRect(x + w - 3, y + r + 10, 4, cl);
  ctx.fillRect(x + w - 3, y + h - r - 10 - cl, 4, cl);

  ctx.restore();
}

export function drawBtn(ctx, x, y, w, h, text, color) {
  var c = color || C.red;
  ctx.save();
  ctx.shadowColor = C.shadow;
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  roundRect(ctx, x, y, w, h, 10);
  var g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, c);
  g.addColorStop(1, C.redDark);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 1.5;
  roundRect(ctx, x + 2, y + 2, w - 4, h - 4, 8);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold ' + Math.min(fs(ctx.canvas.width, 16), h - 8) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  ctx.restore();
}

export function drawChar(ctx, cx, cy, s, bob) {
  s = s || 1;
  bob = bob || 0;
  var by = Math.sin(bob) * 3 * s;
  ctx.save();
  ctx.translate(cx, cy + by);

  ctx.shadowColor = C.shadow;
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;

  ctx.beginPath();
  ctx.arc(0, -16 * s, 16 * s, 0, Math.PI * 2);
  ctx.fillStyle = '#FFE0C0';
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.arc(-5 * s, -20 * s, 3.2 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5 * s, -20 * s, 3.2 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-5 * s, -20.5 * s, 1.6 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5 * s, -20.5 * s, 1.6 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = C.inkLight;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -13 * s, 3.5 * s, 0.1, Math.PI - 0.1);
  ctx.stroke();

  ctx.fillStyle = C.redLight;
  ctx.beginPath();
  ctx.arc(-8 * s, -16 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8 * s, -16 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = C.red;
  roundRect(ctx, -14 * s, 2 * s, 28 * s, 20 * s, 5 * s);
  ctx.fill();
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 1;
  roundRect(ctx, -14 * s, 2 * s, 28 * s, 20 * s, 5 * s);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold ' + Math.floor(11 * s) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('勇', 0, 12 * s);

  ctx.fillStyle = C.ink;
  roundRect(ctx, -16 * s, 16 * s, 7 * s, 12 * s, 3 * s);
  ctx.fill();
  roundRect(ctx, 9 * s, 16 * s, 7 * s, 12 * s, 3 * s);
  ctx.fill();
  roundRect(ctx, -10 * s, 24 * s, 8 * s, 12 * s, 3 * s);
  ctx.fill();
  roundRect(ctx, 2 * s, 24 * s, 8 * s, 12 * s, 3 * s);
  ctx.fill();

  ctx.restore();
}

export function drawCloud(ctx, x, y, s) {
  s = s || 1;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,248,0.15)';
  ctx.beginPath();
  ctx.arc(x, y, 12 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 14 * s, y - 4 * s, 10 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 28 * s, y, 12 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 14 * s, y + 2 * s, 10 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawSparkle(ctx, x, y, r, bob) {
  bob = bob || 0;
  ctx.save();
  ctx.translate(x, y + Math.sin(bob) * 2);
  ctx.fillStyle = 'rgba(212,160,74,' + (0.3 + Math.sin(bob) * 0.2) + ')';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,248,0.6)';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

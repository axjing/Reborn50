import { C, roundRect, fs, drawCard } from '../utils/color.js';

var LABELS = {
  wil: '意志', spi: '灵力', str: '力量',
  int: '智慧', skl: '技巧', vit: '活力', mnd: '心境',
};

export class StatsPanel {
  constructor() {
    this.visible = false;
  }

  draw(ctx, player) {
    if (!this.visible) return;
    var cw = ctx.canvas.width;
    var ch = ctx.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(60,45,30,0.5)';
    ctx.fillRect(0, 0, cw, ch);

    var pw = Math.min(300, cw - 40);
    var ph = Math.min(380, ch - 60);
    var px = (cw - pw) / 2;
    var py = (ch - ph) / 2;

    drawCard(ctx, px, py, pw, ph, 14);

    ctx.fillStyle = C.red;
    ctx.font = 'bold ' + fs(cw, 20) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('角色状态', cw / 2, py + 18);

    ctx.fillStyle = C.ink;
    ctx.font = fs(cw, 13) + 'px sans-serif';
    ctx.textAlign = 'left';
    var ly = py + 54;
    ctx.fillText('Lv.' + player.level + '  第 ' + player.day + ' 天', px + 24, ly); ly += 26;
    ctx.fillText('HP: ' + player.hp + '/' + player.maxHP, px + 24, ly); ly += 26;
    ctx.fillText('SP: ' + player.sp + '/' + player.maxSP, px + 24, ly); ly += 26;
    ctx.fillText('连击: ' + player.streak + ' 天', px + 24, ly); ly += 26;
    ctx.fillText('完成: ' + player.completedDays + '/50', px + 24, ly); ly += 30;

    var keys = Object.keys(LABELS);
    for (var i = 0; i < keys.length; i++) {
      ctx.fillStyle = C.ink;
      ctx.font = fs(cw, 12) + 'px sans-serif';
      ctx.fillText(LABELS[keys[i]] + ': ' + (player.stats[keys[i]] || 0), px + 24, ly);
      ly += 22;
    }

    ctx.fillStyle = C.inkMuted;
    ctx.font = fs(cw, 11) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('点击任意位置关闭', cw / 2, py + ph - 18);
    ctx.restore();
  }
}

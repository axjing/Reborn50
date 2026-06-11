import { randInt } from '../utils/random.js';

export class Monster {
  constructor(config) {
    this.name = config.name;
    this.maxHP = config.hp;
    this.hp = config.hp;
    this.str = config.str;
    this.skl = config.skl;
    this.sprite = config.sprite;
    this.quote = config.quote || '';
  }

  get attack() {
    return this.str;
  }

  takeDamage(dmg) {
    const actual = Math.max(1, dmg);
    this.hp = Math.max(0, this.hp - actual);
    return actual;
  }

  dealDamage() {
    const variance = randInt(-2, 2);
    return Math.max(1, this.attack + variance);
  }

  isAlive() {
    return this.hp > 0;
  }

  get hpPercent() {
    return this.hp / this.maxHP;
  }
}

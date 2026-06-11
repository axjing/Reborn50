export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function rollChance(percent) {
  return Math.random() < percent / 100;
}

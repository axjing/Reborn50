export const ITEMS = [
  { id: 'potion_hp', name: '活力药水', desc: '恢复 30 HP', type: 'consumable', effect: { vit: 30 } },
  { id: 'potion_sp', name: '灵力药剂', desc: '恢复 20 SP', type: 'consumable', effect: { spi: 20 } },
  { id: 'book_wil', name: '意志之书', desc: '提升 2 意志', type: 'permanent', effect: { wil: 2 } },
  { id: 'ring_str', name: '力量指环', desc: '力量 +3', type: 'equipment', effect: { str: 3 }, slot: 'ring' },
  { id: 'amulet_int', name: '智慧护符', desc: '智慧 +3', type: 'equipment', effect: { int: 3 }, slot: 'amulet' },
  { id: 'shield_skl', name: '技巧之盾', desc: '技巧 +3', type: 'equipment', effect: { skl: 3 }, slot: 'shield' },
];

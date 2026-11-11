// Ambiances de l'essai n°2 : on reprend celles de l'essai n°1 et on y ajoute
// ce que le gameplay demande (buissons, objets, monstres, icônes, vocabulaire).
import { THEMES as BASE, TILE_ROLES as BASE_ROLES, P, humanoid } from '../01-moteur/themes.js';
import { detailCount } from '../../engine/index.js';
import { humanoidHD, grassHD, pathHD, waterHD, bricksHD, treeHD, bushHD, chestHD, coinHD } from './hd.js';

export const TILE_ROLES = [
  ...BASE_ROLES,
  'bush',
  // grotte en pierres
  'cave_floor', 'cave_wall', 'cave_rock', 'cave_torch', 'cave_exit',
  // magasin (intérieur et façade)
  'shop_floor', 'shop_wall', 'shelf', 'counter', 'shop_door', 'awning', 'shopfront',
  // extérieurs propres à chaque ambiance : toit + bas de toit, porte du magasin, roche / entrée de grotte
  'roof_eave', 'shop_entrance', 'cliff', 'cave_mouth',
  // pont : cassé, puis réparé
  'bridge_broken', 'bridge',
];

// ------------------------------------------------------------ dessins génériques, colorés par thème
function heart(c, x, y, s, col, dark) {
  // cœur de 7x6 à l'échelle s
  const rows = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
  rows.forEach((row, j) => [...row].forEach((ch, i) => ch === '#' && P(c, x + i * s, y + j * s, s, s, j < 1 && i % 3 === 1 ? dark : col)));
}
function gem(c, x, y, col, light) {
  P(c, x + 2, y, 2, 1, light);
  P(c, x + 1, y + 1, 4, 1, col);
  P(c, x, y + 2, 6, 3, col);
  P(c, x + 1, y + 2, 1, 2, light);
  P(c, x + 1, y + 5, 4, 1, col);
  P(c, x + 2, y + 6, 2, 1, col);
}
// Pièce d'euro : disque doré, bord foncé, reflet, et un petit « € ».
function euroCoin(c, x, y, d, p) {
  const r = d / 2;
  for (let j = 0; j < d; j++) {
    for (let i = 0; i < d; i++) {
      const dx = i + 0.5 - r;
      const dy = j + 0.5 - r;
      const dist = Math.hypot(dx, dy);
      if (dist > r) continue;
      P(c, x + i, y + j, 1, 1, dist > r - 1 ? p.coinDark : dx + dy < -r * 0.6 ? p.coinLight : p.coin);
    }
  }
  if (d >= 10) {
    const ex = x + Math.floor(r) - 2;
    const ey = y + Math.floor(r) - 3;
    P(c, ex + 1, ey, 3, 1, p.coinDark);
    P(c, ex, ey + 1, 1, 4, p.coinDark);
    P(c, ex + 1, ey + 5, 3, 1, p.coinDark);
    P(c, ex - 1, ey + 2, 4, 1, p.coinDark);
    P(c, ex - 1, ey + 3, 4, 1, p.coinDark);
  }
}

function key(c, x, y, col, s = 1) {
  P(c, x, y, 3 * s, 3 * s, col);
  P(c, x + s, y + s, s, s, 'rgba(0,0,0,.6)');
  P(c, x + 3 * s, y + s, 4 * s, s, col);
  P(c, x + 5 * s, y + 2 * s, s, s, col);
  P(c, x + 7 * s - s, y + 2 * s, s, s, col);
}

const OBJECT_FRAMES = [
  'chest', 'chest_open', 'block', 'plate', 'plate_down', 'gate', 'locked', 'lever_off', 'lever_on',
  'coin', 'key', 'amulet', 'mushroom', 'heart', 'sword_down', 'sword_up', 'sword_side', 'poof_0', 'poof_1',
  'blob_0', 'blob_1', 'flyer_0', 'flyer_1', 'flowers', 'ribbon', 'bouquet', 'potion', 'heart_container', 'planks', 'nails', 'tarte', 'hint', 'apple', 'cake', 'big_bag', 'pet_0', 'pet_1',
];

function objectsSheet(p) {
  return {
    frameW: 16,
    frameH: 16,
    frames: OBJECT_FRAMES,
    paint(c, name) {
      switch (name) {
        case 'chest':
        case 'chest_open': {
          P(c, 1, 14, 14, 2, 'rgba(0,0,0,.3)');
          P(c, 1, 5, 14, 10, p.chestDark);
          P(c, 2, 6, 12, 8, p.chest);
          P(c, 1, 8, 14, 1, p.chestDark);
          if (name === 'chest') {
            P(c, 1, 3, 14, 5, p.chestDark);
            P(c, 2, 4, 12, 3, p.chest);
            P(c, 7, 7, 2, 3, p.metal);
          } else {
            P(c, 1, 1, 14, 4, p.chestDark);
            P(c, 2, 2, 12, 2, p.chest);
            P(c, 3, 6, 10, 2, '#000');
          }
          return;
        }
        case 'block':
          P(c, 0, 0, 16, 16, p.blockDark);
          P(c, 0, 0, 15, 15, p.block);
          P(c, 0, 0, 15, 1, p.blockLight);
          P(c, 0, 0, 1, 15, p.blockLight);
          P(c, 4, 4, 7, 7, p.blockDark);
          P(c, 5, 5, 5, 5, p.block);
          return;
        case 'plate':
        case 'plate_down':
          P(c, 2, 2, 12, 12, p.plateDark);
          P(c, 3, 3, 10, 10, name === 'plate' ? p.plate : p.plateDark);
          if (name === 'plate') P(c, 3, 3, 10, 1, p.plateLight);
          P(c, 7, 7, 2, 2, name === 'plate' ? p.plateDark : p.plate);
          return;
        case 'gate':
          P(c, 0, 0, 16, 16, 'rgba(0,0,0,.55)');
          for (let x = 1; x < 16; x += 4) P(c, x, 0, 2, 16, p.metal);
          P(c, 0, 3, 16, 2, p.metalDark);
          P(c, 0, 11, 16, 2, p.metalDark);
          return;
        case 'locked':
          P(c, 0, 0, 16, 16, p.chestDark);
          P(c, 1, 1, 14, 14, p.chest);
          P(c, 7, 0, 2, 16, p.chestDark);
          P(c, 5, 5, 6, 6, p.metal);
          P(c, 7, 6, 2, 2, '#000');
          P(c, 7, 8, 2, 2, '#000');
          return;
        case 'lever_off':
        case 'lever_on': {
          P(c, 3, 11, 10, 4, p.metalDark);
          P(c, 4, 11, 8, 1, p.metal);
          const on = name === 'lever_on';
          for (let i = 0; i < 7; i++) P(c, on ? 8 + Math.floor(i / 2) : 8 - Math.floor(i / 2), 11 - i, 1, 1, p.metal);
          P(c, on ? 10 : 4, 3, 3, 3, on ? p.on : p.off);
          return;
        }
        case 'coin':
          euroCoin(c, 2, 2, 12, p);
          return;
        case 'key':
          key(c, 1, 5, p.key, 2);
          return;
        case 'amulet':
          for (let i = 0; i < 6; i++) P(c, 3 + i, 2 + Math.abs(i - 2.5) * 0.6, 1, 1, p.metal);
          P(c, 4, 5, 8, 8, p.metalDark);
          P(c, 5, 6, 6, 6, p.amulet);
          P(c, 6, 7, 2, 2, '#fff');
          return;
        case 'mushroom':
          P(c, 3, 4, 10, 5, p.mushCap);
          P(c, 4, 3, 8, 1, p.mushCap);
          P(c, 5, 5, 2, 2, '#fff');
          P(c, 9, 4, 2, 2, '#fff');
          P(c, 6, 9, 4, 4, p.mushStem);
          return;
        case 'heart':
          heart(c, 4, 4, 1, p.heart, p.heartLight);
          return;
        case 'sword_down':
          P(c, 7, 0, 2, 3, p.hilt);
          P(c, 5, 3, 6, 1, p.hilt);
          P(c, 7, 4, 2, 10, p.blade);
          P(c, 7, 4, 1, 10, '#fff');
          return;
        case 'sword_up':
          P(c, 7, 13, 2, 3, p.hilt);
          P(c, 5, 12, 6, 1, p.hilt);
          P(c, 7, 2, 2, 10, p.blade);
          P(c, 7, 2, 1, 10, '#fff');
          return;
        case 'sword_side':
          P(c, 0, 7, 3, 2, p.hilt);
          P(c, 3, 5, 1, 6, p.hilt);
          P(c, 4, 7, 11, 2, p.blade);
          P(c, 4, 7, 11, 1, '#fff');
          return;
        case 'poof_0':
          P(c, 5, 5, 6, 6, '#fff');
          P(c, 3, 7, 10, 2, '#ddd');
          P(c, 7, 3, 2, 10, '#ddd');
          return;
        case 'poof_1':
          for (const [x, y] of [[2, 2], [12, 2], [2, 12], [12, 12], [7, 1], [7, 13], [1, 7], [13, 7]]) P(c, x, y, 2, 2, '#ccc');
          return;
        case 'flowers':
        case 'bouquet': {
          for (const [x, y, col] of [[4, 2, p.flowerA], [9, 3, p.flowerB], [6, 6, p.flowerB], [11, 7, p.flowerA]]) {
            P(c, x, y, 3, 3, col);
            P(c, x + 1, y + 1, 1, 1, '#ffe066');
          }
          P(c, 7, 9, 2, 6, '#3a8a2a');
          P(c, 5, 10, 2, 4, '#3a8a2a');
          P(c, 9, 10, 2, 4, '#3a8a2a');
          if (name === 'bouquet') {
            P(c, 4, 10, 8, 2, p.ribbon);
            P(c, 3, 12, 2, 3, p.ribbon);
            P(c, 11, 12, 2, 3, p.ribbon);
          }
          return;
        }
        case 'ribbon':
          P(c, 2, 5, 5, 5, p.ribbon);
          P(c, 9, 5, 5, 5, p.ribbon);
          P(c, 6, 6, 4, 3, p.ribbonDark);
          P(c, 5, 9, 2, 5, p.ribbon);
          P(c, 9, 9, 2, 5, p.ribbon);
          return;
        case 'potion':
          P(c, 6, 1, 4, 2, '#8a5a2a');
          P(c, 6, 3, 4, 3, '#cfe8ff');
          P(c, 3, 6, 10, 8, '#cfe8ff');
          P(c, 4, 8, 8, 6, p.potion);
          P(c, 5, 8, 2, 2, '#fff');
          return;
        case 'heart_container':
          heart(c, 1, 2, 2, p.heart, p.heartLight);
          P(c, 4, 4, 2, 2, '#fff');
          return;
        case 'planks':
          for (let i = 0; i < 3; i++) {
            P(c, 1, 3 + i * 4, 14, 3, '#b07a40');
            P(c, 1, 3 + i * 4, 14, 1, '#d8a060');
            P(c, 3 + i * 3, 4 + i * 4, 1, 1, '#5a3a1c');
          }
          return;
        case 'nails':
          for (const x of [3, 7, 11]) {
            P(c, x - 1, 3, 3, 2, '#c8c8d0');
            P(c, x, 5, 1, 9, '#9a9aa8');
          }
          return;
        case 'tarte':
          P(c, 1, 8, 14, 5, '#c8803a');
          P(c, 2, 6, 12, 3, '#e8b060');
          P(c, 4, 7, 2, 1, '#8a4a2a');
          P(c, 9, 7, 2, 1, '#8a4a2a');
          P(c, 1, 12, 14, 1, '#8a5a2a');
          return;
        case 'pet_0':
        case 'pet_1':
          return paintPet(c, p.pet, name === 'pet_1');
        case 'apple':
          P(c, 7, 1, 2, 3, '#6a4220');
          P(c, 9, 2, 3, 2, '#3a8a2a');
          P(c, 3, 4, 10, 10, '#d8302a');
          P(c, 2, 6, 12, 6, '#d8302a');
          P(c, 4, 5, 2, 2, '#ff9a8a');
          return;
        case 'cake':
          P(c, 2, 8, 12, 6, '#e8c890');
          P(c, 2, 6, 12, 3, '#ff8ab0');
          P(c, 2, 11, 12, 1, '#ff8ab0');
          P(c, 7, 2, 2, 4, '#fff');
          P(c, 7, 1, 2, 1, '#ffb030');
          return;
        case 'big_bag':
          P(c, 5, 1, 6, 2, p.bagDark);
          P(c, 3, 2, 2, 3, p.bagDark);
          P(c, 11, 2, 2, 3, p.bagDark);
          P(c, 1, 5, 14, 10, p.bag);
          P(c, 1, 5, 14, 2, p.bagDark);
          P(c, 6, 8, 4, 3, p.bagDark);
          P(c, 7, 9, 2, 1, '#ffd35a');
          return;
        case 'hint':
          P(c, 4, 1, 8, 9, p.hint);
          P(c, 3, 3, 10, 5, p.hint);
          P(c, 6, 10, 4, 3, '#9a9aa8');
          P(c, 6, 13, 4, 1, '#6a6a78');
          P(c, 6, 3, 2, 2, '#fff');
          return;
        case 'blob_0':
        case 'blob_1': {
          const sq = name === 'blob_1' ? 1 : 0;
          P(c, 2, 15, 12, 1, 'rgba(0,0,0,.3)');
          P(c, 3 - sq, 7 + sq, 10 + 2 * sq, 8 - sq, p.blobDark);
          P(c, 4 - sq, 5 + sq, 8 + 2 * sq, 3, p.blob);
          P(c, 3 - sq, 8 + sq, 10 + 2 * sq, 6 - sq, p.blob);
          P(c, 5, 9, 2, 2, '#fff');
          P(c, 9, 9, 2, 2, '#fff');
          P(c, 6, 10, 1, 1, '#000');
          P(c, 10, 10, 1, 1, '#000');
          return;
        }
        case 'flyer_0':
        case 'flyer_1': {
          const up = name === 'flyer_0';
          P(c, 5, 6, 6, 5, p.flyer);
          P(c, 6, 7, 1, 1, p.eye);
          P(c, 9, 7, 1, 1, p.eye);
          if (up) {
            P(c, 1, 3, 4, 2, p.flyerWing);
            P(c, 11, 3, 4, 2, p.flyerWing);
            P(c, 3, 5, 2, 2, p.flyerWing);
            P(c, 11, 5, 2, 2, p.flyerWing);
          } else {
            P(c, 1, 9, 4, 2, p.flyerWing);
            P(c, 11, 9, 4, 2, p.flyerWing);
            P(c, 3, 8, 2, 2, p.flyerWing);
            P(c, 11, 8, 2, 2, p.flyerWing);
          }
          P(c, 4, 14, 8, 1, 'rgba(0,0,0,.25)');
          return;
        }
      }
    },
  };
}

function iconsSheet(p) {
  return {
    frameW: 8,
    frameH: 8,
    frames: ['heart_full', 'heart_half', 'heart_empty', 'coin', 'key', 'hint', 'bag', 'quest'],
    paint(c, name) {
      if (name.startsWith('heart')) {
        heart(c, 0, 1, 1, name === 'heart_empty' ? '#333' : p.heart, p.heartLight);
        if (name === 'heart_half') P(c, 4, 1, 3, 6, '#333');
        if (name === 'heart_half') P(c, 3, 1, 1, 6, '#333');
        return;
      }
      if (name === 'coin') return euroCoin(c, 0, 0, 8, p);
      if (name === 'quest') {
        // parchemin
        P(c, 1, 0, 6, 8, '#f4e8c8');
        P(c, 0, 0, 8, 1, '#c8a060');
        P(c, 0, 7, 8, 1, '#c8a060');
        P(c, 2, 2, 4, 1, '#7a5a30');
        P(c, 2, 4, 3, 1, '#7a5a30');
        P(c, 6, 5, 1, 2, '#e8303a');
        return;
      }
      if (name === 'bag') {
        P(c, 2, 0, 4, 1, p.bagDark);
        P(c, 1, 1, 1, 2, p.bagDark);
        P(c, 6, 1, 1, 2, p.bagDark);
        P(c, 0, 3, 8, 5, p.bag);
        P(c, 0, 3, 8, 1, p.bagDark);
        P(c, 3, 4, 2, 2, p.bagDark);
        return;
      }
      if (name === 'key') return key(c, 0, 2, p.key);
      if (name === 'hint') {
        P(c, 2, 0, 4, 5, p.hint);
        P(c, 1, 1, 6, 3, p.hint);
        P(c, 3, 5, 2, 2, '#ccc');
        P(c, 3, 1, 1, 1, '#fff');
      }
    },
  };
}

function chars(people, sign) {
  const frames = [];
  for (const who of Object.keys(people)) for (const d of ['down', 'up', 'side']) for (const s of [0, 1]) frames.push(`${who}_${d}_${s}`);
  frames.push('sign');
  return {
    frameW: 16,
    frameH: 16,
    frames,
    paint(c, name, i) {
      if (name === 'sign') return sign(c);
      const [who, dir, step] = name.split('_');
      humanoid(c, dir, Number(step), people[who]);
    },
    // PC : personnages redessinés en haute définition (le panneau est agrandi automatiquement)
    paintHD(c, name) {
      if (name === 'sign') return false;
      const [who, dir, step] = name.split('_');
      humanoidHD(c, dir, Number(step), people[who]);
    },
  };
}

// ------------------------------------------------------------ ajouts par thème
const EXTRA = {
  medieval: {
    pal: {
      chest: '#a8672a', chestDark: '#5a3414', metal: '#d8c070', metalDark: '#7a6a3a', block: '#9a9488', blockLight: '#c4beb2', blockDark: '#5a564e',
      plate: '#b0a890', plateLight: '#d4ccb4', plateDark: '#6a6454', on: '#5aff5a', off: '#ff5a5a', coin: '#e8b830', coinLight: '#fff0a0', coinDark: '#9a6a10', bag: '#a8703a', bagDark: '#6a4220', key: '#ffd35a',
      amulet: '#e83a5a', mushCap: '#d83a2a', mushStem: '#f4e8c8', heart: '#e8303a', heartLight: '#ff9aa0', blade: '#c8d0e0', hilt: '#8a5a2a',
      blob: '#5ac83a', blobDark: '#2a7a1a', flyer: '#6a3a8a', flyerWing: '#9a5aca', eye: '#ffde3a',
      flowerA: '#ff6a8a', flowerB: '#ffffff', ribbon: '#e83a5a', ribbonDark: '#a8203a', potion: '#e8303a', hint: '#ffe066',
    },
    words: { coin: ['euro', 'euros'], key: ['clé', 'clés'], amulet: ['amulette', 'amulettes'], mushroom: ['champignon', 'champignons'], blob: ['gluant', 'gluants'], cave: 'la grotte', elder: "l'Ancien", potion: ['potion', 'potions'], flowers: ['fleurs', 'fleurs'] },
    bush: (c) => {
      P(c, 0, 0, 16, 16, '#4c9a3c');
      P(c, 2, 3, 12, 11, '#3f8a36');
      P(c, 1, 5, 14, 7, '#3f8a36');
      P(c, 4, 4, 3, 2, '#6bc458');
      P(c, 9, 7, 3, 2, '#6bc458');
      P(c, 5, 9, 2, 2, '#2b6a26');
      P(c, 3, 13, 10, 2, '#2b6a26');
    },
    people: {
      elder: { skin: '#e8b88a', hair: '#eee', eye: '#222', body: '#5a3a8a', bodyDark: '#3a2a5a', legs: '#3a2a5a', hat: 'hood', hatColor: '#5a3a8a' },
      merchant: { skin: '#f2c49b', hair: '#c4542a', eye: '#222', body: '#d8a03a', bodyDark: '#a8701a', legs: '#5a3a1a' },
      guard: { skin: '#d9a07a', hair: '#333', eye: '#111', body: '#8a8a9a', bodyDark: '#5a5a6a', legs: '#4a4a5a', hat: 'helmet', hatColor: '#9a9aaa', hatLight: '#ccc', visor: '#333' },
      gardener: { skin: '#f2c49b', hair: '#e8c040', eye: '#222', body: '#5aa04a', bodyDark: '#3a7a2a', legs: '#6b4423', hat: 'cap', hatColor: '#e8d080', hatDark: '#b8a050' },
      seller: { skin: '#c48a6a', hair: '#3a2a1a', eye: '#111', body: '#c43a3a', bodyDark: '#8a2a2a', legs: '#3a2a1a' },
      teacher: { skin: '#f2c49b', hair: '#5a2a1a', eye: '#222', body: '#3a5ac8', bodyDark: '#2a3a8a', legs: '#2a2a3a' },
      leon: { skin: '#f2c49b', hair: '#c47a2a', eye: '#222', body: '#7a3fa3', bodyDark: '#5a2a7a', legs: '#4a3020' },
      carpenter: { skin: '#d9a07a', hair: '#5a3a1a', eye: '#111', body: '#8a5a2a', bodyDark: '#5a3a1a', legs: '#3a3a5a', hat: 'cap', hatColor: '#c43a3a', hatDark: '#8a2a2a' },
      fisher: { skin: '#f2c49b', hair: '#ddd', eye: '#222', body: '#2a6a9a', bodyDark: '#1a4a6a', legs: '#4a3a2a', hat: 'cap', hatColor: '#e8d080', hatDark: '#a89050' },
      scholar: { skin: '#e8b88a', hair: '#888', eye: '#222', body: '#3a2a5a', bodyDark: '#2a1a3a', legs: '#2a1a3a', hat: 'hood', hatColor: '#3a2a5a' },
      writer: { skin: '#f2c49b', hair: '#5a3a1a', eye: '#222', body: '#2a6a5a', bodyDark: '#1a4a3a', legs: '#3a2a1a', hat: 'cap', hatColor: '#8a2a2a', hatDark: '#5a1a1a' },
    },
  },
  space: {
    pal: {
      chest: '#5a6a8a', chestDark: '#2a3248', metal: '#4ff0ff', metalDark: '#2a7a8a', block: '#6a7488', blockLight: '#9aa4b8', blockDark: '#3a4254',
      plate: '#2a5a4a', plateLight: '#4aff9a', plateDark: '#1a2a2a', on: '#4aff9a', off: '#ff4a4a', coin: '#e8b830', coinLight: '#fff0a0', coinDark: '#9a6a10', bag: '#a8703a', bagDark: '#6a4220', key: '#ffb84a',
      amulet: '#c84aff', mushCap: '#4aff9a', mushStem: '#2a5a4a', heart: '#ff4a8a', heartLight: '#ffaaca', blade: '#8affff', hilt: '#5a6478',
      blob: '#c84aff', blobDark: '#7a2aaa', flyer: '#8a93a7', flyerWing: '#ff5a3a', eye: '#ff3a3a',
      flowerA: '#4ff0ff', flowerB: '#c84aff', ribbon: '#ffb84a', ribbonDark: '#c8801a', potion: '#4aff9a', hint: '#ffe066',
    },
    words: { coin: ['euro', 'euros'], key: ['carte d’accès', 'cartes d’accès'], amulet: ['cristal de données', 'cristaux de données'], mushroom: ['cellule d’énergie', 'cellules d’énergie'], blob: ['xéno-gelée', 'xéno-gelées'], cave: "l'épave", elder: 'la Commandante', potion: ['kit de soin', 'kits de soin'], flowers: ['plantes hydroponiques', 'plantes hydroponiques'] },
    bush: (c) => {
      P(c, 0, 0, 16, 16, '#3a4254');
      P(c, 3, 4, 10, 10, '#5a3a1a');
      P(c, 4, 5, 8, 8, '#8a5a2a');
      P(c, 4, 8, 8, 1, '#5a3a1a');
      P(c, 7, 5, 1, 8, '#5a3a1a');
    },
    people: {
      elder: { skin: '#c48a6a', hair: '#ddd', eye: '#111', body: '#2a4a8a', bodyDark: '#1a2a5a', legs: '#1a2a5a', hat: 'cap', hatColor: '#2a4a8a', hatDark: '#ffd35a' },
      merchant: { skin: '#9adf9a', hair: '#4a8a4a', eye: '#000', body: '#d8a03a', bodyDark: '#a8701a', legs: '#333' },
      guard: { skin: '#f2c49b', hair: '#333', eye: '#111', body: '#c43a3a', bodyDark: '#8a2a2a', legs: '#333', hat: 'helmet', hatColor: '#c43a3a', hatLight: '#ff8a8a', visor: '#222' },
      gardener: { skin: '#9adf9a', hair: '#2a6a2a', eye: '#000', body: '#2a8a5a', bodyDark: '#1a5a3a', legs: '#333' },
      seller: { skin: '#c48a6a', hair: '#ddd', eye: '#111', body: '#5a6478', bodyDark: '#3a4254', legs: '#333', hat: 'cap', hatColor: '#ffb84a', hatDark: '#c8801a' },
      teacher: { skin: '#f2c49b', hair: '#1a1a1a', eye: '#222', body: '#e8ecf4', bodyDark: '#a8b0c4', legs: '#2a3248' },
      leon: { skin: '#e8b88a', hair: '#c47a2a', eye: '#222', body: '#3a7ad8', bodyDark: '#2a5aa8', legs: '#333' },
      carpenter: { skin: '#c48a6a', hair: '#222', eye: '#111', body: '#ffb84a', bodyDark: '#c8801a', legs: '#333', hat: 'helmet', hatColor: '#ffb84a', hatLight: '#ffd88a', visor: '#222' },
      fisher: { skin: '#9adf9a', hair: '#2a6a2a', eye: '#000', body: '#2a6a9a', bodyDark: '#1a4a6a', legs: '#333' },
      scholar: { skin: '#f2c49b', hair: '#aaa', eye: '#222', body: '#5a3a8a', bodyDark: '#3a2a5a', legs: '#222' },
      writer: { skin: '#c48a6a', hair: '#222', eye: '#111', body: '#2a6a5a', bodyDark: '#1a4a3a', legs: '#333' },
    },
  },
  city: {
    pal: {
      chest: '#3a6ab8', chestDark: '#1a3a6a', metal: '#e8e8e8', metalDark: '#888', block: '#c8a070', blockLight: '#e8c8a0', blockDark: '#7a5a3a',
      plate: '#888', plateLight: '#bbb', plateDark: '#444', on: '#5aff5a', off: '#ff5a5a', coin: '#e8b830', coinLight: '#fff0a0', coinDark: '#9a6a10', bag: '#a8703a', bagDark: '#6a4220', key: '#c8c8d8',
      amulet: '#ff6aa8', mushCap: '#ff6aa8', mushStem: '#fff', heart: '#ff3a5a', heartLight: '#ffa0b0', blade: '#e8e8f0', hilt: '#222',
      blob: '#7a7a8a', blobDark: '#4a4a5a', flyer: '#9a9aa8', flyerWing: '#6a6a78', eye: '#ff6a3a',
      flowerA: '#ff6aa8', flowerB: '#ffd35a', ribbon: '#3a7ad8', ribbonDark: '#1a4aa8', potion: '#ff3a5a', hint: '#ffe066',
    },
    words: { coin: ['euro', 'euros'], key: ['clé', 'clés'], amulet: ['médaillon', 'médaillons'], mushroom: ['ticket', 'tickets'], blob: ['rat', 'rats'], cave: 'le parking souterrain', elder: 'le Doyen', potion: ['trousse de secours', 'trousses de secours'], flowers: ['fleurs', 'fleurs'] },
    bush: (c) => {
      P(c, 0, 0, 16, 16, '#b9b4aa');
      P(c, 3, 6, 10, 9, '#1a1a1a');
      P(c, 4, 4, 8, 3, '#2a2a2a');
      P(c, 7, 2, 2, 3, '#1a1a1a');
      P(c, 5, 7, 1, 6, '#3a3a3a');
    },
    people: {
      elder: { skin: '#e8b88a', hair: '#ccc', eye: '#222', body: '#6a4a2a', bodyDark: '#4a2a1a', legs: '#333' },
      merchant: { skin: '#a8704a', hair: '#1a1a1a', eye: '#111', body: '#3ac48a', bodyDark: '#2a8a5a', legs: '#2a3a6a' },
      guard: { skin: '#f2c49b', hair: '#333', eye: '#111', body: '#2a3a7a', bodyDark: '#1a2a5a', legs: '#1a2a5a', hat: 'cap', hatColor: '#2a3a7a', hatDark: '#111' },
      gardener: { skin: '#d9a07a', hair: '#1a1a1a', eye: '#111', body: '#5aa04a', bodyDark: '#3a7a2a', legs: '#2a3a6a' },
      seller: { skin: '#f2c49b', hair: '#7a4a1a', eye: '#222', body: '#ffd35a', bodyDark: '#c8a030', legs: '#333' },
      teacher: { skin: '#a8704a', hair: '#1a1a1a', eye: '#111', body: '#c84a80', bodyDark: '#8a2a5a', legs: '#2a2a3a' },
      leon: { skin: '#f2c49b', hair: '#c47a2a', eye: '#222', body: '#3a7ad8', bodyDark: '#2a5aa8', legs: '#333' },
      carpenter: { skin: '#d9a07a', hair: '#333', eye: '#111', body: '#e8c547', bodyDark: '#b89520', legs: '#2a3a6a', hat: 'helmet', hatColor: '#ffd35a', hatLight: '#fff2b4', visor: '#333' },
      fisher: { skin: '#a8704a', hair: '#ddd', eye: '#111', body: '#2a6a9a', bodyDark: '#1a4a6a', legs: '#4a3a2a', hat: 'cap', hatColor: '#1a1a1a', hatDark: '#000' },
      scholar: { skin: '#e8b88a', hair: '#888', eye: '#222', body: '#6a4a2a', bodyDark: '#4a2a1a', legs: '#333' },
      writer: { skin: '#f2c49b', hair: '#c47a2a', eye: '#222', body: '#2a6a5a', bodyDark: '#1a4a3a', legs: '#2a2a3a', hat: 'cap', hatColor: '#1a1a1a', hatDark: '#000' },
    },
  },
};

const SIGNS = {
  medieval: (c) => (P(c, 7, 9, 2, 7, '#5a3a1c'), P(c, 2, 3, 12, 7, '#8a5a2c'), P(c, 2, 3, 12, 1, '#b07a40'), P(c, 4, 5, 8, 1, '#3a2410'), P(c, 4, 7, 6, 1, '#3a2410')),
  space: (c) => (P(c, 6, 10, 4, 6, '#4a5670'), P(c, 2, 2, 12, 9, '#20283a'), P(c, 3, 3, 10, 7, '#0a3a4a'), P(c, 4, 4, 6, 1, '#4ff0ff'), P(c, 4, 6, 8, 1, '#4ff0ff')),
  city: (c) => (P(c, 7, 6, 2, 10, '#555'), P(c, 2, 1, 12, 6, '#1a6a3a'), P(c, 3, 2, 10, 4, '#2a8a4a'), P(c, 4, 3, 8, 1, '#fff')),
};

const PLAYERS = {
  medieval: { skin: '#f2c49b', hair: '#7a4a1a', eye: '#222', body: '#3fa34d', bodyDark: '#2a7a36', legs: '#6b4423', hat: 'hood', hatColor: '#3fa34d' },
  space: { skin: '#f2c49b', hair: '#333', eye: '#222', body: '#e8ecf4', bodyDark: '#a8b0c4', legs: '#c8cfdc', hat: 'helmet', hatColor: '#e8ecf4', hatLight: '#ffffff', visor: '#3a8aff' },
  city: { skin: '#d9a07a', hair: '#1a1a1a', eye: '#111', body: '#ff6aa8', bodyDark: '#c84a80', legs: '#2a3a6a', hat: 'cap', hatColor: '#1a1a1a', hatDark: '#000' },
};

// ------------------------------------------------------------ compagnon (chiot / drone / chaton)
function paintPet(c, pet, step) {
  P(c, 4, 15, 9, 1, 'rgba(0,0,0,.3)');
  if (pet.kind === 'drone') {
    const y = step ? 1 : 0;
    P(c, 4, 6 + y, 8, 6, pet.body);
    P(c, 5, 5 + y, 6, 1, pet.light);
    P(c, 6, 8 + y, 4, 2, pet.eye);
    P(c, 2, 4 + y, 3, 1, pet.light);
    P(c, 11, 4 + y, 3, 1, pet.light);
    P(c, 7, 12 + y, 2, 1, '#4ff0ff');
    return;
  }
  // quadrupède : chiot ou chaton
  P(c, 3, 9, 9, 4, pet.body);
  P(c, 10, 5, 5, 5, pet.body);
  P(c, 10, 9, 5, 1, pet.dark);
  if (pet.kind === 'cat') {
    P(c, 10, 4, 1, 1, pet.body);
    P(c, 14, 4, 1, 1, pet.body);
  } else {
    P(c, 10, 5, 1, 3, pet.dark);
    P(c, 14, 5, 1, 3, pet.dark);
  }
  P(c, 12, 6, 1, 1, '#111');
  P(c, 14, 7, 1, 1, pet.kind === 'cat' ? '#ff8aa8' : '#111');
  P(c, 1, step ? 7 : 8, 2, 2, pet.body); // queue
  P(c, 4, 13, 2, step ? 2 : 1, pet.dark);
  P(c, 9, 13, 2, step ? 1 : 2, pet.dark);
  P(c, 4, 10, 4, 1, pet.light);
}

// ------------------------------------------------------------ boss 32x32
function bossSheet(kind, b) {
  return {
    frameW: 32,
    frameH: 32,
    frames: ['boss_0', 'boss_1', 'boss_shield'],
    outline: '#141414',
    paint(c, name) {
      if (name === 'boss_shield') {
        for (let a = 0; a < 64; a++) {
          const ang = (a / 64) * Math.PI * 2;
          P(c, Math.round(16 + Math.cos(ang) * 14), Math.round(17 + Math.sin(ang) * 13), 1, 1, '#9ad8ff');
        }
        P(c, 9, 7, 3, 1, '#e8f8ff');
        P(c, 7, 9, 1, 3, '#e8f8ff');
        return;
      }
      const sq = name === 'boss_1' ? 1 : 0;
      P(c, 5, 29, 22, 2, 'rgba(0,0,0,.3)');
      if (kind === 'robot') {
        P(c, 6, 8 + sq, 20, 18 - sq, b.body);
        P(c, 6, 8 + sq, 20, 2, b.light);
        P(c, 9, 13 + sq, 14, 4, '#111');
        P(c, 10, 14 + sq, 12, 2, b.eye);
        P(c, 15, 3 + sq, 2, 5, b.dark);
        P(c, 14, 1 + sq, 4, 2, b.eye);
        P(c, 3, 14, 3, 8, b.dark);
        P(c, 26, 14, 3, 8, b.dark);
        P(c, 8, 26, 5, 3, b.dark);
        P(c, 19, 26, 5, 3, b.dark);
        P(c, 10, 20 + sq, 12, 2, b.dark);
        return;
      }
      if (kind === 'rat') {
        P(c, 4, 12 + sq, 22, 14 - sq, b.body);
        P(c, 18, 7 + sq, 11, 11, b.body);
        P(c, 18, 4 + sq, 4, 4, b.light);
        P(c, 25, 4 + sq, 4, 4, b.light);
        P(c, 22, 10 + sq, 2, 2, b.eye);
        P(c, 27, 10 + sq, 2, 2, b.eye);
        P(c, 28, 14 + sq, 3, 2, '#ff8aa8');
        P(c, 1, 22, 4, 2, '#d8a0a8');
        P(c, 0, 18, 2, 4, '#d8a0a8');
        P(c, 6, 26, 4, 3, b.dark);
        P(c, 18, 26, 4, 3, b.dark);
        P(c, 6, 14 + sq, 10, 3, b.light);
        return;
      }
      // roi gluant
      P(c, 4, 12 + sq * 2, 24, 16 - sq * 2, b.dark);
      P(c, 6, 9 + sq * 2, 20, 4, b.body);
      P(c, 4, 13 + sq * 2, 24, 14 - sq * 2, b.body);
      P(c, 7, 14 + sq * 2, 5, 3, b.light);
      P(c, 10, 17, 4, 4, '#fff');
      P(c, 19, 17, 4, 4, '#fff');
      P(c, 11, 18, 2, 2, '#111');
      P(c, 20, 18, 2, 2, '#111');
      P(c, 13, 23, 6, 1, b.dark);
      // couronne
      P(c, 9, 4 + sq * 2, 14, 5, b.eye);
      P(c, 9, 1 + sq * 2, 2, 3, b.eye);
      P(c, 15, 0 + sq * 2, 2, 4, b.eye);
      P(c, 21, 1 + sq * 2, 2, 3, b.eye);
      P(c, 15, 5 + sq * 2, 2, 2, '#e8303a');
    },
  };
}

// ------------------------------------------------------------ tuiles améliorées
const tuft = (c, x, y, col) => (P(c, x, y + 1, 1, 1, col), P(c, x + 1, y, 1, 1, col), P(c, x + 2, y + 1, 1, 1, col));
const BETTER_TILES = {
  medieval: {
    floor: {
      variants: 3,
      paint: (c, { rng, variant }) => {
        P(c, 0, 0, 16, 16, '#4c9a3c');
        for (let i = 0; i < detailCount(10); i++) P(c, rng.int(0, 15), rng.int(0, 15), 1, 1, rng.pick(['#3d8530', '#5fb04c']));
        for (let i = 0; i < detailCount(2 + variant); i++) tuft(c, rng.int(0, 13), rng.int(1, 13), i % 2 ? '#3a7f2c' : '#6bbf4e');
        if (variant === 2) (P(c, rng.int(2, 13), rng.int(2, 13), 1, 1, '#ffe066'), P(c, rng.int(2, 13), rng.int(2, 13), 1, 1, '#ffffff'));
      },
    },
    path: {
      variants: 2,
      paint: (c, { rng }) => {
        P(c, 0, 0, 16, 16, '#c9a266');
        for (let i = 0; i < detailCount(9); i++) P(c, rng.int(0, 15), rng.int(0, 15), 1, 1, rng.pick(['#b08950', '#dcb97f']));
        for (let i = 0; i < 2; i++) {
          const x = rng.int(1, 12);
          const y = rng.int(1, 12);
          P(c, x, y, 3, 2, '#9a7a4a');
          P(c, x, y, 2, 1, '#e4c690');
        }
      },
    },
    bush: {
      paint: (c) => {
        P(c, 0, 0, 16, 16, '#4c9a3c');
        P(c, 2, 4, 12, 10, '#2b6a26');
        P(c, 1, 6, 14, 6, '#2b6a26');
        P(c, 3, 3, 10, 9, '#3f8a36');
        P(c, 2, 6, 12, 5, '#3f8a36');
        P(c, 4, 4, 3, 2, '#6bc458');
        P(c, 9, 6, 3, 2, '#6bc458');
        P(c, 6, 9, 2, 1, '#6bc458');
        P(c, 3, 13, 10, 2, '#1d4a1a');
      },
    },
    water: {
      frames: 2,
      fps: 2,
      variants: 2,
      paint: (c, { frame, variant }) => {
        P(c, 0, 0, 16, 16, '#2f63c9');
        P(c, 0, 8, 16, 8, '#2a58b8');
        const o = frame * 4 + variant * 6;
        P(c, (2 + o) % 14, 4, 4, 1, '#79a6f2');
        P(c, (9 + o) % 14, 11, 4, 1, '#79a6f2');
        if (frame) P(c, (5 + variant * 7) % 15, 7, 1, 1, '#ffffff');
      },
    },
  },
  space: {
    floor: {
      variants: 3,
      paint: (c, { variant }) => {
        P(c, 0, 0, 16, 16, '#3a4254');
        P(c, 0, 0, 16, 1, '#4c566c');
        P(c, 0, 15, 16, 1, '#272d3a');
        P(c, 15, 0, 1, 16, '#272d3a');
        for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) P(c, x, y, 1, 1, '#6a7590');
        if (variant === 1) for (let x = 4; x < 12; x += 2) P(c, x, 6, 1, 4, '#2a303d');
        if (variant === 2) (P(c, 5, 5, 6, 6, '#333b4c'), P(c, 7, 7, 2, 2, '#4ff0ff'));
      },
    },
  },
  city: {
    floor: {
      variants: 3,
      paint: (c, { variant, rng }) => {
        P(c, 0, 0, 16, 16, '#b9b4aa');
        P(c, 0, 0, 16, 1, '#9e998f');
        P(c, 0, 8, 16, 1, '#9e998f');
        P(c, 0, 0, 1, 8, '#9e998f');
        P(c, 8, 8, 1, 8, '#9e998f');
        if (variant === 1) (P(c, rng.int(2, 6), 3, 3, 1, '#a8a398'), P(c, rng.int(9, 12), 11, 1, 3, '#a8a398'));
        if (variant === 2) P(c, rng.int(2, 12), rng.int(2, 12), 2, 2, '#8a857c');
      },
    },
  },
};
const EDGES = { medieval: '#a8c8f8', space: '#3a4a8a', city: '#d8f0f4' };
const PETS = {
  medieval: { kind: 'dog', body: '#b07a40', dark: '#6a4220', light: '#d8a060', eye: '#111' },
  space: { kind: 'drone', body: '#8b93a7', dark: '#3a4254', light: '#c0c7d6', eye: '#3aff8a' },
  city: { kind: 'cat', body: '#e8903a', dark: '#a85a1a', light: '#ffc078', eye: '#111' },
};
const BOSSES = {
  medieval: ['slime', { body: '#5ac83a', dark: '#2a7a1a', light: '#9af07a', eye: '#ffd35a' }],
  space: ['robot', { body: '#8b93a7', dark: '#4a5266', light: '#c0c7d6', eye: '#ff3a3a' }],
  city: ['rat', { body: '#7a7a8a', dark: '#4a4a5a', light: '#9a9aa8', eye: '#ff3a3a' }],
};
const MORE_WORDS = {
  medieval: { boss: 'le Roi Gluant', pet: 'le chiot', elderName: 'Augustin, l’Ancien' },
  space: { boss: 'le Robot Géant', pet: 'le petit drone', elderName: 'Ada, la Commandante' },
  city: { boss: 'le Rat Géant', pet: 'le chaton', elderName: 'Gérard, le Doyen' },
};


// ------------------------------------------------------------ GROTTE EN PIERRES et MAGASIN
// Murs en moellons irréguliers, sol rocheux, rochers, torches ; magasin avec étagères garnies,
// comptoir, façade à auvent et vitrine. Une palette par ambiance.

function stoneWall(c, rng, k) {
  P(c, 0, 0, 16, 16, k.mortar);
  // rangées de pierres de tailles variées, décalées
  let y = 0;
  while (y < 16) {
    const h = rng.int(4, 6);
    let x = -rng.int(0, 4);
    while (x < 16) {
      const w = rng.int(5, 8);
      const x0 = Math.max(0, x + 1);
      const x1 = Math.min(16, x + w);
      if (x1 > x0) {
        P(c, x0, y + 1, x1 - x0, h - 1, rng() < 0.3 ? k.stoneAlt : k.stone);
        P(c, x0, y + 1, x1 - x0, 1, k.light);
        P(c, x0, y + 1, 1, h - 1, k.light);
        P(c, x0, y + h - 1, x1 - x0, 1, k.dark);
      }
      x += w;
    }
    y += h;
  }
  P(c, 0, 15, 16, 1, k.dark);
}

function stoneFloor(c, rng, k, variant) {
  P(c, 0, 0, 16, 16, k.floor);
  for (let i = 0; i < detailCount(14); i++) P(c, rng.int(0, 15), rng.int(0, 15), 1, 1, rng.pick([k.floorDark, k.floorLight]));
  for (let i = 0; i < 2 + variant; i++) {
    const x = rng.int(1, 12);
    const y = rng.int(1, 13);
    P(c, x, y, 3, 2, k.floorDark);
    P(c, x, y, 2, 1, k.floorLight);
  }
  if (variant === 1) {
    // petite fissure discrète
    let x = rng.int(3, 11);
    for (let y = rng.int(3, 7); y < rng.int(9, 13); y += 1) {
      P(c, x, y, 1, 1, k.floorDark);
      if (rng() < 0.4) x += rng() < 0.5 ? -1 : 1;
    }
  }
}

function caveTiles(k) {
  return {
    cave_floor: { variants: 4, paint: (c, { rng, variant }) => stoneFloor(c, rng, k, variant % 3) },
    cave_wall: { solid: true, variants: 3, props: { shadow: true }, paint: (c, { rng }) => stoneWall(c, rng, k) },
    cave_rock: {
      solid: true,
      variants: 2,
      props: { shadow: true },
      paint: (c, { rng, variant }) => {
        stoneFloor(c, rng, k, 0);
        P(c, 2, 13, 12, 2, 'rgba(0,0,0,.3)');
        P(c, 3, 4 + variant, 10, 10 - variant, k.dark);
        P(c, 2, 6 + variant, 12, 7 - variant, k.dark);
        P(c, 3, 5 + variant, 9, 7 - variant, k.stone);
        P(c, 4, 4 + variant, 6, 2, k.light);
        P(c, 4, 6 + variant, 2, 3, k.light);
        P(c, 9, 9, 3, 1, k.dark);
      },
    },
    cave_torch: {
      solid: true,
      frames: 2,
      fps: 6,
      props: { shadow: true },
      paint: (c, { rng, frame }) => {
        stoneWall(c, rng, k);
        P(c, 7, 8, 2, 6, '#5a3a1c');
        P(c, 6, 8, 4, 1, '#3a2410');
        const f = frame ? 1 : 0;
        P(c, 6, 3 + f, 4, 5 - f, '#e8701a');
        P(c, 7, 1 + f * 2, 2, 7 - f * 2, '#ffb030');
        P(c, 7, 5, 2, 2, '#fff2a0');
        P(c, 5, 2, 6, 7, 'rgba(255,200,80,.15)');
      },
    },
    cave_exit: {
      paint: (c, { rng }) => {
        stoneWall(c, rng, k);
        P(c, 3, 3, 10, 13, k.dark);
        P(c, 4, 2, 8, 14, '#0a0806');
        P(c, 5, 1, 6, 1, '#0a0806');
        P(c, 4, 14, 8, 2, k.floor);
      },
    },
  };
}

function shopTiles(k) {
  const floor = (c, { variant }) => {
    if (k.floorStyle === 'checker') {
      for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) P(c, x * 8, y * 8, 8, 8, (x + y) % 2 ? k.floorB : k.floorA);
      return;
    }
    if (k.floorStyle === 'grid') {
      P(c, 0, 0, 16, 16, k.floorA);
      P(c, 0, 0, 16, 1, k.floorB);
      P(c, 0, 0, 1, 16, k.floorB);
      if (variant === 1) P(c, 6, 6, 4, 4, k.floorB);
      return;
    }
    // parquet
    P(c, 0, 0, 16, 16, k.floorA);
    for (let y = 0; y < 16; y += 4) P(c, 0, y, 16, 1, k.floorB);
    const o = variant * 3;
    for (let row = 0; row < 4; row++) P(c, (row * 5 + o) % 16, row * 4, 1, 4, k.floorB);
    P(c, 2 + o, 2, 2, 1, k.floorC);
  };
  const wall = (c) => {
    P(c, 0, 0, 16, 16, k.wall);
    if (k.wallStyle === 'planks') {
      for (let x = 0; x < 16; x += 4) P(c, x, 0, 1, 16, k.wallDark);
      P(c, 0, 5, 16, 2, k.wallDark);
    } else if (k.wallStyle === 'panels') {
      P(c, 1, 1, 14, 6, k.wallDark);
      P(c, 1, 9, 14, 6, k.wallDark);
      P(c, 2, 2, 12, 4, k.wall);
      P(c, 2, 10, 12, 4, k.wall);
    } else {
      for (let x = 0; x < 16; x += 4) P(c, x, 0, 2, 16, k.wallDark);
      P(c, 0, 12, 16, 4, k.wallDark);
    }
    P(c, 0, 15, 16, 1, 'rgba(0,0,0,.35)');
  };
  return {
    shop_floor: { variants: 3, paint: floor },
    shop_wall: { solid: true, props: { shadow: true }, paint: wall },
    shelf: {
      solid: true,
      variants: 3,
      props: { shadow: true },
      paint: (c, { rng }) => {
        wall(c);
        P(c, 1, 1, 14, 15, k.shelfDark);
        for (const y of [5, 10, 15]) P(c, 1, y, 14, 1, k.shelf);
        // produits rangés sur 3 étagères
        for (const top of [1, 6, 11]) {
          let x = 2;
          while (x < 14) {
            const w = rng.int(2, 3);
            const h = rng.int(2, 4);
            const col = rng.pick(k.goods);
            P(c, x, top + 4 - h, Math.min(w, 14 - x), h, col);
            if (h >= 3) P(c, x, top + 4 - h, 1, 1, '#ffffff');
            x += w + (rng() < 0.3 ? 1 : 0);
          }
        }
      },
    },
    counter: {
      solid: true,
      variants: 2,
      props: { shadow: true, counter: true },
      paint: (c, { variant }) => {
        floor(c, { variant: 0 });
        P(c, 0, 3, 16, 13, k.counter);
        P(c, 0, 3, 16, 3, k.counterTop);
        P(c, 0, 6, 16, 1, k.counterDark);
        for (let x = 3; x < 16; x += 5) P(c, x, 8, 1, 7, k.counterDark);
        if (variant === 1) {
          // caisse enregistreuse
          P(c, 4, 0, 8, 4, '#333');
          P(c, 5, 1, 6, 1, '#7ad87a');
          P(c, 4, 3, 8, 1, '#555');
        }
      },
    },
    shop_door: {
      paint: (c) => {
        wall(c);
        P(c, 3, 1, 10, 15, '#2a1a0e');
        P(c, 4, 2, 8, 14, k.door);
        P(c, 5, 3, 6, 5, '#cfe8ff');
        P(c, 10, 10, 1, 1, '#ffd35a');
      },
    },
    awning: {
      solid: true,
      props: { shadow: true },
      paint: (c) => {
        P(c, 0, 0, 16, 16, k.facade);
        for (let x = 0; x < 16; x += 4) {
          P(c, x, 2, 2, 10, k.awningA);
          P(c, x + 2, 2, 2, 10, k.awningB);
        }
        for (let x = 0; x < 16; x += 4) {
          P(c, x, 12, 2, 2, k.awningA);
          P(c, x + 2, 12, 2, 1, k.awningB);
        }
        P(c, 0, 1, 16, 1, k.facadeDark);
      },
    },
    shopfront: {
      solid: true,
      variants: 2,
      props: { shadow: true },
      paint: (c, { rng }) => {
        P(c, 0, 0, 16, 16, k.facade);
        P(c, 1, 2, 14, 11, k.facadeDark);
        P(c, 2, 3, 12, 9, '#a8d0e8');
        P(c, 2, 3, 12, 1, '#d8f0ff');
        // articles en vitrine
        for (let x = 3; x < 13; x += 3) P(c, x, 12 - rng.int(2, 4), 2, rng.int(2, 4), rng.pick(k.goods));
        P(c, 3, 4, 2, 4, 'rgba(255,255,255,.5)');
        P(c, 0, 13, 16, 3, k.facadeDark);
      },
    },
  };
}

const CAVE_SHOP = {
  medieval: {
    cave: { mortar: '#2e2a26', stone: '#6e665c', stoneAlt: '#625b52', light: '#8e857a', dark: '#46403a', floor: '#57514a', floorDark: '#47423c', floorLight: '#6a645b' },
    shop: {
      floorStyle: 'planks', floorA: '#b07a40', floorB: '#7a5228', floorC: '#d8a060',
      wallStyle: 'planks', wall: '#8a5a30', wallDark: '#5a3a1c',
      shelf: '#c89a5a', shelfDark: '#4a2c18', counter: '#8a5a2c', counterTop: '#c89a5a', counterDark: '#5a3a1c', door: '#6b4423',
      goods: ['#e8303a', '#3a8ad8', '#e8c040', '#5ac83a', '#d8a060', '#9a5ad8', '#f4e8c8'],
      facade: '#8a8478', facadeDark: '#5a564e', awningA: '#c43a3a', awningB: '#f4e8c8',
    },
  },
  space: {
    cave: { mortar: '#1c1826', stone: '#4e4660', stoneAlt: '#584f6c', light: '#6e6684', dark: '#332d42', floor: '#3a3448', floorDark: '#2c2738', floorLight: '#4a4358' },
    shop: {
      floorStyle: 'grid', floorA: '#2a3444', floorB: '#3a4a5e',
      wallStyle: 'panels', wall: '#c0c7d6', wallDark: '#8b93a7',
      shelf: '#8b93a7', shelfDark: '#2a3040', counter: '#3a4254', counterTop: '#4ff0ff', counterDark: '#20283a', door: '#4a5670',
      goods: ['#4ff0ff', '#c84aff', '#4aff9a', '#ffb84a', '#ff4a8a', '#e8ecf4'],
      facade: '#8b93a7', facadeDark: '#4a5266', awningA: '#2a3a6a', awningB: '#4ff0ff',
    },
  },
  city: {
    cave: { mortar: '#30302c', stone: '#6a6a66', stoneAlt: '#5e5e5a', light: '#86867f', dark: '#46463f', floor: '#55554f', floorDark: '#46463f', floorLight: '#66665f' },
    shop: {
      floorStyle: 'checker', floorA: '#e8e4dc', floorB: '#b8b4ac',
      wallStyle: 'stripes', wall: '#f2e6c8', wallDark: '#e0cfa4',
      shelf: '#e8e8f0', shelfDark: '#9a9aa8', counter: '#3a7ad8', counterTop: '#e8e8f0', counterDark: '#1a4aa8', door: '#5aa0d0',
      goods: ['#ff3a5a', '#ffd35a', '#3ac48a', '#3a7ad8', '#ff8a3a', '#ffffff', '#c84a80'],
      facade: '#9a4a3a', facadeDark: '#6e3328', awningA: '#2a8a4a', awningB: '#ffffff',
    },
  },
};

// ------------------------------------------------------------ EXTÉRIEURS SELON L'AMBIANCE
// Magasin : médiéval = colombages et chaume ; spatial = module métallique et néons ;
// ville = boutique moderne à auvent. Grotte : médiéval = rocher et caverne ;
// spatial = épave et brèche dans la coque ; ville = entrée de parking souterrain.
const GRASS = '#4c9a3c';

const EXTERIORS = {
  medieval: {
    // toit de chaume (rangée haute)
    awning: (c, { rng }) => {
      P(c, 0, 0, 16, 16, '#c9a04a');
      P(c, 0, 0, 16, 2, '#8a6a2a'); // faîtage
      for (let y = 3; y < 16; y += 3) for (let x = (y % 2) * 2; x < 16; x += 4) P(c, x, y, 2, 2, '#a8823a');
      for (let i = 0; i < 18; i++) P(c, rng.int(0, 15), rng.int(2, 15), 1, 2, rng.pick(['#e0bc6a', '#9a7432']));
    },
    // bas du toit : chaume qui déborde, ombre sur le mur
    roof_eave: (c, { rng }) => {
      P(c, 0, 0, 16, 16, '#e8dcc0');
      P(c, 0, 0, 16, 9, '#c9a04a');
      for (let x = 0; x < 16; x += 2) P(c, x, 9, 1, rng.int(1, 3), '#a8823a');
      for (let i = 0; i < 10; i++) P(c, rng.int(0, 15), rng.int(0, 8), 1, 2, rng.pick(['#e0bc6a', '#9a7432']));
      P(c, 0, 11, 16, 2, 'rgba(0,0,0,.25)');
      P(c, 0, 13, 16, 3, '#5a3a1c'); // poutre
    },
    // mur à colombages avec petite vitrine
    shopfront: (c, { rng }) => {
      P(c, 0, 0, 16, 16, '#e8dcc0');
      P(c, 0, 0, 2, 16, '#5a3a1c');
      P(c, 14, 0, 2, 16, '#5a3a1c');
      P(c, 0, 14, 16, 2, '#5a3a1c');
      P(c, 3, 2, 10, 8, '#5a3a1c');
      P(c, 4, 3, 8, 6, '#a8d0e8');
      for (let x = 5; x < 11; x += 2) P(c, x, 8 - rng.int(1, 3), 1, rng.int(1, 3), rng.pick(['#e8303a', '#ffd35a', '#3a8ad8', '#5ac83a']));
      P(c, 8, 3, 1, 6, '#5a3a1c');
      P(c, 3, 10, 10, 2, '#7a5228'); // jardinière
      P(c, 4, 9, 2, 1, '#e8303a');
      P(c, 9, 9, 2, 1, '#ffd35a');
    },
    shop_entrance: (c) => {
      P(c, 0, 0, 16, 16, '#e8dcc0');
      P(c, 0, 0, 2, 16, '#5a3a1c');
      P(c, 14, 0, 2, 16, '#5a3a1c');
      P(c, 3, 1, 10, 15, '#3a2410');
      P(c, 4, 2, 8, 14, '#8a5a2c');
      for (let x = 6; x < 12; x += 2) P(c, x, 2, 1, 14, '#6b4423');
      P(c, 10, 9, 1, 1, '#ffd35a');
      P(c, 12, 1, 3, 3, '#ffb030'); // lanterne
    },
    cliff: (c, { rng, variant }) => {
      P(c, 0, 0, 16, 16, '#6e665c');
      const blobs = 4 + variant;
      for (let i = 0; i < blobs; i++) {
        const x = rng.int(-2, 12);
        const y = rng.int(-2, 12);
        const w = rng.int(5, 8);
        const h = rng.int(4, 7);
        P(c, x, y, w, h, '#5a534a');
        P(c, x + 1, y, w - 2, 2, '#8e857a');
        P(c, x, y + h - 1, w, 1, '#46403a');
      }
      if (variant === 2) (P(c, rng.int(1, 12), 0, 4, 2, GRASS), P(c, rng.int(2, 10), 1, 2, 1, '#6bbf4e'));
    },
    cave_mouth: (c) => {
      P(c, 0, 0, 16, 16, '#6e665c');
      P(c, 0, 0, 16, 2, '#8e857a');
      P(c, 1, 3, 14, 13, '#46403a');
      P(c, 2, 4, 12, 12, '#0a0806');
      P(c, 4, 2, 8, 2, '#0a0806');
      P(c, 2, 4, 2, 2, '#46403a');
      P(c, 12, 4, 2, 2, '#46403a');
      P(c, 3, 14, 10, 2, '#2a2420');
    },
  },
  space: {
    awning: (c) => {
      P(c, 0, 0, 16, 16, '#5c6377');
      P(c, 0, 0, 16, 2, '#c0c7d6');
      for (let x = 0; x < 16; x += 4) P(c, x, 2, 1, 14, '#4a5266');
      P(c, 2, 6, 3, 3, '#3aff8a');
      P(c, 11, 6, 3, 3, '#ff4a8a');
    },
    roof_eave: (c) => {
      P(c, 0, 0, 16, 16, '#8b93a7');
      P(c, 0, 0, 16, 9, '#20283a');
      P(c, 0, 3, 16, 3, '#4ff0ff'); // bandeau lumineux
      for (let x = 1; x < 16; x += 4) P(c, x, 4, 2, 1, '#e8ffff');
      P(c, 0, 9, 16, 1, '#c0c7d6');
      P(c, 0, 10, 16, 2, 'rgba(0,0,0,.3)');
    },
    shopfront: (c, { rng }) => {
      P(c, 0, 0, 16, 16, '#8b93a7');
      P(c, 0, 0, 16, 1, '#c0c7d6');
      P(c, 3, 2, 10, 10, '#4a5266');
      P(c, 4, 3, 8, 8, '#0a3a4a');
      P(c, 5, 4, 6, 6, '#1a5a6a');
      for (let x = 5; x < 11; x += 2) P(c, x, 9 - rng.int(1, 3), 1, rng.int(1, 3), rng.pick(['#4ff0ff', '#c84aff', '#4aff9a', '#ffb84a']));
      P(c, 5, 4, 2, 1, '#e8ffff');
      P(c, 0, 14, 16, 2, '#5c6377');
    },
    shop_entrance: (c) => {
      P(c, 0, 0, 16, 16, '#8b93a7');
      P(c, 2, 1, 12, 15, '#20283a');
      P(c, 3, 2, 5, 14, '#4a5670');
      P(c, 8, 2, 5, 14, '#4a5670');
      P(c, 7, 2, 2, 14, '#20283a');
      P(c, 6, 0, 4, 1, '#3aff8a');
    },
    // épave : coque rouillée
    cliff: (c, { rng, variant }) => {
      P(c, 0, 0, 16, 16, '#5c6377');
      P(c, 0, 0, 16, 1, '#8b93a7');
      P(c, 0, 8, 16, 1, '#3a4254');
      P(c, 8 * (variant % 2), 0, 1, 16, '#3a4254');
      for (const [x, y] of [[2, 2], [13, 2], [2, 11], [13, 11]]) P(c, x, y, 1, 1, '#a8b0c4');
      for (let i = 0; i < 4 + variant * 2; i++) P(c, rng.int(0, 14), rng.int(0, 14), rng.int(1, 3), rng.int(1, 2), rng.pick(['#a85a1c', '#c87a3a', '#7a3a10']));
    },
    // brèche dans la coque
    cave_mouth: (c) => {
      P(c, 0, 0, 16, 16, '#5c6377');
      P(c, 2, 3, 12, 13, '#0a0a14');
      for (const [x, y] of [[2, 3], [5, 2], [9, 3], [12, 4], [13, 7], [2, 8]]) P(c, x, y, 2, 2, '#5c6377');
      P(c, 3, 5, 1, 1, '#ffd35a');
      P(c, 12, 10, 1, 1, '#4ff0ff');
      P(c, 1, 2, 3, 1, '#c87a3a');
      P(c, 12, 2, 3, 1, '#c87a3a');
    },
  },
  city: {
    // enseigne en haut de la façade
    awning: (c) => {
      P(c, 0, 0, 16, 16, '#9a4a3a');
      P(c, 0, 0, 16, 2, '#6e3328');
      P(c, 0, 4, 16, 9, '#1a1a1a');
      P(c, 1, 5, 14, 7, '#2a2a30');
      for (let x = 2; x < 15; x += 3) P(c, x, 7, 2, 3, '#ff6aa8');
      P(c, 0, 13, 16, 3, '#9a4a3a');
    },
    // auvent rayé
    roof_eave: (c) => {
      P(c, 0, 0, 16, 16, '#9a4a3a');
      for (let x = 0; x < 16; x += 4) {
        P(c, x, 0, 2, 10, '#2a8a4a');
        P(c, x + 2, 0, 2, 10, '#ffffff');
      }
      for (let x = 0; x < 16; x += 4) P(c, x, 10, 2, 2, '#2a8a4a');
      P(c, 0, 12, 16, 2, 'rgba(0,0,0,.25)');
    },
    shopfront: (c, { rng }) => {
      P(c, 0, 0, 16, 16, '#9a4a3a');
      P(c, 1, 0, 14, 13, '#333');
      P(c, 2, 1, 12, 11, '#a8d0e8');
      P(c, 2, 1, 12, 1, '#d8f0ff');
      for (let x = 3; x < 13; x += 3) P(c, x, 11 - rng.int(2, 4), 2, rng.int(2, 4), rng.pick(['#ff3a5a', '#ffd35a', '#3ac48a', '#3a7ad8']));
      P(c, 3, 2, 2, 5, 'rgba(255,255,255,.5)');
      P(c, 0, 13, 16, 3, '#6e3328');
    },
    shop_entrance: (c) => {
      P(c, 0, 0, 16, 16, '#9a4a3a');
      P(c, 2, 0, 12, 16, '#222');
      P(c, 3, 1, 10, 15, '#5aa0d0');
      P(c, 3, 1, 3, 15, '#8ac4ec');
      P(c, 7, 1, 1, 15, '#222');
      P(c, 9, 8, 2, 1, '#ccc');
    },
    // parking souterrain : béton
    cliff: (c, { variant }) => {
      P(c, 0, 0, 16, 16, '#8a8a86');
      P(c, 0, 0, 16, 1, '#a8a8a2');
      P(c, 0, 7, 16, 1, '#6e6e6a');
      P(c, 0, 15, 16, 1, '#6e6e6a');
      P(c, variant * 5, 0, 1, 16, '#7a7a76');
      if (variant === 1) for (let x = 0; x < 16; x += 4) (P(c, x, 12, 2, 3, '#e8c547'), P(c, x + 2, 12, 2, 3, '#1a1a1a'));
    },
    cave_mouth: (c) => {
      P(c, 0, 0, 16, 16, '#8a8a86');
      P(c, 1, 4, 14, 12, '#1a1a1e');
      P(c, 5, 0, 6, 4, '#2a5ad8'); // panneau P
      P(c, 7, 1, 1, 2, '#fff');
      P(c, 8, 1, 1, 1, '#fff');
      P(c, 1, 8, 14, 2, '#e8303a'); // barrière
      for (let x = 3; x < 15; x += 4) P(c, x, 8, 2, 2, '#ffffff');
    },
  },
};

// ------------------------------------------------------------ PONT (cassé / réparé), selon l'ambiance
// Le pont relie la rive (rangée du haut) à la rive du bas : planches dans le sens vertical.
const BRIDGES = {
  medieval: { water: '#2f63c9', waterDark: '#2a58b8', wave: '#79a6f2', deck: '#a8743c', deckDark: '#6b4423', deckLight: '#c89a5a', post: '#4a2c18', rail: '#8a5a2c' },
  space: { water: '#05060f', waterDark: '#05060f', wave: '#5a6aa0', deck: '#8b93a7', deckDark: '#4a5266', deckLight: '#c0c7d6', post: '#3a4254', rail: '#4ff0ff' },
  city: { water: '#2a7f8f', waterDark: '#256f7e', wave: '#5ab4c4', deck: '#a8a8a2', deckDark: '#6e6e6a', deckLight: '#c8c8c2', post: '#4a4a46', rail: '#e8c547' },
};
function bridgeTiles(k) {
  const water = (c, frame) => {
    P(c, 0, 0, 16, 16, k.water);
    P(c, 0, 8, 16, 8, k.waterDark);
    const o = frame * 4;
    P(c, (2 + o) % 14, 4, 4, 1, k.wave);
    P(c, (9 + o) % 14, 12, 4, 1, k.wave);
  };
  const posts = (c) => {
    P(c, 1, 0, 2, 16, k.post);
    P(c, 13, 0, 2, 16, k.post);
  };
  return {
    // pont cassé : poteaux, planches arrachées, un trou au milieu (infranchissable)
    bridge_broken: {
      solid: true,
      frames: 2,
      fps: 2,
      props: { edge: null },
      paint: (c, { frame }) => {
        water(c, frame);
        posts(c);
        P(c, 3, 0, 10, 3, k.deck); // bout de tablier côté rive
        P(c, 3, 2, 10, 1, k.deckDark);
        P(c, 4, 3, 3, 2, k.deck); // planche pendante
        P(c, 9, 3, 2, 3, k.deckDark);
        P(c, 3, 13, 10, 3, k.deck); // autre bout
        P(c, 3, 13, 10, 1, k.deckDark);
        P(c, 6, 10, 4, 2, k.deck); // planche qui flotte
        P(c, 6, 10, 4, 1, k.deckLight);
        P(c, 2, 7, 1, 2, '#fff');
      },
    },
    // pont réparé : tablier complet avec garde-corps
    bridge: {
      paint: (c) => {
        water(c, 0);
        P(c, 2, 0, 12, 16, k.deck);
        for (let y = 0; y < 16; y += 3) P(c, 2, y, 12, 1, k.deckDark);
        P(c, 2, 0, 1, 16, k.deckLight);
        P(c, 1, 0, 1, 16, k.rail);
        P(c, 14, 0, 1, 16, k.rail);
        for (const y of [2, 8, 14]) (P(c, 0, y, 2, 2, k.post), P(c, 14, y, 2, 2, k.post));
      },
    },
  };
}

// ------------------------------------------------------------ tuiles haute définition (PC)
const HD_TILES = {
  medieval: {
    floor: (c, o) => grassHD(c, o),
    floor_alt: (c, o) => grassHD(c, { ...o, variant: 2 }),
    path: (c, o) => pathHD(c, o),
    water: (c, o) => waterHD(c, o, { base: '#2f63c9', deep: '#2a58b8', light: '#9ac0f8' }),
    wall: (c, o) => bricksHD(c, '#8a8478', '#4f4a42', '#a9a294', o.rng),
    obstacle: (c, o) => treeHD(c, o),
    bush: (c, o) => bushHD(c, o),
  },
  city: {
    floor_alt: (c, o) => grassHD(c, o, '#5aa04a'),
    water: (c, o) => waterHD(c, o, { base: '#2a7f8f', deep: '#24707e', light: '#8ad4e0' }),
    wall: (c, o) => {
      bricksHD(c, '#9a4a3a', '#6e3328', '#b0604c', o.rng);
      // fenêtre : cadre, vitre en dégradé, reflet, rebord
      P(c, 7, 7, 18, 16, '#2a3a4a');
      P(c, 9, 9, 14, 12, '#7ab0d8');
      P(c, 9, 15, 14, 6, '#6aa0c8');
      P(c, 15, 9, 2, 12, '#2a3a4a');
      P(c, 10, 10, 3, 3, '#e0f0fc');
      P(c, 10, 13, 1, 2, '#c8e4f8');
      P(c, 6, 23, 20, 2, '#d0c8b8');
    },
  },
};

export const THEMES = BASE.map((t) => {
  const x = EXTRA[t.id];
  const pal = { ...x.pal, pet: PETS[t.id] };
  const tiles = { ...t.tiles, bush: { solid: true, props: { cuttable: true, cutTo: 'floor' }, paint: x.bush } };
  for (const [k, v] of Object.entries(BETTER_TILES[t.id] ?? {})) tiles[k] = { ...tiles[k], ...v };
  Object.assign(tiles, caveTiles(CAVE_SHOP[t.id].cave), shopTiles(CAVE_SHOP[t.id].shop));
  // Extérieurs propres à l'ambiance (remplacent la façade générique)
  const ext = EXTERIORS[t.id];
  tiles.awning = { solid: true, props: { shadow: true }, paint: ext.awning };
  tiles.roof_eave = { solid: true, props: { shadow: true }, paint: ext.roof_eave };
  tiles.shopfront = { solid: true, variants: 2, props: { shadow: true }, paint: ext.shopfront };
  tiles.shop_entrance = { paint: ext.shop_entrance };
  tiles.cliff = { solid: true, variants: 3, props: { shadow: true }, paint: ext.cliff };
  tiles.cave_mouth = { paint: ext.cave_mouth };
  Object.assign(tiles, bridgeTiles(BRIDGES[t.id]));
  // Ombres portées sous les murs, obstacles et buissons ; écume au bord de l'eau.
  for (const k of ['wall', 'obstacle', 'bush']) tiles[k] = { ...tiles[k], props: { ...(tiles[k].props ?? {}), shadow: true } };
  tiles.water = { ...tiles.water, props: { ...(tiles.water.props ?? {}), edge: EDGES[t.id] } };
  // PC : tuiles redessinées en haute définition (les autres sont agrandies automatiquement)
  for (const [k, paintHD] of Object.entries(HD_TILES[t.id] ?? {})) tiles[k] = { ...tiles[k], paintHD };
  const objects = objectsSheet(pal);
  objects.paintHD = (c, name) => {
    if (name === 'chest' || name === 'chest_open') return chestHD(c, name === 'chest_open', pal);
    if (name === 'coin') return coinHD(c, pal);
    return false;
  };
  return {
    ...t,
    words: { ...x.words, ...MORE_WORDS[t.id] },
    tiles,
    sprites: {
      chars: { ...chars({ player: PLAYERS[t.id], ...x.people }, SIGNS[t.id]), outline: '#141414' },
      objects: { ...objects, outline: '#141414' },
      icons: iconsSheet(x.pal),
      boss: bossSheet(...BOSSES[t.id]),
    },
  };
});

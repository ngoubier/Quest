// Ambiances de l'essai n°2 : on reprend celles de l'essai n°1 et on y ajoute
// ce que le gameplay demande (buissons, objets, monstres, icônes, vocabulaire).
import { THEMES as BASE, TILE_ROLES as BASE_ROLES, P, humanoid } from '../01-moteur/themes.js';

export const TILE_ROLES = [...BASE_ROLES, 'bush'];

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
    frames: ['heart_full', 'heart_half', 'heart_empty', 'coin', 'key', 'hint', 'bag'],
    paint(c, name) {
      if (name.startsWith('heart')) {
        heart(c, 0, 1, 1, name === 'heart_empty' ? '#333' : p.heart, p.heartLight);
        if (name === 'heart_half') P(c, 4, 1, 3, 6, '#333');
        if (name === 'heart_half') P(c, 3, 1, 1, 6, '#333');
        return;
      }
      if (name === 'coin') return euroCoin(c, 0, 0, 8, p);
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
        for (let i = 0; i < 10; i++) P(c, rng.int(0, 15), rng.int(0, 15), 1, 1, rng.pick(['#3d8530', '#5fb04c']));
        for (let i = 0; i < 2 + variant; i++) tuft(c, rng.int(0, 13), rng.int(1, 13), i % 2 ? '#3a7f2c' : '#6bbf4e');
        if (variant === 2) (P(c, rng.int(2, 13), rng.int(2, 13), 1, 1, '#ffe066'), P(c, rng.int(2, 13), rng.int(2, 13), 1, 1, '#ffffff'));
      },
    },
    path: {
      variants: 2,
      paint: (c, { rng }) => {
        P(c, 0, 0, 16, 16, '#c9a266');
        for (let i = 0; i < 9; i++) P(c, rng.int(0, 15), rng.int(0, 15), 1, 1, rng.pick(['#b08950', '#dcb97f']));
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
  medieval: { boss: 'le Roi Gluant', pet: 'le chiot' },
  space: { boss: 'le Robot Géant', pet: 'le petit drone' },
  city: { boss: 'le Rat Géant', pet: 'le chaton' },
};

export const THEMES = BASE.map((t) => {
  const x = EXTRA[t.id];
  const pal = { ...x.pal, pet: PETS[t.id] };
  const tiles = { ...t.tiles, bush: { solid: true, props: { cuttable: true, cutTo: 'floor' }, paint: x.bush } };
  for (const [k, v] of Object.entries(BETTER_TILES[t.id] ?? {})) tiles[k] = { ...tiles[k], ...v };
  // Ombres portées sous les murs, obstacles et buissons ; écume au bord de l'eau.
  for (const k of ['wall', 'obstacle', 'bush']) tiles[k] = { ...tiles[k], props: { ...(tiles[k].props ?? {}), shadow: true } };
  tiles.water = { ...tiles.water, props: { ...(tiles.water.props ?? {}), edge: EDGES[t.id] } };
  return {
    ...t,
    words: { ...x.words, ...MORE_WORDS[t.id] },
    tiles,
    sprites: {
      chars: { ...chars({ player: PLAYERS[t.id], ...x.people }, SIGNS[t.id]), outline: '#141414' },
      objects: { ...objectsSheet(pal), outline: '#141414' },
      icons: iconsSheet(x.pal),
      boss: bossSheet(...BOSSES[t.id]),
    },
  };
});

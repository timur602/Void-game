
const spriteAtlas = new Image();
spriteAtlas.src = 'assets/void-sprite-sheet.png';

// Exact frame rectangles [x, y, w, h] on the transparent atlas.
// Using fixed rectangles is much more reliable than row-center cropping,
// especially for this atlas where frame spacing is irregular.
const SPRITES = {
  players: {
    void: {
      idle:   [[1329,78,46,55]],
      run:    [[1270,139,42,52],[1329,138,44,52],[1385,139,38,52],[1432,139,36,51],[1476,139,39,51],[1523,139,40,52]],
      jump:   [[1270,196,39,54],[1331,197,43,53],[1390,197,38,52],[1437,197,37,53],[1531,197,35,53],[1575,197,34,53]],
      fall:   [[1265,259,70,49],[1339,258,55,49],[1403,259,47,48],[1457,258,46,49],[1513,258,45,50],[1566,259,54,48]],
      dash:   [[1270,316,43,52],[1329,316,40,52],[1384,316,43,52],[1441,316,41,52],[1499,315,41,53]],
      attack: [[1268,376,50,49],[1330,376,51,49],[1396,377,52,48],[1466,385,45,40],[1524,383,49,42],[1582,396,52,29]],
      hurt:   [[1271,434,45,54],[1340,434,41,54],[1405,434,40,54]],
      death:  [[1273,492,47,46],[1344,492,46,46],[1408,498,58,39],[1470,497,57,40],[1533,505,55,32],[1589,506,52,31]]
    },
    alex: {
      idle:   [[108,14,50,64]],
      run:    [[49,138,39,52],[108,139,43,52],[169,139,37,51],[219,139,36,52],[316,139,37,51],[363,139,35,52]],
      jump:   [[52,196,39,54],[113,197,43,53],[170,196,38,54],[219,197,38,52],[269,196,37,54],[364,197,35,53]],
      fall:   [[43,256,80,51],[138,256,44,51],[196,256,41,51],[249,256,44,51],[306,256,43,51],[360,256,41,51]],
      dash:   [[54,316,41,52],[118,316,41,52],[179,315,40,53],[237,316,41,52],[296,316,43,52]],
      attack: [[46,375,56,50],[111,375,50,50],[168,376,54,48],[225,380,59,42],[287,387,56,35],[349,385,57,36]],
      hurt:   [[49,434,40,54],[117,434,38,55],[184,434,39,55]],
      death:  [[43,493,49,42],[107,492,51,43],[173,494,54,38],[234,498,50,27],[293,500,52,25],[350,500,56,25]]
    },
    mia: {
      idle:   [[529,79,46,53]],
      run:    [[451,138,45,52],[519,139,44,51],[573,139,43,51],[627,139,41,51],[733,139,37,51],[782,139,37,51]],
      jump:   [[453,196,44,54],[518,197,45,53],[582,197,35,53],[630,197,38,53],[737,197,36,53],[786,197,37,53]],
      fall:   [[447,258,74,49],[526,257,50,50],[584,258,50,49],[643,258,49,49],[703,258,49,49],[756,258,56,49]],
      dash:   [[461,316,40,52],[516,316,46,52],[578,316,46,52],[642,316,43,52],[705,316,41,52]],
      attack: [[453,376,60,49],[522,377,71,48],[598,387,61,37],[663,390,61,33],[727,397,51,26],[783,397,51,26]],
      hurt:   [[459,435,42,53],[526,435,44,53],[595,435,38,53]],
      death:  [[452,493,50,43],[520,493,57,42],[586,501,54,33],[646,501,53,32],[704,501,59,31],[767,501,63,31]]
    },
    kai: {
      idle:   [[932,78,48,54]],
      run:    [[871,138,44,52],[930,138,46,52],[984,138,41,52],[1036,138,37,52],[1133,138,37,52],[1183,138,36,53]],
      jump:   [[874,197,40,53],[933,197,42,53],[989,197,39,53],[1040,197,35,53],[1087,197,36,53],[1185,197,34,53]],
      fall:   [[859,258,75,49],[940,257,51,50],[997,257,49,50],[1054,257,48,50],[1111,257,47,50],[1169,257,45,50]],
      dash:   [[872,316,43,52],[932,316,40,52],[988,315,42,53],[1047,316,41,52],[1105,316,42,52]],
      attack: [[872,376,61,49],[935,376,60,49],[997,377,63,48],[1059,377,60,48],[1121,396,52,29],[1177,396,56,29]],
      hurt:   [[879,434,42,54],[943,434,40,55],[1003,434,41,54]],
      death:  [[871,492,53,44],[934,490,48,46],[993,501,57,33],[1055,502,56,29],[1114,503,59,28],[1177,503,56,28]]
    }
  },
  enemies: {
    hunter: {
      idle:   [[87,562,34,44]],
      run:    [[117,614,38,46],[171,614,34,46],[216,614,32,46],[257,614,31,46]],
      jump:   [[59,665,32,48],[121,665,32,48],[164,666,34,47]],
      fall:   [[59,665,32,48],[121,665,32,48],[164,666,34,47]],
      attack: [[56,717,40,45],[122,718,40,44],[176,718,42,44],[225,730,55,31]],
      hurt:   [[59,665,32,48],[121,665,32,48],[164,666,34,47]],
      death:  [[56,717,40,45],[122,718,40,44],[176,718,42,44],[225,730,55,31]]
    },
    guardian: {
      idle:   [[470,560,45,93]],
      run:    [[470,560,45,93],[521,561,46,95],[571,561,47,92],[623,560,46,93]],
      jump:   [[381,650,70,53],[469,655,50,47],[524,657,47,45]],
      fall:   [[381,650,70,53],[469,655,50,47],[524,657,47,45]],
      attack: [[382,708,63,54],[467,710,59,52],[539,713,57,49],[603,713,50,49]],
      hurt:   [[381,650,70,53],[469,655,50,47],[524,657,47,45]],
      death:  [[382,708,63,54],[467,710,59,52],[539,713,57,49],[603,713,50,49]]
    }
  }
};

// Animation timing metadata used by player.js and enemy.js.
// Keep these compatible with the real number of crop rectangles above.
const PLAYER_ROWS = Object.fromEntries(
  Object.entries(SPRITES.players.void).map(([state, frames]) => [
    state, { frames: frames.length, speed: ({idle:10,run:6,jump:7,fall:8,dash:3,attack:4,hurt:6,death:8})[state] || 7 }
  ])
);
const ENEMY_ROWS = Object.fromEntries(
  Object.entries(SPRITES.enemies.hunter).map(([state, frames]) => [
    state, { frames: frames.length, speed: ({idle:11,run:8,jump:8,fall:8,attack:6,hurt:6,death:9})[state] || 8 }
  ])
);

function getSpriteFrames(type, state, enemy=false){
  const group = enemy ? SPRITES.enemies : SPRITES.players;
  const sheet = group[type] || (enemy ? group.hunter : group.void);
  return sheet[state] || sheet.idle;
}

function drawAtlasCharacter(ctx, type, state, frame, x, y, width, height, facing=1, enemy=false) {
  if (!spriteAtlas.complete || !spriteAtlas.naturalWidth) return false;
  const frames = getSpriteFrames(type, state, enemy);
  if (!frames || !frames.length) return false;
  const rect = frames[Math.max(0, Math.min(frames.length - 1, Math.floor(frame) % frames.length))];
  if (!rect) return false;
  const [sx, sy, sw, sh] = rect;
  if (![sx, sy, sw, sh].every(Number.isFinite) || sw <= 0 || sh <= 0) return false;

  // Scale from source frame size and anchor at bottom-center of the gameplay hitbox.
  let scale = enemy ? 1.28 : 1.22;
  if (type === 'guardian') scale = 1.05;
  if (state === 'death') scale = enemy ? 1.15 : 1.15;
  const dw = sw * scale;
  const dh = sh * scale;
  const dx = (width - dw) / 2;
  const dy = height - dh;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (facing < 0) {
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    ctx.drawImage(spriteAtlas, sx, sy, sw, sh, width - dx - dw, dy, dw, dh);
  } else {
    ctx.translate(x, y);
    ctx.drawImage(spriteAtlas, sx, sy, sw, sh, dx, dy, dw, dh);
  }
  ctx.restore();
  return true;
}

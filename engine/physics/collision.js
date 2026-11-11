// Déplacement avec collisions, façon jeux d'aventure 2D vue de dessus.
// On avance axe par axe, par pas d'au plus 1 pixel : pas de "traversée" de murs,
// et glissement naturel le long des parois.

/**
 * Déplace `body` sur un axe. Renvoie true si un obstacle a stoppé le mouvement.
 * @param {{x:number,y:number,w:number,h:number}} body
 * @param {'x'|'y'} axis
 * @param {number} amount
 * @param {(x:number,y:number,w:number,h:number)=>boolean} isBlocked
 */
export function moveAxis(body, axis, amount, isBlocked) {
  let remaining = amount;
  const sign = Math.sign(amount);
  while (remaining !== 0) {
    const step = Math.abs(remaining) > 1 ? sign : remaining;
    const nx = axis === 'x' ? body.x + step : body.x;
    const ny = axis === 'y' ? body.y + step : body.y;
    if (isBlocked(nx, ny, body.w, body.h)) {
      // On essaie de se coller exactement au bord (positions entières).
      const cur = body[axis];
      const snap = sign > 0 ? Math.ceil(cur) : Math.floor(cur);
      if (snap !== cur && Math.abs(snap - cur) < Math.abs(step)) {
        const sx = axis === 'x' ? snap : body.x;
        const sy = axis === 'y' ? snap : body.y;
        if (!isBlocked(sx, sy, body.w, body.h)) body[axis] = snap;
      }
      return true;
    }
    body.x = nx;
    body.y = ny;
    remaining -= step;
  }
  return false;
}

/**
 * Déplace `body` de (dx, dy) en glissant contre les obstacles.
 * `cornerAssist` (en pixels) : si on bute contre un coin de presque rien,
 * on est poussé de côté pour passer (comme dans les Zelda classiques).
 * @returns {{hitX:boolean, hitY:boolean, nudged:boolean}}
 */
export function moveAndSlide(body, dx, dy, isBlocked, { cornerAssist = 0 } = {}) {
  const hitX = dx !== 0 && moveAxis(body, 'x', dx, isBlocked);
  const hitY = dy !== 0 && moveAxis(body, 'y', dy, isBlocked);
  let nudged = false;
  if (cornerAssist > 0) {
    if (hitX && dy === 0) nudged = nudge(body, 'x', dx, isBlocked, cornerAssist);
    else if (hitY && dx === 0) nudged = nudge(body, 'y', dy, isBlocked, cornerAssist);
  }
  return { hitX, hitY, nudged };
}

function nudge(body, axis, amount, isBlocked, maxOffset) {
  const other = axis === 'x' ? 'y' : 'x';
  const probe = Math.sign(amount);
  for (let off = 1; off <= maxOffset; off++) {
    for (const s of [-1, 1]) {
      const test = { x: body.x, y: body.y, w: body.w, h: body.h };
      test[other] += s * off;
      if (isBlocked(test.x, test.y, test.w, test.h)) continue;
      test[axis] += probe;
      if (isBlocked(test.x, test.y, test.w, test.h)) continue;
      // Le passage est libre en se décalant de `off` : on glisse dans cette direction.
      moveAxis(body, other, s * Math.min(Math.abs(amount), off), isBlocked);
      return true;
    }
  }
  return false;
}

// Audit d'affichage : ouvre l'essai n°2 en largeur téléphone, passe par tous les écrans
// et liste les textes qui sortent de l'écran. Usage : npm start, puis
//   node tools/audit-textes.cjs <dossier-captures> [shots]
// (nécessite Playwright et Chromium)
// Audit : parcourt les écrans en largeur téléphone et relève les textes qui sortent de l'écran.
const { chromium, devices } = require('playwright');
const SP = process.argv[2];
const SHOTS = process.argv[3] === 'shots';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message + ' ' + e.stack.split('\n')[1]));
  await p.goto('http://localhost:8099/demos/02-gameplay/');
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500);
  await p.evaluate(() => {
    window.__over = new Map();
    const r = quest.renderer;
    const orig = r.text.bind(r);
    r.text = (str, x, y, o = {}) => {
      const size = o.size ?? 8;
      const w = r.measure(String(str), size, o.font, o.bold);
      const align = o.align ?? 'left';
      // coordonnées écran (hors monde) seulement : on ignore le texte dessiné dans le monde
      const m = r.ctx.getTransform();
      const sx = (m.e / r.scale) + x, sy = m.f / r.scale + y;
      const x0 = align === 'center' ? sx - w / 2 : align === 'right' ? sx - w : sx;
      if (x0 < 5 || x0 + w > r.width - 5 || sy < 0 || sy > r.height - 4) {
        const key = `${quest.scenes.top.constructor.name} | ${String(str).slice(0, 70)}`;
        if (!window.__over.has(key)) window.__over.set(key, `x=${x0.toFixed(0)}..${(x0 + w).toFixed(0)} y=${sy.toFixed(0)} (largeur ${r.width})`);
      }
      return orig(str, x, y, o);
    };
  });
  const W = (ms) => p.waitForTimeout(ms);
  const A = async (ms = 300) => { await p.evaluate(() => quest.input.setVirtual('action', true)); await W(60); await p.evaluate(() => quest.input.setVirtual('action', false)); await W(ms); };
  const V = async (a, ms = 200) => { await p.evaluate((a) => quest.input.setVirtual(a, true), a); await W(60); await p.evaluate((a) => quest.input.setVirtual(a, false), a); await W(ms); };
  const top = () => p.evaluate(() => quest.scenes.top.constructor.name);
  let n = 0;
  const shot = async (name) => { await W(150); if (SHOTS) await p.screenshot({ path: `${SP}/au-${String(++n).padStart(2, '0')}-${name}.png` }); };
  const popAll = () => p.evaluate(() => { while (quest.scenes.stack.length > 1) quest.scenes.pop(); });
  // Titre, profil
  await shot('titre');
  await A(400);
  await p.locator('input').fill(''); await p.locator('input').press('Enter'); await W(300); // erreur prénom vide
  await shot('prenom-vide');
  await p.locator('input').fill('Anne-Charlotte'); await p.locator('input').press('Enter'); await W(400);
  await shot('age');
  await A(1300);
  await p.evaluate(() => { quest.scenes.stack[0].toasts = []; });
  // Toasts longs
  await p.evaluate(() => { const a = quest.scenes.stack[0]; a.quests.start('bouquet'); });
  await shot('toast-quete'); await W(2200);
  await p.evaluate(() => { const a = quest.scenes.stack[0]; a.toast('Ton compagnon a trouvé un indice !'); a.toast('La potion te sauve !'); });
  await shot('toast');
  await p.evaluate(() => { quest.scenes.stack[0].toasts = []; });
  // Dialogues avec choix (PNJ)
  const talk = async (tx, ty, f, name) => { await p.evaluate(([tx, ty, f]) => { const a = quest.scenes.stack[0]; a.hero.x = tx * 16 + 3; a.hero.y = ty * 16 + 6; a.hero.facing = f; a.toasts = []; }, [tx, ty, f]); await A(2500); await shot(name); for (let i = 0; i < 6 && (await top()) === 'DialogScene'; i++) { await A(1500); await shot(name + i); } };
  await talk(5, 6, 'up', 'ancien');
  await popAll();
  await talk(11, 6, 'up', 'cuisiniere'); await popAll();
  await talk(3, 13, 'up', 'maitresse'); await popAll();
  // Toutes les sortes d'énigmes, réponses fausses, indices sans compteur
  await p.evaluate(async () => {
    const { QUESTIONS_FR, QUESTIONS_DICTEE, MATHS_GENERATOR } = await import('/content/quiz/index.js');
    const { createRng } = await import('/engine/index.js');
    const rng = createRng(3);
    const qs = [
      QUESTIONS_FR.find(q => q.id === 'hist-grottes'), QUESTIONS_FR.find(q => q.id === 'hist-jeanne'), QUESTIONS_FR.find(q => q.id === 'fr-homo-son'),
      QUESTIONS_FR.find(q => q.id === 'geo-ocean-ouest'), QUESTIONS_FR.find(q => q.id === 'conj-manger-pc'), QUESTIONS_FR.find(q => q.id === 'img-elephant'),
      QUESTIONS_DICTEE.find(q => q.answer === 'hélicoptère'), QUESTIONS_DICTEE.find(q => q.answer === 'aujourd’hui'),
      ...Array.from({ length: 8 }, () => MATHS_GENERATOR.make(rng, 10)), ...Array.from({ length: 4 }, () => MATHS_GENERATOR.make(rng, 9)),
    ];
    const a = quest.scenes.stack[0];
    a.state.items.hint = 0;
    a.cfg.questionBank = { subjects: () => ['histoire'], pick: () => qs.splice(0) };
    a.quiz({ count: qs.length }, () => {}, 'Mme Lili, la maîtresse');
  });
  for (let i = 0; i < 25 && (await top()) === 'QuizScene'; i++) {
    const st = await p.evaluate(() => { const z = quest.scenes.top; return { phase: z.phase, type: z.q?.type }; });
    if (st.phase === 'ask') {
      await shot('q-' + st.type);
      await V('hint', 300); // pas d'indice
      await p.evaluate(() => quest.scenes.top._hint()); await W(150);
      await shot('q-indice-vide');
      if (st.type === 'choice') await A(500);
      else { await p.locator('input').fill('mauvaise réponse très longue'); await p.locator('input').press('Enter'); await W(500); }
      await shot('q-faux');
      await A(700);
    } else { await shot('q-' + st.phase); await A(700); }
  }
  await popAll();
  // Indices avec compteur
  await p.evaluate(() => { const a = quest.scenes.stack[0]; a.state.give('hint', 5); a.state.give('coin', 50); });
  // Magasin
  await p.evaluate(() => { const a = quest.scenes.stack[0]; a.loadMap('shop', { tx: 7, ty: 4, facing: 'up' }); });
  await W(400);
  await A(3000); await A(600);
  await shot('magasin');
  for (let i = 0; i < 9; i++) { await A(250); await shot('magasin-achat' + i); await V('down', 150); }
  await V('up', 150); await A(250); await shot('magasin-plein');
  await popAll();
  // Sac plein + description + jeter objet de quête
  await p.evaluate(() => { const a = quest.scenes.stack[0]; for (const it of ['potion','ribbon','nails','mushroom','flowers','planks','tarte','bouquet','amulet']) a.state.give(it, 1); a.openBag(); });
  for (let i = 0; i < 10; i++) { await shot('sac' + i); await V('right', 120); }
  await A(300); await shot('sac-menu'); await A(300); await shot('sac-msg');
  await popAll();
  await p.evaluate(() => { const a = quest.scenes.stack[0]; a.collect('apple', 1); }); await shot('toast-sac-plein');
  // Quêtes, menu, indices
  await p.evaluate(() => { const a = quest.scenes.stack[0]; ['relic','bridge','harvest','hunt'].forEach(q => a.quests.start(q)); a.quests.revealHint('relic'); a.quests.revealHint('relic'); a.openQuests(); });
  await shot('quetes'); await popAll();
  await p.evaluate(() => quest.scenes.stack[0].openMenu()); await shot('menu'); await popAll();
  await p.evaluate(() => quest.scenes.stack[0].openHints()); await shot('indices'); await A(400); await shot('indice-dialog'); await A(1500); await A(800); await popAll();
  // Coffre / porte fermée / sac plein coffre
  await p.evaluate(() => { const a = quest.scenes.stack[0]; a.loadMap('cave', { tx: 18, ty: 5, facing: 'left' }); a.state.setFlag('cave_hall_cleared'); a.state.bagSize = 1; });
  await W(500);
  await p.evaluate(() => { const a = quest.scenes.stack[0]; const d = a.world.entities.find(e => e.has('locked')); a.state.items.key = 0; d.onBump(a.hero); });
  await shot('porte-fermee');
  await p.evaluate(() => { const a = quest.scenes.stack[0]; const c = a.world.entities.find(e => e.has('chest') && e.present && !e.opened); c?.talk(); });
  await W(1500); await shot('coffre-sac-plein'); await popAll();
  // Défaite, fin, espace parents
  await p.evaluate(() => { const a = quest.scenes.stack[0]; a.gameOver(); }); await shot('defaite'); await popAll();
  await p.evaluate(() => { quest.scenes.stack[0].state.setFlag('game_finished'); });
  await p.evaluate(async () => { const { EndScene } = await import('/gameplay/index.js'); const a = quest.scenes.stack[0]; quest.scenes.push(new EndScene(a, a.cfg.end)); });
  await shot('fin');
  await V('down'); await A(500);
  await p.locator('input').fill('12'); await p.locator('input').press('Enter'); await W(300); await shot('code-court');
  await p.locator('input').fill('1234'); await p.locator('input').press('Enter'); await W(400);
  await shot('parents');
  await A(400); await shot('parents-profil');
  await A(400); for (let i = 0; i < 6; i++) { await shot('bilan' + i); await V('right', 200); }
  await V('secondary', 300);
  await V('down'); await V('down'); await A(400); await shot('questions-perso');
  await A(400); await shot('dictee-perso'); await p.locator('input').fill('hibou'); await p.locator('input').press('Enter'); await W(300);
  await V('down'); await A(400); await shot('question-matiere'); await A(400); await shot('question-texte'); await p.locator('input').fill('Quelle est la couleur du cheval blanc d’Henri IV ?'); await p.locator('input').press('Enter'); await W(300); await shot('question-reponse');
  await popAll();
  for (const [k, v] of await p.evaluate(() => [...window.__over.entries()])) console.log(k + '   :: ' + v);
  console.log('errors', errs);
  await b.close();
})();

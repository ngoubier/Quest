import { check } from './conditions.js';

// LANGAGE D'ACTIONS — décrit "ce qui se passe" (dialogues de PNJ, récompenses de quêtes,
// coffres, déclencheurs...). Une liste d'actions s'exécute dans l'ordre ; les dialogues
// attendent que le joueur les ferme avant de continuer.
//
//   { say: 'texte' | ['page 1', 'page 2'], speaker?: 'Nom' }
//   { ask: 'question', choices: [{ label: 'Oui', do: [...] }, { label: 'Non', do: [...] }] }
//   { give: 'coin', count?: 10, announce?: true }   { take: 'mushroom', count?: 3 }
//   { setFlag: 'x' }  { clearFlag: 'x' }
//   { addCounter: 'x', by?: 1 }  { setCounter: 'x', value: 0 }
//   { startQuest: 'id' }
//   { heal: 2 | 'full' }  { maxHp: +2 }
//   { sound: 'nom' }  { toast: 'texte' }
//   { if: condition, then: [...], else: [...] }
//   { quiz: { subject?: 'maths', count?: 3, pass?: 3 },      questions scolaires adaptées à l'âge
//     perCorrect?: { give: 'coin', count: 2 },                 récompense par bonne réponse
//     success?: [...], failure?: [...] }                       selon que `pass` est atteint
//   { shop: { id, title?, offers: [{ item, price, once? }] } } ouvre une boutique
//   { call: (ctx) => {} }      échappatoire en JavaScript pour les cas spéciaux
//
// `ctx` est fourni par le jeu (AdventureScene) : { state, quests, say, ask, toast, collect, game }.

export function runActions(list, ctx, done) {
  const queue = list == null ? [] : Array.isArray(list) ? [...list] : [list];
  const next = () => {
    const a = queue.shift();
    if (!a) return done?.();
    exec(a, ctx, next);
  };
  next();
}

function exec(a, ctx, next) {
  const s = ctx.state;
  if ('say' in a) return ctx.say(a.say, { speaker: a.speaker ?? ctx.speaker, onClose: next });
  if ('ask' in a) {
    return ctx.ask(a.ask, {
      speaker: a.speaker ?? ctx.speaker,
      choices: a.choices.map((c) => ({ label: c.label, onSelect: () => runActions(c.do, ctx, next) })),
    });
  }
  if ('if' in a) return runActions(check(a.if, s) ? a.then : a.else, ctx, next);
  if ('quiz' in a) {
    return ctx.quiz(a.quiz, (res) => {
      const list = [];
      if (a.perCorrect && res.correct > 0) list.push({ give: a.perCorrect.give, count: a.perCorrect.count * res.correct, announce: true });
      const pass = a.quiz.pass ?? a.quiz.count ?? 3;
      list.push(...[].concat((res.correct >= pass ? a.success : a.failure) ?? []));
      runActions(list, ctx, next);
    });
  }
  if ('shop' in a) return ctx.shop(a.shop, next);
  if ('give' in a) {
    ctx.collect(a.give, a.count ?? 1);
    if (a.announce) return ctx.announce(a.give, a.count ?? 1, next);
  } else if ('take' in a) s.take(a.take, a.count ?? 1);
  else if ('setFlag' in a) s.setFlag(a.setFlag, a.value ?? true);
  else if ('clearFlag' in a) s.setFlag(a.clearFlag, false);
  else if ('addCounter' in a) s.addCounter(a.addCounter, a.by ?? 1);
  else if ('setCounter' in a) s.setCounter(a.setCounter, a.value ?? 0);
  else if ('startQuest' in a) ctx.quests.start(a.startQuest);
  else if ('heal' in a) s.heal(a.heal === 'full' ? s.maxHp : a.heal);
  else if ('maxHp' in a) s.setMaxHp(s.maxHp + a.maxHp, true);
  else if ('sound' in a) ctx.game?.audio.play(a.sound);
  else if ('toast' in a) ctx.toast(a.toast);
  else if ('call' in a) a.call(ctx);
  else throw new Error(`Action inconnue : ${JSON.stringify(a)}`);
  next();
}

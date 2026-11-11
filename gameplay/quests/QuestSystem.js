import { check } from '../script/conditions.js';
import { runActions } from '../script/actions.js';

// QUÊTES — principales et secondaires utilisent le même système.
//
// {
//   id: 'amulette', kind: 'main' | 'side', title: "L'amulette de l'Ancien",
//   steps: [
//     { goal: 'Trouver l\'amulette dans la grotte', done: { item: 'amulet' }, onDone: [...] },
//     { goal: 'La rapporter à l\'Ancien',            done: { flag: 'amulet_returned' } },
//   ],
//   onStart: [...], rewards: [...]
// }
//
// Une étape est terminée dès que sa condition `done` est vraie : l'état est réévalué
// à chaque changement (objet ramassé, drapeau levé, monstre vaincu...).
// Une étape peut donc être validée AVANT d'avoir été annoncée (ex. on a déjà les objets).

export class QuestSystem {
  /** @param ctx contexte d'actions (voir script/actions.js) : { state, toast, game, ... } */
  constructor(ctx, defs = []) {
    this.ctx = ctx;
    this.state = ctx.state;
    this.defs = new Map(defs.map((d) => [d.id, d]));
    this._busy = false;
    this._again = false;
    this._off = this.state.events.on('change', () => this.evaluate());
  }

  dispose() {
    this._off();
  }

  def(id) {
    const d = this.defs.get(id);
    if (!d) throw new Error(`Quête "${id}" inconnue`);
    return d;
  }

  status(id) {
    return this.state.questStatus(id);
  }

  start(id) {
    if (this.status(id) !== 'none') return;
    const d = this.def(id);
    this.state.quests[id] = { status: 'active', step: 0 };
    this.ctx.toast?.(`Nouvelle quête : ${d.title}`);
    this.ctx.game?.audio.play('quest');
    runActions(d.onStart, this.ctx);
    this.evaluate();
  }

  /** Étape en cours (définition) ou null. */
  currentStep(id) {
    const q = this.state.quests[id];
    if (!q || q.status !== 'active') return null;
    return this.def(id).steps[q.step];
  }

  /** Quêtes à afficher dans le journal : actives d'abord, principales d'abord. */
  journal() {
    const out = [];
    for (const [id, d] of this.defs) {
      const st = this.status(id);
      if (st === 'none') continue;
      out.push({ id, title: d.title, kind: d.kind ?? 'side', status: st, goal: this.currentStep(id)?.goal ?? null });
    }
    const rank = (q) => (q.status === 'active' ? 0 : 2) + (q.kind === 'main' ? 0 : 1);
    return out.sort((a, b) => rank(a) - rank(b));
  }

  evaluate() {
    if (this._busy) {
      this._again = true;
      return;
    }
    this._busy = true;
    try {
      do {
        this._again = false;
        for (const [id, d] of this.defs) {
          const q = this.state.quests[id];
          if (!q || q.status !== 'active') continue;
          const step = d.steps[q.step];
          if (!check(step.done, this.state)) continue;
          q.step++;
          runActions(step.onDone, this.ctx);
          if (q.step >= d.steps.length) {
            q.status = 'done';
            delete q.step;
            this.ctx.toast?.(`Quête terminée : ${d.title}`);
            this.ctx.game?.audio.play('quest_done');
            runActions(d.rewards, this.ctx);
            this.ctx.game?.events.emit('quest:done', { id });
          } else {
            this.ctx.toast?.(d.steps[q.step].goal);
            this.ctx.game?.events.emit('quest:step', { id, step: q.step });
          }
          this._again = true;
        }
      } while (this._again);
    } finally {
      this._busy = false;
    }
  }
}

import { check } from '../script/conditions.js';
import { runActions } from '../script/actions.js';

// QUÊTES — principales et secondaires utilisent le même système.
//
// {
//   id: 'amulette', kind: 'main' | 'side', title: "L'amulette de l'Ancien",
//   difficulty: 1 | 2 | 3,   // facile · moyenne · difficile (affichée dans la liste des quêtes)
//   steps: [
//     { goal: 'Trouver l\'amulette dans la grotte', done: { item: 'amulet' }, onDone: [...],
//       hints: ['indice 1 (vague)', 'indice 2 (plus précis)'] },
//     // Embranchement : l'objectif affiché dépend des choix du joueur
//     { goal: [{ when: 'choix_a', text: 'Faire A' }, { text: 'Faire B' }], done: { any: ['a_fait', 'b_fait'] } },
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

  /** Texte de l'objectif d'une étape (gère les variantes conditionnelles). */
  goalText(step) {
    if (!step) return null;
    if (!Array.isArray(step.goal)) return step.goal;
    return step.goal.find((g) => check(g.when, this.state))?.text ?? null;
  }

  // ------------------------------------------------------------ indices
  /** Indices déjà révélés pour l'étape en cours d'une quête. */
  revealedHints(id) {
    const q = this.state.quests[id];
    const step = this.currentStep(id);
    if (!q || !step) return [];
    return (step.hints ?? []).slice(0, q.hints ?? 0);
  }

  /** Reste-t-il un indice à révéler pour cette quête ? */
  hasMoreHints(id) {
    const step = this.currentStep(id);
    return !!step && (this.state.quests[id].hints ?? 0) < (step.hints ?? []).length;
  }

  /** Révèle l'indice suivant (le coût est géré par l'appelant). Renvoie le texte ou null. */
  revealHint(id) {
    if (!this.hasMoreHints(id)) return null;
    const q = this.state.quests[id];
    q.hints = (q.hints ?? 0) + 1;
    this.state.addCounter('hints_used');
    return this.currentStep(id).hints[q.hints - 1];
  }

  /** Quêtes à afficher dans le journal : actives d'abord, principales d'abord. */
  journal() {
    const out = [];
    for (const [id, d] of this.defs) {
      const st = this.status(id);
      if (st === 'none') continue;
      out.push({ id, title: d.title, kind: d.kind ?? 'side', status: st, goal: this.goalText(this.currentStep(id)), hints: this.revealedHints(id) });
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
          q.hints = 0;
          runActions(step.onDone, this.ctx);
          if (q.step >= d.steps.length) {
            q.status = 'done';
            delete q.step;
            this.ctx.toast?.(`Quête terminée : ${d.title}`);
            this.ctx.game?.audio.play('quest_done');
            runActions(d.rewards, this.ctx);
            this.ctx.game?.events.emit('quest:done', { id });
          } else {
            this.ctx.toast?.(this.goalText(d.steps[q.step]));
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

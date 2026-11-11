import { SUBJECTS } from './QuestionBank.js';

// Données du bilan pour les parents, calculées à partir de l'état sauvegardé.
export function buildReport(state, { questDefs = [] } = {}) {
  const stats = state.quiz?.stats ?? {};
  const subjects = Object.entries(stats)
    .map(([id, s]) => ({ id, name: SUBJECTS[id] ?? id, ok: s.ok, total: s.total, rate: s.total ? s.ok / s.total : 0 }))
    .sort((a, b) => b.total - a.total);
  const total = subjects.reduce((n, s) => n + s.total, 0);
  const ok = subjects.reduce((n, s) => n + s.ok, 0);
  const missed = Object.values(state.quiz?.missed ?? {})
    .filter((m) => !m.fixed)
    .sort((a, b) => b.wrong - a.wrong || b.at - a.at);
  const fixed = Object.values(state.quiz?.missed ?? {}).filter((m) => m.fixed).length;
  const quests = questDefs.map((d) => ({ title: d.title, status: state.questStatus(d.id) }));
  // Points forts / à travailler : matières avec au moins 3 questions.
  const ranked = subjects.filter((s) => s.total >= 3).sort((a, b) => b.rate - a.rate);
  return {
    age: state.profile?.age,
    playTime: state.playTime ?? 0,
    total,
    ok,
    rate: total ? ok / total : 0,
    subjects,
    // Point fort : bien réussi (≥ 60 %) ; à travailler : moins de 75 % et différent du point fort.
    strongest: ranked[0] && ranked[0].rate >= 0.6 ? ranked[0] : null,
    weakest: ranked.length && ranked[ranked.length - 1].rate < 0.75 && ranked[ranked.length - 1] !== ranked[0] ? ranked[ranked.length - 1] : ranked.length === 1 && ranked[0].rate < 0.6 ? ranked[0] : null,
    missed,
    fixed,
    hintsUsed: state.counter('hints_used'),
    questsDone: quests.filter((q) => q.status === 'done').length,
    questsTotal: quests.length,
  };
}

export function formatPlayTime(sec) {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  return h ? `${h} h ${String(m % 60).padStart(2, '0')}` : `${m} min`;
}

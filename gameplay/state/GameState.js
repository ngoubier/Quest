import { EventBus } from '../../engine/index.js';

// L'ÉTAT DU JEU : tout ce qui doit être sauvegardé et que les quêtes / énigmes consultent.
//  - flags     : vrai/faux    ex. 'coffre_donjon1_ouvert', 'porte_nord_deverrouillee'
//  - counters  : nombres      ex. 'kills_blob' (monstres vaincus)
//  - items     : inventaire   ex. { coin: 42, key: 1, amulet: 1 }
//  - hp/maxHp  : vie du héros, en demi-cœurs (6 = 3 cœurs)
//  - quests    : progression  ex. { amulette: { status: 'active', step: 1 } }
//  - profile   : le joueur    ex. { age: 8 } (adapte la difficulté des questions)
//  - quiz      : questions déjà vues, statistiques par matière, erreurs à retravailler
//  - playTime  : temps de jeu (s) ; cooldowns : délais d'attente (en temps de jeu)
// Chaque modification émet 'change' : les quêtes et les énigmes se réévaluent.

export class GameState {
  constructor({ maxHp = 6 } = {}) {
    this.events = new EventBus();
    this.reset(maxHp);
  }

  reset(maxHp = 6) {
    this.flags = {};
    this.counters = {};
    this.items = {};
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.quests = {};
    this.profile = this.profile ?? { age: 8 };
    this.quiz = { seen: [], stats: {}, missed: {} };
    this.playTime = 0;
    this.cooldowns = {};
    this.bagSize = 10;
  }

  // --- délais (ex. attendre avant de retenter des questions)
  setCooldown(key, seconds) {
    this.cooldowns[key] = this.playTime + seconds;
  }

  cooldownLeft(key) {
    return Math.max(0, (this.cooldowns[key] ?? 0) - this.playTime);
  }

  // --- questions scolaires
  recordQuiz(results) {
    for (const r of results) {
      if (r.id && !r.id.startsWith('gen:')) {
        this.quiz.seen = this.quiz.seen.filter((id) => id !== r.id);
        this.quiz.seen.push(r.id);
      }
      const st = (this.quiz.stats[r.subject] ??= { ok: 0, total: 0 });
      st.total++;
      if (r.ok) st.ok++;
      // Erreurs à retravailler (pour le bilan des parents).
      const key = r.id ?? r.prompt;
      const m = this.quiz.missed[key];
      if (!r.ok) this.quiz.missed[key] = { prompt: r.prompt, answer: r.answer, subject: r.subject, wrong: (m?.wrong ?? 0) + 1, fixed: false, at: this.playTime };
      else if (m) m.fixed = true;
    }
    const keys = Object.keys(this.quiz.missed);
    if (keys.length > 60) {
      keys.sort((a, b) => this.quiz.missed[a].at - this.quiz.missed[b].at);
      for (const k of keys.slice(0, keys.length - 60)) delete this.quiz.missed[k];
    }
    if (this.quiz.seen.length > 300) this.quiz.seen = this.quiz.seen.slice(-300);
    this._changed('quiz');
  }

  _changed(kind, key) {
    this.events.emit('change', { kind, key });
  }

  // --- drapeaux
  flag(name) {
    return !!this.flags[name];
  }

  setFlag(name, value = true) {
    if (this.flag(name) === !!value) return;
    if (value) this.flags[name] = true;
    else delete this.flags[name];
    this._changed('flag', name);
  }

  // --- compteurs
  counter(name) {
    return this.counters[name] || 0;
  }

  addCounter(name, by = 1) {
    this.counters[name] = this.counter(name) + by;
    this._changed('counter', name);
  }

  setCounter(name, value) {
    this.counters[name] = value;
    this._changed('counter', name);
  }

  // --- inventaire
  count(item) {
    return this.items[item] || 0;
  }

  give(item, n = 1, max = Infinity) {
    this.items[item] = Math.min(max, this.count(item) + n);
    this._changed('item', item);
  }

  /** Retire n exemplaires. Renvoie false (et ne retire rien) s'il n'y en a pas assez. */
  take(item, n = 1) {
    if (this.count(item) < n) return false;
    this.items[item] -= n;
    if (this.items[item] <= 0) delete this.items[item];
    this._changed('item', item);
    return true;
  }

  // --- vie
  heal(n) {
    this.hp = Math.min(this.maxHp, this.hp + n);
    this._changed('hp');
  }

  damage(n) {
    this.hp = Math.max(0, this.hp - n);
    this._changed('hp');
    return this.hp;
  }

  setMaxHp(n, fill = false) {
    this.maxHp = n;
    if (fill) this.hp = n;
    this.hp = Math.min(this.hp, n);
    this._changed('hp');
  }

  // --- quêtes ('none' | 'active' | 'done')
  questStatus(id) {
    return this.quests[id]?.status ?? 'none';
  }

  // --- sauvegarde
  toJSON() {
    return structuredClone({ flags: this.flags, counters: this.counters, items: this.items, hp: this.hp, maxHp: this.maxHp, quests: this.quests, profile: this.profile, quiz: this.quiz, playTime: this.playTime, cooldowns: this.cooldowns, bagSize: this.bagSize });
  }

  load(data) {
    this.reset(data.maxHp);
    const d = structuredClone(data);
    d.quiz = { seen: [], stats: {}, missed: {}, ...d.quiz };
    Object.assign(this, d);
    this._changed('load');
  }
}

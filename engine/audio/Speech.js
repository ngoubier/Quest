// Voix de synthèse du navigateur (aucun fichier) : utilisée pour les dictées.
export const Speech = {
  get available() {
    return typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
  },

  /** Prononce un texte. Renvoie false si l'appareil ne sait pas parler. */
  speak(text, { lang = 'fr-FR', rate = 0.85 } = {}) {
    if (!this.available) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    const voice = speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith(lang.slice(0, 2)));
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
    return true;
  },

  stop() {
    if (this.available) speechSynthesis.cancel();
  },
};

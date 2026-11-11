// Champ de saisie de texte superposé au canvas (un vrai <input> HTML) :
// clavier physique avec accents sur PC, clavier natif sur téléphone/tablette.
// Sa position est donnée en pixels LOGIQUES du jeu et suit le redimensionnement.

export class TextField {
  constructor(game) {
    this.game = game;
    this.el = null;
  }

  get isOpen() {
    return !!this.el;
  }

  get value() {
    return this.el?.value ?? '';
  }

  /**
   * @param {{x:number,y:number,w:number,h:number}} rect  zone en pixels logiques
   * @param {{onSubmit?:(v:string)=>void, onKey?:(e:KeyboardEvent)=>boolean, placeholder?:string, maxLength?:number, inputMode?:string}} opts
   */
  open(rect, { onSubmit, onKey = null, placeholder = '', maxLength = 40, inputMode = 'text' } = {}) {
    this.close();
    const s = this.game.style;
    const el = document.createElement('input');
    el.type = 'text';
    el.maxLength = maxLength;
    el.placeholder = placeholder;
    el.inputMode = inputMode;
    el.enterKeyHint = 'done';
    el.autocomplete = 'off';
    el.spellcheck = false;
    el.setAttribute('autocapitalize', 'off');
    el.setAttribute('autocorrect', 'off');
    el.style.cssText =
      `position:fixed;z-index:10;box-sizing:border-box;margin:0;outline:none;text-align:center;` +
      `background:${s.box};color:${s.text};border:2px solid ${s.accent};border-radius:4px;` +
      `font-family:${s.font};padding:0 6px;`;
    el.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (onKey?.(e)) return e.preventDefault();
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit?.(el.value);
      }
    });
    document.body.appendChild(el);
    this.el = el;
    this.rect = rect;
    this.place();
    // Sur ordinateur, le focus est immédiat ; sur mobile, toucher le champ ouvre le clavier.
    setTimeout(() => this.el === el && el.focus({ preventScroll: true }), 30);
  }

  /** Recalcule la position à l'écran (à appeler à chaque image : coût négligeable). */
  place() {
    if (!this.el) return;
    const c = this.game.canvas.getBoundingClientRect();
    const k = c.width / this.game.width;
    const { x, y, w, h } = this.rect;
    const st = this.el.style;
    st.left = `${c.left + x * k}px`;
    st.top = `${c.top + y * k}px`;
    st.width = `${w * k}px`;
    st.height = `${h * k}px`;
    st.fontSize = `${Math.max(16, h * k * 0.55)}px`;
  }

  close() {
    this.el?.remove();
    this.el = null;
  }
}

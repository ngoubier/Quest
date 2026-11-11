// Manette virtuelle pour écrans tactiles : croix directionnelle + boutons.
// Elle n'invente rien : elle appelle simplement input.setVirtual(action, bool).

const BTN_CSS =
  'touch-action:none;user-select:none;-webkit-user-select:none;display:flex;align-items:center;' +
  'justify-content:center;border-radius:50%;font:bold 18px system-ui,sans-serif;color:#fff;' +
  'background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.35);';

export class TouchControls {
  /**
   * @param {import('./Input.js').Input} input
   * @param {object} opts
   * @param {HTMLElement} opts.parent  conteneur flex qui contient l'écran de jeu
   * @param {HTMLElement} [opts.screen] l'élément de l'écran de jeu (pour la disposition paysage)
   * @param {{action:string,label:string}[]} [opts.buttons]
   * @param {{action:string,label:string}[]} [opts.menu]  [gauche, droite]
   * @param {(landscape:boolean)=>void} [opts.onLayout]
   *
   * Portrait : écran en haut, [croix + Select]  [B A + Start] en dessous.
   * Paysage  : [croix + Select] | écran | [B A + Start] — l'écran est bien plus grand.
   */
  constructor(input, { parent, screen = null, buttons, menu, onLayout = null } = {}) {
    this.input = input;
    this.parent = parent;
    this.screen = screen;
    this.onLayout = onLayout;
    // Taille des boutons : selon l'écran (plus grands sur les grands téléphones et tablettes).
    const ref = Math.min(innerWidth, innerHeight);
    this.btnSize = Math.round(Math.min(80, Math.max(60, ref * 0.17)));
    this.padSize = Math.round(Math.min(156, Math.max(116, ref * 0.33)));
    buttons ??= [
      { action: 'secondary', label: 'B' },
      { action: 'action', label: 'A' },
    ];
    menu ??= [
      { action: 'select', label: 'Select' },
      { action: 'start', label: 'Start' },
    ];
    const col = 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;flex-shrink:0;touch-action:none;user-select:none;-webkit-user-select:none;';
    const small = (m) => {
      const b = this._button(m.action, m.label);
      b.style.cssText += 'border-radius:12px;width:70px;height:26px;font-size:12px;flex-shrink:0;';
      return b;
    };

    this.left = document.createElement('div');
    this.left.style.cssText = col;
    this.left.appendChild(this._dpad());
    this.left.appendChild(small(menu[0]));

    this.right = document.createElement('div');
    this.right.style.cssText = col;
    const ab = document.createElement('div');
    ab.style.cssText = 'display:flex;gap:14px;align-items:center;';
    buttons.forEach((m, i) => {
      const b = this._button(m.action, m.label);
      const sz = this.btnSize;
      b.style.cssText += `width:${sz}px;height:${sz}px;font-size:${Math.round(sz * 0.32)}px;flex-shrink:0;margin-top:${i % 2 ? -24 : 24}px;`;
      ab.appendChild(b);
    });
    this.right.appendChild(ab);
    this.right.appendChild(small(menu[1]));

    this.bottom = document.createElement('div');
    this.bottom.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 16px 14px;box-sizing:border-box;width:100%;flex-shrink:0;';
    this.root = this.bottom;

    this.layout();
    addEventListener('resize', () => this.layout());
  }

  get landscape() {
    return innerWidth > innerHeight;
  }

  /** Place les commandes selon l'orientation de l'écran. */
  layout() {
    const land = this.landscape && !!this.screen;
    if (land === this._land) return;
    this._land = land;
    if (land) {
      // Marge des bords arrondis / encoche uniquement du côté extérieur.
      this.parent.style.flexDirection = 'row';
      this.left.style.paddingLeft = 'max(10px, env(safe-area-inset-left, 0px))';
      this.left.style.paddingRight = '8px';
      this.right.style.paddingLeft = '8px';
      this.right.style.paddingRight = 'max(10px, env(safe-area-inset-right, 0px))';
      this.parent.insertBefore(this.left, this.screen);
      this.parent.appendChild(this.right);
      this.bottom.remove();
    } else {
      this.parent.style.flexDirection = 'column';
      for (const el of [this.left, this.right]) el.style.paddingLeft = el.style.paddingRight = '0';
      this.bottom.appendChild(this.left);
      this.bottom.appendChild(this.right);
      this.parent.appendChild(this.bottom);
    }
    this.onLayout?.(land);
  }

  _button(action, label) {
    const el = document.createElement('div');
    el.textContent = label;
    el.style.cssText = BTN_CSS;
    const on = (e) => {
      e.preventDefault();
      el.setPointerCapture?.(e.pointerId);
      el.style.background = 'rgba(255,255,255,.4)';
      this.input.setVirtual(action, true);
    };
    const off = (e) => {
      e.preventDefault();
      el.style.background = 'rgba(255,255,255,.14)';
      this.input.setVirtual(action, false);
    };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointercancel', off);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    return el;
  }

  _dpad() {
    const size = this.padSize;
    const el = document.createElement('div');
    el.style.cssText =
      `${BTN_CSS}width:${size}px;height:${size}px;flex-shrink:0;position:relative;font-size:14px;` +
      'background:radial-gradient(circle,rgba(255,255,255,.18),rgba(255,255,255,.06));';
    el.innerHTML =
      '<span style="position:absolute;top:6px">▲</span><span style="position:absolute;bottom:6px">▼</span>' +
      '<span style="position:absolute;left:8px">◀</span><span style="position:absolute;right:8px">▶</span>';
    const dirs = ['up', 'down', 'left', 'right'];
    const set = (active) => dirs.forEach((d) => this.input.setVirtual(d, active.includes(d)));
    const handle = (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dead = r.width * 0.12;
      const active = [];
      if (Math.hypot(dx, dy) > dead) {
        // 8 directions : un axe est actif s'il représente une part suffisante du vecteur.
        if (Math.abs(dx) > Math.abs(dy) * 0.45) active.push(dx < 0 ? 'left' : 'right');
        if (Math.abs(dy) > Math.abs(dx) * 0.45) active.push(dy < 0 ? 'up' : 'down');
      }
      set(active);
    };
    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture?.(e.pointerId);
      handle(e);
    });
    el.addEventListener('pointermove', (e) => {
      if (e.buttons || e.pointerType === 'touch') handle(e);
    });
    const end = (e) => {
      e.preventDefault();
      set([]);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    return el;
  }

  /** Vrai sur les appareils dont le pointeur principal est un doigt. */
  static isTouchDevice() {
    return typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  }
}

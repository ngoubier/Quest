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
   * @param {HTMLElement} opts.parent
   * @param {{action:string,label:string}[]} [opts.buttons]
   * @param {{action:string,label:string}[]} [opts.menu]
   */
  constructor(input, { parent, buttons, menu } = {}) {
    this.input = input;
    buttons ??= [
      { action: 'secondary', label: 'B' },
      { action: 'action', label: 'A' },
    ];
    menu ??= [
      { action: 'select', label: 'Select' },
      { action: 'start', label: 'Start' },
    ];

    // Disposition : [croix]  [B A] sur une ligne, [Select Start] centrés en dessous.
    const root = document.createElement('div');
    root.style.cssText =
      'display:flex;flex-direction:column;gap:6px;padding:8px 16px 14px;box-sizing:border-box;width:100%;' +
      'touch-action:none;user-select:none;-webkit-user-select:none;flex-shrink:0;';
    this.root = root;

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';
    row.appendChild(this._dpad());
    const right = document.createElement('div');
    right.style.cssText = 'display:flex;gap:14px;align-items:center;';
    buttons.forEach((m, i) => {
      const b = this._button(m.action, m.label);
      b.style.cssText += `width:60px;height:60px;flex-shrink:0;margin-top:${i % 2 ? -24 : 24}px;`;
      right.appendChild(b);
    });
    row.appendChild(right);
    root.appendChild(row);

    const mid = document.createElement('div');
    mid.style.cssText = 'display:flex;gap:10px;justify-content:center;';
    for (const m of menu) {
      const b = this._button(m.action, m.label);
      b.style.cssText += 'border-radius:12px;width:70px;height:26px;font-size:12px;flex-shrink:0;';
      mid.appendChild(b);
    }
    root.appendChild(mid);
    parent.appendChild(root);
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
    const size = 124;
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

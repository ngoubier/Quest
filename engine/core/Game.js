// Point d'entrée du moteur : crée le canvas, la boucle de jeu et tous les services.
import { EventBus } from './EventBus.js';
import { Input } from '../input/Input.js';
import { Renderer } from '../graphics/Renderer.js';
import { SceneManager } from '../scene/SceneManager.js';
import { AudioEngine } from '../audio/Audio.js';
import { Assets } from '../assets/Assets.js';
import { Debug } from '../debug/Debug.js';
import { ThemeRegistry } from '../theme/ThemeRegistry.js';

export const DEFAULT_UI_STYLE = {
  font: "ui-monospace, Menlo, Consolas, 'Courier New', monospace",
  fontSize: 8,
  box: '#000000',
  border: '#ffffff',
  text: '#ffffff',
  accent: '#ffcc33',
  dim: '#888888',
};

export class Game {
  /**
   * @param {object} opts
   * @param {number} [opts.width=256]  largeur logique (pixels "rétro")
   * @param {number} [opts.height=192] hauteur logique
   * @param {HTMLElement} [opts.parent] conteneur dans lequel le canvas s'adapte
   * @param {number} [opts.step=1/60] pas de temps fixe de la simulation
   * @param {string} [opts.background='#000']
   */
  constructor({ width = 256, height = 192, parent = document.body, step = 1 / 60, background = '#000' } = {}) {
    this.width = width;
    this.height = height;
    this.parent = parent;
    this.step = step;
    this.background = background;

    this.canvas = document.createElement('canvas');
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.display = 'block';
    this.canvas.tabIndex = 0;
    parent.appendChild(this.canvas);

    this.events = new EventBus();
    this.renderer = new Renderer(this.canvas, width, height);
    this.input = new Input({ target: window });
    this.audio = new AudioEngine();
    this.assets = new Assets();
    this.themes = new ThemeRegistry(this);
    this.scenes = new SceneManager(this);
    this.debug = new Debug(this);
    this.style = { ...DEFAULT_UI_STYLE };

    this.time = 0; // temps de simulation écoulé (s)
    this.frame = 0;
    this._acc = 0;
    this._last = 0;
    this._running = false;

    // L'audio des navigateurs ne démarre qu'après une interaction utilisateur.
    // Toucher / clic sur l'écran de jeu (boutons du bandeau...), en pixels logiques.
    this.canvas.addEventListener('pointerdown', (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.input.addTap(((e.clientX - r.left) * this.width) / r.width, ((e.clientY - r.top) * this.height) / r.height);
    });

    const unlock = () => this.audio.unlock();
    window.addEventListener('keydown', unlock);
    window.addEventListener('pointerdown', unlock);

    this.resize();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => this.resize()).observe(parent);
    window.addEventListener('resize', () => this.resize());
  }

  /** Adapte le canvas au conteneur avec un facteur d'échelle entier (pixels nets). */
  resize() {
    const rect = this.parent.getBoundingClientRect();
    const availW = rect.width || window.innerWidth;
    const availH = rect.height || window.innerHeight;
    const fit = Math.min(availW / this.width, availH / this.height);
    // Grand écran : facteur entier (pixels parfaits). Petit écran : on remplit au mieux.
    const cssScale = fit >= 3 ? Math.floor(fit) : Math.max(fit, 0.25);
    this.canvas.style.width = `${Math.round(this.width * cssScale)}px`;
    this.canvas.style.height = `${Math.round(this.height * cssScale)}px`;
    const dpr = window.devicePixelRatio || 1;
    this.renderer.resize(Math.max(1, Math.round(cssScale * dpr)));
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._last = performance.now();
    requestAnimationFrame(this._loop);
  }

  stop() {
    this._running = false;
  }

  _loop = (now) => {
    if (!this._running) return;
    let dt = (now - this._last) / 1000;
    this._last = now;
    if (dt > 0.25) dt = 0.25; // onglet en arrière-plan : on évite la "spirale de la mort"
    this._acc += dt;

    // Simulation à pas fixe : même comportement quel que soit l'écran (60, 120, 144 Hz...)
    while (this._acc >= this.step) {
      this.input.update();
      if (this.input.pressed('debug')) this.debug.toggle();
      this.scenes.update(this.step);
      this.time += this.step;
      this._acc -= this.step;
    }

    this.debug.measureFrame(dt);
    const r = this.renderer;
    r.begin();
    r.clear(this.background);
    this.scenes.draw(r);
    this.debug.draw(r);
    this.frame++;
    requestAnimationFrame(this._loop);
  };
}

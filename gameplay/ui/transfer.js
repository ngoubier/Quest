import { Scene } from '../../engine/index.js';

// TRANSFERT DE PARTIE entre appareils (PC ↔ téléphone).
// La partie est transformée en un CODE texte (compressé si possible) qu'on peut :
//  - copier puis coller sur l'autre appareil (par message, e-mail...),
//  - ou télécharger / ouvrir comme fichier « .quest ».

const PREFIX_Z = 'QUEST1:'; // compressé (deflate)
const PREFIX_RAW = 'QUEST0:'; // non compressé

const toB64 = (bytes) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
const fromB64 = (b64) => Uint8Array.from(atob(b64.replace(/\s+/g, '')), (c) => c.charCodeAt(0));

async function pipe(bytes, stream) {
  const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
}

/** Objet → code texte. */
export async function encodeTransfer(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  if (typeof CompressionStream !== 'undefined') return PREFIX_Z + toB64(await pipe(bytes, new CompressionStream('deflate')));
  return PREFIX_RAW + toB64(bytes);
}

/** Code texte → objet (lève une erreur si le code est invalide). */
export async function decodeTransfer(code) {
  const c = String(code).trim();
  let bytes;
  if (c.startsWith(PREFIX_Z)) bytes = await pipe(fromB64(c.slice(PREFIX_Z.length)), new DecompressionStream('deflate'));
  else if (c.startsWith(PREFIX_RAW)) bytes = fromB64(c.slice(PREFIX_RAW.length));
  else throw new Error('Ce n’est pas un code de partie Quest.');
  const obj = JSON.parse(new TextDecoder().decode(bytes));
  if (obj?.app !== 'quest' || !obj.profile || !obj.save) throw new Error('Code incomplet ou abîmé.');
  return obj;
}

// ------------------------------------------------------------------ fenêtre HTML
const CSS = `
.qt-back{position:fixed;inset:0;z-index:20;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}
.qt-box{background:#1b1612;color:#f4e8c8;border:2px solid #d9b45a;border-radius:8px;max-width:520px;width:100%;padding:16px;box-sizing:border-box;font:15px/1.4 system-ui,sans-serif;display:flex;flex-direction:column;gap:10px}
.qt-box h2{margin:0;font-size:18px;color:#ffd35a}
.qt-box p{margin:0;font-size:14px;opacity:.9}
.qt-box textarea{width:100%;min-height:110px;box-sizing:border-box;font:12px ui-monospace,monospace;background:#0e0b09;color:#f4e8c8;border:1px solid #7a6a4a;border-radius:4px;padding:8px;word-break:break-all}
.qt-row{display:flex;gap:8px;flex-wrap:wrap}
.qt-row button,.qt-row label{flex:1 1 140px;min-height:40px;border-radius:6px;border:1px solid #d9b45a;background:#3a2c1a;color:#ffd35a;font:600 14px system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;text-align:center;padding:6px}
.qt-row button:focus-visible,.qt-row label:focus-within{outline:2px solid #fff}
.qt-msg{min-height:20px;font-size:14px}
`;

/** Scène vide qui bloque le jeu tant que la fenêtre HTML est ouverte. */
class ModalScene extends Scene {
  constructor(build) {
    super();
    this.transparent = true;
    this.build = build;
  }

  enter() {
    if (!document.getElementById('qt-css')) {
      const st = document.createElement('style');
      st.id = 'qt-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    this.el = document.createElement('div');
    this.el.className = 'qt-back';
    this.el.addEventListener('keydown', (e) => e.stopPropagation());
    document.body.appendChild(this.el);
    this.build(this.el, () => this.close());
  }

  exit() {
    this.el?.remove();
  }

  draw(r) {
    r.withAlpha(0.5, () => r.rect(0, 0, r.width, r.height, '#000'));
  }
}

const h = (tag, attrs = {}, text = '') => {
  const el = document.createElement(tag);
  Object.assign(el, attrs);
  if (text) el.textContent = text;
  return el;
};

/** Affiche le code d'une partie à copier, et propose un fichier à télécharger. */
export function openExport(game, data, { name = 'partie' } = {}) {
  game.scenes.push(
    new ModalScene(async (root, close) => {
      const box = h('div', { className: 'qt-box', role: 'dialog' });
      const ta = h('textarea', { readOnly: true, id: 'qt-export-code' }, 'Préparation du code…');
      const msg = h('div', { className: 'qt-msg' });
      const copy = h('button', { type: 'button' }, 'Copier le code');
      const dl = h('button', { type: 'button' }, 'Télécharger le fichier');
      const ok = h('button', { type: 'button' }, 'Fermer');
      box.append(
        h('h2', {}, `Transférer la partie de ${name}`),
        h('p', {}, 'Sur l’autre appareil : Espace parents → « Importer une partie », puis collez ce code ou ouvrez le fichier.'),
        ta,
        msg,
      );
      const row = h('div', { className: 'qt-row' });
      row.append(copy, dl, ok);
      box.append(row);
      root.append(box);
      ok.onclick = close;
      const code = await encodeTransfer(data);
      ta.value = code;
      copy.onclick = async () => {
        try {
          await navigator.clipboard.writeText(code);
          msg.textContent = 'Code copié ! Collez-le sur l’autre appareil.';
        } catch {
          ta.focus();
          ta.select();
          msg.textContent = 'Le code est sélectionné : copiez-le (Ctrl+C ou appui long).';
        }
      };
      dl.onclick = () => {
        try {
          const a = h('a', { href: URL.createObjectURL(new Blob([code], { type: 'text/plain' })), download: `quest-${name}.quest` });
          document.body.appendChild(a);
          a.click();
          a.remove();
          msg.textContent = 'Fichier préparé. S’il ne se télécharge pas ici, utilisez « Copier le code ».';
        } catch {
          msg.textContent = 'Téléchargement impossible ici : utilisez « Copier le code ».';
        }
      };
      copy.focus();
    }),
  );
}

/** Demande un code (collé) ou un fichier, puis appelle onImport(objet) ; renvoie un message d'erreur sinon. */
export function openImport(game, onImport) {
  game.scenes.push(
    new ModalScene((root, close) => {
      const box = h('div', { className: 'qt-box', role: 'dialog' });
      const ta = h('textarea', { placeholder: 'Collez ici le code de la partie (QUEST1:…)', id: 'qt-import-code' });
      const msg = h('div', { className: 'qt-msg' });
      const go = h('button', { type: 'button' }, 'Importer');
      const fileLabel = h('label', {}, 'Ouvrir un fichier');
      const file = h('input', { type: 'file', accept: '.quest,.txt,text/plain', id: 'qt-import-file' });
      file.style.display = 'none';
      fileLabel.append(file);
      const cancel = h('button', { type: 'button' }, 'Annuler');
      box.append(h('h2', {}, 'Importer une partie'), h('p', {}, 'Collez le code reçu, ou ouvrez le fichier « .quest ».'), ta, msg);
      const row = h('div', { className: 'qt-row' });
      row.append(go, fileLabel, cancel);
      box.append(row);
      root.append(box);
      cancel.onclick = close;
      const run = async (code) => {
        try {
          const obj = await decodeTransfer(code);
          const err = onImport(obj);
          if (err) return (msg.textContent = err);
          close();
        } catch (e) {
          msg.textContent = e.message || 'Code invalide.';
        }
      };
      go.onclick = () => run(ta.value);
      file.onchange = async () => {
        const f = file.files?.[0];
        if (f) run(await f.text());
      };
      ta.focus();
    }),
  );
}

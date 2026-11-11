import { MenuScene } from '../../engine/index.js';

// Fin de l'aventure : félicitations, puis continuer à explorer ou ouvrir l'Espace parents.
export class EndScene extends MenuScene {
  constructor(adv, { title = 'FIN DE L’AVENTURE', message = 'Bravo, tu as terminé le jeu !' } = {}) {
    super({
      title,
      width: 200,
      items: [
        { label: 'Continuer à explorer', onSelect: (m) => m.close() },
        { label: 'Espace parents (bilan)', onSelect: () => adv.openParentSpace() },
      ],
    });
    this.message = message;
  }

  draw(r) {
    super.draw(r);
    const s = this.game.style;
    r.fitText(this.message, r.width / 2, 40, r.width - 16, { color: s.accent, size: 9, font: s.font, bold: true, align: 'center', shadow: '#000' });
    r.text('★ ★ ★', r.width / 2, 56, { color: s.accent, size: 12, font: s.font, align: 'center', shadow: '#000' });
  }
}

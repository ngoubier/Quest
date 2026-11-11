import { MenuScene } from '../../engine/index.js';

// Écran de défaite : continuer (au début de la carte, vie pleine) ou recharger.
export class GameOverScene extends MenuScene {
  constructor(adv) {
    super({
      title: 'VOUS ÊTES À TERRE',
      width: 180,
      items: [
        { label: 'Continuer', onSelect: (m) => (m.close(), adv.continueAfterDeath()) },
        { label: 'Charger la sauvegarde', enabled: () => adv.hasSave(), onSelect: (m) => (m.close(), adv.loadGame()) },
      ],
    });
  }

  // Pas d'annulation possible : il faut choisir.
  update(dt) {
    if (this.input.pressed('secondary') || this.input.pressed('start')) return;
    super.update(dt);
  }

  draw(r) {
    r.withAlpha(0.6, () => r.rect(0, 0, r.width, r.height, '#300'));
    super.draw(r);
  }
}

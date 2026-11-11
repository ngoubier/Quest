// Une scène = un "écran" du jeu : titre, monde, menu pause, boîte de dialogue...
// Les scènes s'empilent : seule celle du dessus est mise à jour ;
// une scène `transparent` laisse voir celles du dessous (menus, dialogues).

export class Scene {
  constructor() {
    this.game = null; // renseigné par le SceneManager
    this.manager = null;
    this.transparent = false;
  }

  get input() {
    return this.game.input;
  }

  /** Raccourci : retire cette scène de la pile. */
  close(result) {
    if (this.manager.top === this) this.manager.pop(result);
  }

  // --- À surcharger ---
  enter(data) {}
  exit() {}
  /** Appelé quand la scène redevient celle du dessus (ex. menu fermé). */
  resume(result) {}
  update(dt) {}
  draw(r) {}
}

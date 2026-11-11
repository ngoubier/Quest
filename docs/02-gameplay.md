# Étape 2 — Le gameplay (Quest Gameplay)

> Statut : **validé avec ajustements** (voir `03-quetes-et-enigmes.md`). Essai jouable : `demos/02-gameplay/`.

## Décisions validées à l'étape 1

| Sujet | Décision |
|---|---|
| Plateforme | Navigateur, **PC + mobile** |
| Déplacement | **8 directions** |
| Caméra | **Les deux**, choisies carte par carte : `camera: 'follow'` (défilement libre, extérieur) ou `camera: 'rooms'` (salles fixes, donjons) |
| Graphismes | Provisoires (dessinés par le code) |
| Cartes | En texte pour l'instant ; format pensé pour un **éditeur visuel plus tard** (voir §8) |

## 1. Principe : un jeu = des données

La couche gameplay (`gameplay/`) apporte tout ce qu'un jeu d'aventure a en commun.
Un jeu ne fournit que des **données** : cartes, objets, quêtes, dialogues.
L'essai n°2 en est la preuve : `demos/02-gameplay/world.js` ne contient **aucune logique**.

```js
new AdventureScene({ maps, legend, items, quests, startMap: 'overworld', hud: { counters: ['coin', 'key'] } })
```

| Module | Rôle |
|---|---|
| `AdventureScene` | Squelette du jeu : chargement des cartes, portes entre cartes, bandeau (vie, compteurs), menu pause, journal, sauvegarde, défaite. |
| `state/GameState` | Tout ce qui se sauvegarde : drapeaux, compteurs, inventaire, vie, progression des quêtes. |
| `script/` | Le **langage de conditions et d'actions** (§4), utilisé par les PNJ, les quêtes, les coffres, les énigmes. |
| `quests/QuestSystem` | Quêtes principales et secondaires (§5). |
| `actors/` | Héros, monstres et leurs comportements, effets. |
| `objects/` | Objets du monde et **briques d'énigmes** (§6), plus la fabrique qui les crée depuis les cartes. |
| `ui/` | Bandeau, journal des quêtes, écran de défaite. |

## 2. Héros et combat

- **Action** : parle / ouvre / actionne si quelque chose est juste devant, **sinon coup d'arme**.
- L'arme touche une zone devant le héros, blesse les monstres, coupe les **tuiles coupables** (buissons) et actionne les leviers.
- **Vie** en demi-cœurs (6 = 3 cœurs). Touché : recul, clignotement, 1 s d'invulnérabilité.
- **Pousser** : marcher contre un bloc pendant 0,3 s le fait glisser d'une case (si la case est libre).
- **Porte verrouillée** : la toucher consomme une clé.
- **Défaite** : « Continuer » (vie pleine, à l'entrée de la carte) ou « Charger la sauvegarde ».

## 3. Monstres, objets, vocabulaire

**Monstres** = statistiques + **comportement réutilisable** :

```js
{ type: 'enemy', kind: 'blob', sprite: 'blob', hp: 2, speed: 22, damage: 1, behavior: 'wander' }
{ type: 'enemy', kind: 'flyer', sprite: 'flyer', hp: 1, speed: 38, behavior: 'chase', sight: 70 }
```

Comportements fournis : `wander` (errance), `chase` (fonce sur le héros s'il le voit). Un jeu peut ajouter les siens.
Les monstres hors écran sont figés. Vaincus, ils lâchent parfois un cœur ou de l'argent, et incrémentent le compteur `kills_<kind>`.

**Objets** : déclarés une fois pour le jeu.

```js
items: {
  coin:  { icon: 'coin', word: 'coin', max: 999 },
  key:   { icon: 'key', word: 'key', max: 9 },
  heart: { icon: 'heart', instant: (adv) => adv.state.heal(2) },   // effet immédiat
}
```

**Vocabulaire par ambiance** : le même objet s'appelle *rubis*, *crédit* ou *euro* ; le même monstre *gluant*, *xéno-gelée* ou *rat*.
Les textes utilisent des trous : `'Il me manque 3 {ws:mushroom}'` → « 3 champignons », « 3 cellules d'énergie » ou « 3 tickets ».

## 4. Le langage de conditions et d'actions

C'est le cœur de la réutilisabilité. Quêtes, dialogues et énigmes sont écrits avec **le même petit langage**, sous forme de données :
lisible, sauvegardable, et éditable un jour dans un outil.

**Conditions** (« quand ? ») :

| Écriture | Vrai si |
|---|---|
| `'porte_ouverte'` ou `{ flag: 'porte_ouverte' }` | le drapeau est levé |
| `{ item: 'mushroom', count: 3 }` | on possède au moins 3 champignons |
| `{ counter: 'kills_blob', gte: 3 }` | compteur ≥ 3 |
| `{ quest: 'relic', status: 'active' }` | statut de quête (`none`, `active`, `done`) |
| `{ quest: 'relic', step: 1 }` | quête active, à l'étape 1 |
| `{ all: [...] }`, `{ any: [...] }`, `{ not: ... }` | combinaisons |

**Actions** (« que se passe-t-il ? ») : `say`, `ask` (avec choix), `give`, `take`, `setFlag`, `clearFlag`,
`addCounter`, `setCounter`, `startQuest`, `heal`, `maxHp`, `sound`, `toast`, `if/then/else`, et `call` (JavaScript, pour les cas spéciaux).

Exemple : un PNJ choisit **la première règle vraie** de son dialogue :

```js
dialogue: [
  { when: { quest: 'harvest', status: 'none' }, do: [{ ask: 'Tu m’aides ?', choices: [
      { label: 'Oui', do: [{ startQuest: 'harvest' }] }, { label: 'Non', do: [{ say: 'Tant pis.' }] } ] }] },
  { when: { quest: 'harvest', step: 1 }, do: [{ take: 'mushroom', count: 3 }, { setFlag: 'harvest_given' }, { give: 'coin', count: 30, announce: true }] },
  { do: [{ say: 'Merci encore !' }] },
]
```

## 5. Quêtes

```js
{
  id: 'relic', kind: 'main', title: 'La relique perdue',
  steps: [
    { goal: 'Explorer {w:cave} au sud-est', done: { item: 'amulet' } },
    { goal: 'Retourner voir {w:elder}',     done: { flag: 'relic_returned' } },
  ],
  rewards: [{ maxHp: 2 }],
}
```

- **Principale** (`main`, ★) et **secondaires** (`side`) : même système.
- Une étape est validée **dès que sa condition devient vraie**, peu importe comment : ramasser, parler, vaincre, résoudre une énigme.
  Si on possède déjà les objets au lancement de la quête, l'étape est validée tout de suite.
- Annonces à l'écran (« Nouvelle quête », objectif suivant, « Quête terminée ») et **journal** dans le menu pause.
- Trois modèles dans l'essai : **aller chercher** (relique), **collecter** (3 champignons), **chasser** (3 monstres, via un compteur).

## 6. Énigmes : des briques combinables

| Brique | Comportement | Données |
|---|---|---|
| `block` | Bloc à pousser d'une case | `{ once?: true }` |
| `plate` | Dalle : drapeau levé tant que le héros ou un bloc est dessus | `{ flag, sticky?: true }` |
| `gate` | Grille : ouverte quand la condition est vraie (ne se referme pas sur quelqu'un) | `{ openWhen: condition }` |
| `locked` | Porte verrouillée : consomme une clé, reste ouverte | `{ key: 'key' }` |
| `lever` | Levier : on le frappe ou l'actionne pour basculer un drapeau | `{ flag }` |
| `chest` | Coffre, éventuellement **caché** jusqu'à une condition | `{ item, appearWhen?: condition }` |
| `pickup` | Objet au sol, éventuellement **caché sous un buisson** | `{ item, hidden?: true }` |
| salle à vider | Lève un drapeau quand tous les monstres d'une salle sont vaincus | `roomClear: [{ room: [x, y], flag }]` |

Elles se combinent **uniquement par des drapeaux et des conditions**. Exemples dans l'essai :
- bloc → dalle → `cave_plate` → grille ;
- salle vidée → `cave_hall_cleared` → coffre apparaît → clé → porte verrouillée ;
- levier → `garden_open` → grille du jardin.

Énigmes plus complexes possibles sans nouveau code : 2 dalles + `{ all: [...] }`, leviers dans un ordre précis (compteurs), etc.

## 7. Persistance automatique

Chaque objet placé reçoit un identifiant `carte:x,y`. Coffres ouverts, portes déverrouillées et objets ramassés
sont mémorisés (`opened:…`, `unlocked:…`, `taken:…`) et **sauvegardés**. Les monstres, blocs et buissons
réapparaissent quand on revient sur la carte, comme dans le Zelda original.

## 8. Cartes : prêtes pour un éditeur visuel

Chaque lettre d'une carte est soit une tuile, soit un **objet typé avec des propriétés** :

```js
objects: { C: { type: 'chest', item: 'key', appearWhen: { flag: 'cave_hall_cleared' }, tile: 'floor_in' } }
```

C'est exactement le modèle de l'éditeur **Tiled** (calques de tuiles + objets avec `type` et propriétés).
Le jour où on dessine les cartes, il suffira d'un lecteur de fichiers Tiled qui produit ces mêmes objets :
la fabrique (`ObjectFactory`) et tout le reste ne changent pas.

## 9. Essai n°2 — check-list

Lancer : `npm start` puis `http://localhost:8080/demos/02-gameplay/`.

- [ ] Extérieur en **caméra libre**, souterrains en **salles fixes**
- [ ] Parler à l'Ancien, à la Marchande et au Garde ; accepter ou refuser (choix Oui/Non)
- [ ] Combat : frapper les monstres (recul, clignotement), subir des dégâts, cœurs dans le bandeau
- [ ] Butin : cœurs et argent lâchés par les monstres et les buissons
- [ ] Couper les buissons ; un champignon est caché sous l'un d'eux
- [ ] Frapper le levier du jardin pour ouvrir la grille
- [ ] Journal des quêtes (Entrée → Journal) : objectifs qui se mettent à jour, compteurs (2/3)
- [ ] Souterrains : bloc → dalle → grille ; vider la salle → coffre → clé → porte verrouillée → relique
- [ ] Rapporter la relique : quête terminée, **un cœur de plus**
- [ ] Défaite (se laisser toucher) → Continuer
- [ ] Sauvegarder / Charger (l'écran titre propose « Continuer »)
- [ ] Tab : le vocabulaire change avec l'ambiance (rubis → crédits → euros)

<details><summary>Solution des souterrains</summary>

1. Salle d'entrée → salle de droite : pousser le bloc 2 fois vers la droite, puis 2 fois vers le haut sur la dalle.
2. La grille du haut s'ouvre : vaincre les 4 monstres, un coffre apparaît avec une clé.
3. La porte verrouillée à gauche mène à la relique.
</details>

## 10. Pas encore fait (prochaines briques possibles)

- Objet secondaire (bouton B) : arc, bombes, boomerang, lampe... et objets qui débloquent des passages
- Boutique (acheter avec l'argent), cœurs à collectionner, améliorations
- Monstres plus variés : tireurs, boss, invocateurs
- Briques d'énigmes : torches à allumer, interrupteurs en séquence, sol glissant, téléporteurs, trous
- Dialogues plus riches (PNJ qui bougent selon l'avancement, cinématiques simples)
- Musique

## 11. Questions à trancher ensemble

1. **Combat** : l'épée devant soi (actuel) vous convient-elle ? Faut-il un **objet B** dès la prochaine étape, et lequel ?
2. **Vie** : 3 cœurs au départ et +1 par quête principale, ça va ?
3. **Monstres** : réapparition à chaque retour sur la carte (style Zelda) ou disparition définitive ?
4. **Quêtes** : les trois modèles (aller chercher, collecter, chasser) suffisent-ils ? D'autres idées (escorter, livrer, enquêter) ?
5. **Énigmes** : quelles briques prioriser parmi celles du §10 ?
6. **Défaite** : reprise à l'entrée de la carte (actuel) ou au dernier point de sauvegarde ?

# Étape 3 — Quêtes, énigmes scolaires et économie

> Statut : **décisions prises** (voir §7) · nouvelle version à valider.
> Essai jouable : `demos/02-gameplay/` (même essai, enrichi). Programme scolaire : `04-programme-scolaire.md`.

## 1. Décisions prises à l'étape 2

| Sujet | Décision | Réalisé |
|---|---|---|
| Arme secondaire | Pas pour l'instant | — |
| Vie | 3 cœurs au départ | ✓ (+1 cœur : quête principale ou boutique) |
| Monstres | Vaincus pour de bon, **sauf si on recommence le niveau** | ✓ |
| Défaite | **On recommence le niveau au début** | ✓ « Recommencer le niveau » |
| Énigmes | **Questions scolaires selon l'âge**, posées par des PNJ, pour gagner objets ou argent | ✓ |
| Économie | L'argent sert à acheter chez des marchands | ✓ boutique |
| Quêtes | Plus de quêtes « aller chercher » à étapes, à discuter | proposition §5 + exemple jouable |

### Niveaux

Un **niveau** est un groupe de cartes (`level: 'souterrains'` dans la définition d'une carte).
Son point de départ est l'endroit où l'on y est entré.
**Recommencer le niveau** : retour au départ, vie pleine, les monstres de ce niveau réapparaissent.
Objets, coffres ouverts et quêtes sont **conservés**. *(À confirmer, voir §6.)*

Si le héros a une **potion** dans son sac, elle le sauve automatiquement au lieu de la défaite.

## 2. Énigmes scolaires

### Le joueur

À la création d'une partie, on choisit l'**âge** : 6 ans (CP), 7 ans (CE1), 8 ans (CE2), 9 ans (CM1) ou 10 ans (CM2).
Il est sauvegardé et modifiable dans le menu pause (pour un parent).

### Trois formes de questions

| Forme | Exemple | Saisie |
|---|---|---|
| **QCM** | « Il … un chien. » → *a* / *à* | Haut/Bas puis Action |
| **Réponse écrite** | « Un cheval, des … » → *chevaux* | Clavier (PC) ou clavier du téléphone |
| **Nommer une image** | 🐘 « Comment s'appelle ceci ? » → *éléphant* | Clavier |

Bouton B : « Je ne sais pas ». Après chaque réponse, **correction bienveillante** : la bonne réponse est
toujours montrée, parfois avec une explication (« *a* est le verbe avoir : on peut dire *il avait* »).
Bilan à la fin avec des étoiles.

### Correction des réponses écrites

Tolérante sur la **forme**, jamais sur le **fond** :
- majuscules, espaces et ponctuation ignorés ;
- articles acceptés : « un éléphant », « l'éléphant » ;
- accents tolérés (« elephant ») **sauf en conjugaison**, où l'orthographe compte ;
- nombres : « 3,8 » = « 3.8 », « 1 000 » = « 1000 » ;
- réponses alternatives possibles (« 7 » ou « sept »).

### Contenu (`content/quiz/`)

| Matière | Source | Exemples par âge |
|---|---|---|
| **Mathématiques** | **générées à l'infini**, calibrées sur les programmes | 6 ans : additions < 10, compter des objets · 8 ans : tables 2 à 5, moitiés · 10 ans : divisions, décimaux, quarts |
| **Français** | ~60 questions | images à nommer, syllabes, contraires, homophones (a/à, son/sont), pluriels, conjugaison |
| **Histoire** | ~17 questions | jours/mois/saisons (petits), Préhistoire, Moyen Âge, Gaulois, Louis XIV, 1789 |
| **Géographie** | ~14 questions | Paris, drapeau, Europe, Loire, Mont Blanc, capitales européennes |
| **Sciences** | ~10 questions | chenille → papillon, pattes des insectes, Terre/Soleil, mammifères |

Le jeu **évite de reposer les mêmes questions** et tient des **statistiques par matière** (sauvegardées),
qui pourront servir plus tard à un bilan pour les parents.

Le contenu est **séparé du jeu** : la même banque servira à tous les jeux faits avec le moteur, et on peut l'enrichir
sans toucher au code (un fichier de données par matière).

### Dans le langage de quêtes

Les questions sont une **action** comme les autres :

```js
{ quiz: { subject: 'maths', count: 3, pass: 2 },      // 3 questions, 2 bonnes pour réussir
  perCorrect: { give: 'coin', count: 2 },              // 2 pièces par bonne réponse
  success: [{ give: 'flowers', announce: true }],
  failure: [{ say: 'Presque ! Reviens essayer.' }] }
```

## 3. Économie

| Source d'argent | Montant (essai) |
|---|---|
| Maîtresse : 3 questions au choix de la matière, **à volonté** | 2 par bonne réponse |
| Récompenses de quêtes | 20 à 30 |
| Monstres et buissons | 1 de temps en temps |

| Boutique du village | Prix |
|---|---|
| Ruban (objet de quête) | 5 |
| Potion (sauve d'une défaite) | 20 |
| Cœur supplémentaire (un seul) | 60 |

Un menu **Sac** liste les objets possédés.

## 4. L'exemple jouable : « Un bouquet pour la cuisinière »

Quête « aller chercher » en **5 étapes**, qui combine PNJ, énigmes et boutique :

1. **Léon**, trop timide, veut offrir un bouquet à la cuisinière → il demande des fleurs et un ruban.
2. **La jardinière** donne ses fleurs si l'on répond juste à **2 questions sur 3**.
3. **Le marchand** vend le ruban (5 pièces, à gagner chez la maîtresse).
4. **Léon** noue le bouquet → il faut **l'apporter** à la cuisinière.
5. **La cuisinière** accepte l'invitation → **retour chez Léon** → récompense.

Le journal suit chaque étape. L'ordre des étapes 2 et 3 est libre : si on a déjà le ruban, l'étape est validée tout de suite.

## 5. Quêtes : proposition à discuter

### 5.1 Les modèles de quêtes que le moteur sait déjà faire

| Modèle | Principe | Exemple |
|---|---|---|
| **Aller chercher** | rapporter un objet à un PNJ | la relique de l'Ancien |
| **Collecter** | réunir N objets | 3 champignons |
| **Chasser** | vaincre N monstres | 3 gluants |
| **Livrer** | porter un objet d'un PNJ à un autre | le bouquet |
| **Chaîne à étapes** | enchaîner plusieurs de ces modèles | le bouquet (5 étapes) |
| **Savoir** | réussir des questions pour avancer | la jardinière |

### 5.2 Ce que je propose d'ajouter

1. **Chaînes d'échanges (troc)** : A veut X, a Y à échanger ; B veut Y, a Z… jusqu'à l'objet final.
   Très « Zelda », et c'est un bon prétexte pour faire parler l'enfant à beaucoup de PNJ.
2. **Quêtes à plusieurs objets d'origines différentes** : « fabriquer un cerf-volant » = tissu (boutique)
   + bois (coffre de donjon) + ficelle (PNJ, contre une énigme).
3. **Quêtes à embranchement** : un choix change la suite ou la récompense (aider l'un ou l'autre).
4. **Quêtes liées à l'apprentissage** : un PNJ « professeur » par matière, avec une série de niveaux
   (Apprenti → Expert). Chaque palier débloque un objet ou un passage.
5. **Quêtes qui débloquent le monde** : un pont réparé, une porte de ville ouverte, un passeur qui accepte
   de faire traverser… La progression dans la carte passe par les quêtes.
6. **Indices** : un PNJ ou un panneau aide quand l'enfant est bloqué (« As-tu parlé au marchand ? »).

### 5.3 Structure proposée d'un « niveau » du jeu

```
Village (hub) ──► Zone 1 (extérieur) ──► Donjon 1 ──► Boss / relique
   │ quêtes secondaires          │ quêtes locales      │ énigmes de salle + questions
   └ boutique, maîtresse         └ PNJ à aider          └ récompense : objet qui ouvre la zone 2
```

Chaque zone : **1 étape de la quête principale**, **2 à 4 quêtes secondaires**, **1 boutique ou PNJ de questions**.

## 6. Questions à trancher ensemble

**Quêtes**
1. Parmi les ajouts du §5.2, lesquels voulez-vous ? (troc, fabrication, embranchements, professeurs, déblocage du monde, indices)
2. Combien de quêtes secondaires par zone : 2, 3, 4 ou plus ?
3. Les quêtes doivent-elles être **obligatoires** pour avancer, ou rester des bonus (argent, cœurs, objets) ?

**Énigmes**

4. Faut-il pouvoir **choisir la matière** à chaque fois (comme la maîtresse) ou laisser le jeu varier ?
5. En cas d'échec : **réessayer tout de suite** (actuel), ou attendre / payer ?
6. Faut-il un **bilan pour les parents** (statistiques par matière, points faibles) ?
7. Avez-vous des **programmes précis** à suivre (manuels, fiches) ou des thèmes à ajouter ?

**Niveaux**

8. En recommençant un niveau, faut-il aussi **remettre à zéro les coffres et les objets** du niveau, ou les garder (actuel) ?

## 7. Décisions (réponses du §6) et ce qui a été fait

| Question | Décision | Réalisé |
|---|---|---|
| Ajouts de quêtes | **Tous** | ✓ voir tableau ci-dessous |
| Quêtes par zone | **Variable selon la carte** | ✓ c'est une donnée de chaque carte |
| Obligatoires ? | **Oui, avec des indices** | ✓ compteur d'indices, gagnés (quêtes faciles, diplômes) ou achetés |
| Matière | **Choisie par le jeu** | ✓ variée, et plus souvent les matières les moins réussies |
| Après un échec | **Attendre, ou payer** | ✓ délai en temps de jeu, ou payer pour réessayer tout de suite |
| Bilan | **À la fin, pour les parents uniquement** | ✓ Espace parents protégé par un code à 4 chiffres |
| Programme | **À proposer** | ✓ `04-programme-scolaire.md` + anglais + problèmes de maths |
| Recommencer un niveau | **Remet aussi coffres et objets à zéro** | ✓ tout revient comme à l'entrée du niveau |

### Les six types de quêtes, dans l'essai

| Type | Exemple jouable | Mécanisme |
|---|---|---|
| **Troc en chaîne** | 3 champignons → la cuisinière donne une tarte → le pêcheur l'échange contre ses planches | actions `take` / `give` |
| **Fabrication** | planches + clous → le charpentier répare le pont ; fleurs + ruban → Léon fait un bouquet | conditions `{ all: [...] }` |
| **Embranchement** | le pêcheur : « une tarte » **ou** « tes questions » → l'objectif affiché change | objectif à variantes `goal: [{ when, text }]` |
| **Professeurs à paliers** | l'historien (histoire : 3 / 8 / 15 bonnes réponses) ; la maîtresse décerne des diplômes (5 / 15 / 30) | condition `{ quizOk: 'histoire', gte: 8 }` |
| **Ouvrir le monde** | le pont réparé apparaît sur la rivière : la grotte devient accessible | objet `tileswitch` |
| **Indices** | menu pause → « Utiliser un indice » ; ils restent lisibles dans le journal | `hints: [...]` par étape |

**Quête principale** de l'essai : l'Ancien → *le pont cassé* (obligatoire : troc + boutique + fabrication) → les souterrains → retour chez l'Ancien → **fin du jeu**.

### Indices

- Compteur dans le bandeau (ampoule). 1 indice au départ.
- **Gagnés** : quêtes faciles (garde, Léon), diplômes de la maîtresse, paliers de l'historien. **Achetés** : 15 pièces chez le marchand.
- Chaque étape de quête a des indices **progressifs** (du plus vague au plus précis). Un indice déjà révélé reste gratuit à relire.

### Échec aux questions

Si l'enfant n'atteint pas le score demandé, le PNJ demande d'**attendre** (45 à 60 s de jeu, réglable par PNJ)
ou de **payer** (3 à 5 pièces) pour réessayer tout de suite.

### Espace parents

- Accessible depuis l'écran titre, le menu pause et l'écran de fin, **protégé par un code à 4 chiffres** choisi au premier accès.
- **Bilan disponible à la fin du jeu** (réglage `reportWhen: 'end'`, ou `'always'` si vous préférez le voir en cours de partie).
- Contenu : âge, temps de jeu, nombre de questions et taux de réussite, quêtes terminées, indices utilisés,
  point fort / à travailler, **résultats par matière**, et **liste des erreurs à retravailler** (question + bonne réponse),
  dont on retire celles corrigées ensuite.
- Le réglage de l'**âge** est désormais dans l'Espace parents (plus dans le menu de l'enfant).

## 8. Prochaines questions

1. Le **délai** après un échec (45–60 s) et le **prix** pour réessayer (3–5 pièces) vous conviennent-ils ?
2. Le bilan : faut-il pouvoir **l'exporter** (PDF, e-mail) ou l'écran suffit-il ?
3. Plusieurs **enfants / profils** sur le même appareil ?
4. Validez-vous le **programme** proposé (`04-programme-scolaire.md`) ? Matières à ajouter ou retirer ?
5. Peut-on passer à l'**étape suivante** : concevoir le jeu lui-même (univers, histoire, zones) ?

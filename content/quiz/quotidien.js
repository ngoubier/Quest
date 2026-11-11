// VIE QUOTIDIENNE : se repérer dans le temps, manier l'argent, sécurité, hygiène,
// alimentation, objets et gestes de tous les jours.
import { makeKind } from './maths.js';

const C = (id, ages, prompt, choices, answer, extra = {}) => ({ id, subject: 'quotidien', ages, type: 'choice', prompt, choices, answer, ...extra });
const T = (id, ages, prompt, answer, extra = {}) => ({ id, subject: 'quotidien', ages, type: 'text', prompt, answer, ...extra });

export const QUESTIONS_QUOTIDIEN = [
  // Temps et calendrier
  T('vq-weekend', [6, 7], 'Combien de jours y a-t-il dans un week-end ?', '2', { accept: ['deux'] }),
  T('vq-vendredi', [6, 7], 'Quel jour vient après vendredi ?', 'samedi'),
  T('vq-mars', [7, 8], 'Quel mois vient après mars ?', 'avril'),
  C('vq-hiver', [6, 7], 'Quelle saison est la plus froide ?', ['l’hiver', 'l’été', 'le printemps'], 'l’hiver'),
  T('vq-heures', [7, 9], 'Combien d’heures y a-t-il dans une journée ?', '24', { accept: ['vingt-quatre'] }),
  T('vq-minutes', [8, 9], 'Combien de minutes y a-t-il dans une heure ?', '60', { accept: ['soixante'] }),
  C('vq-semaines-mois', [8, 9], 'Combien de semaines environ y a-t-il dans un mois ?', ['4', '2', '10'], '4'),
  C('vq-semaines-an', [9, 10], 'Combien de semaines y a-t-il dans une année ?', ['52', '12', '100'], '52'),
  C('vq-jours-an', [9, 10], 'Combien de jours y a-t-il dans une année (non bissextile) ?', ['365', '100', '52'], '365'),
  // Argent
  C('vq-centimes', [8, 10], 'Combien de centimes y a-t-il dans 1 euro ?', ['100', '10', '1000'], '100'),
  // Sécurité
  C('vq-pieton', [6, 7], 'Quel feu permet aux piétons de traverser ?', ['le bonhomme vert', 'le bonhomme rouge'], 'le bonhomme vert'),
  C('vq-passage', [7, 8], 'Pour traverser la rue, on utilise…', ['le passage piéton', 'la piste cyclable', 'le milieu de la route'], 'le passage piéton'),
  C('vq-casque', [6, 7], 'Que met-on sur la tête pour faire du vélo ?', ['un casque', 'un bonnet de bain', 'un chapeau de paille'], 'un casque'),
  C('vq-112', [8, 10], 'Quel est le numéro d’urgence européen ?', ['112', '123', '999'], '112'),
  C('vq-pompiers', [8, 10], 'En France, quel numéro appelle les pompiers ?', ['18', '15', '17'], '18', { explain: '15 : SAMU · 17 : police · 18 : pompiers · 112 : urgences en Europe.' }),
  C('vq-samu', [9, 10], 'En France, quel numéro appelle le SAMU ?', ['15', '18', '17'], '15', { explain: '15 : SAMU · 17 : police · 18 : pompiers · 112 : urgences en Europe.' }),
  // Hygiène et santé
  C('vq-mains', [6, 7], 'Avant de manger, il faut…', ['se laver les mains', 'se coucher', 'courir'], 'se laver les mains'),
  C('vq-dents', [6, 7], 'Pour se brosser les dents, on utilise…', ['une brosse à dents', 'un peigne', 'une fourchette'], 'une brosse à dents'),
  // Alimentation, maison
  C('vq-legume', [6, 7], 'Lequel de ces aliments est un légume ?', ['la carotte', 'la banane', 'la fraise'], 'la carotte'),
  C('vq-frigo', [6, 7], 'Où range-t-on le lait frais ?', ['dans le réfrigérateur', 'dans le four', 'sous le lit'], 'dans le réfrigérateur'),
  C('vq-verre', [7, 9], 'Où jette-t-on une bouteille en verre vide ?', ['dans le conteneur à verre', 'dans les toilettes', 'dans le jardin'], 'dans le conteneur à verre'),
  // Objets et transports
  C('vq-train', [6, 7], 'Quel moyen de transport roule sur des rails ?', ['le train', 'le vélo', 'le bateau'], 'le train'),
  C('vq-balance', [7, 9], 'Quel objet sert à peser des fruits ?', ['une balance', 'un thermomètre', 'une montre'], 'une balance'),
  C('vq-thermometre', [8, 10], 'Quel appareil sert à mesurer la température ?', ['un thermomètre', 'une balance', 'une règle'], 'un thermomètre'),
];

// Lire l'heure et compter l'argent : questions générées selon l'âge.
const KINDS_BY_AGE = {
  6: ['moneyCoins'],
  7: ['clockHour', 'moneyCoins'],
  8: ['clockHalf', 'moneyNotes'],
  9: ['clockFive', 'moneyChange'],
  10: ['clockFive', 'moneyCents'],
};

export const QUOTIDIEN_GENERATOR = {
  subject: 'quotidien',
  ages: [6, 10],
  make(rng, age) {
    const q = makeKind(rng.pick(KINDS_BY_AGE[Math.max(6, Math.min(10, age))]), rng);
    return { ...q, subject: 'quotidien', id: q.id.replace('gen:maths:', 'gen:quotidien:') };
  },
};

// Découpe un texte en lignes qui tiennent dans `maxWidth`.
// `measure(str)` renvoie la largeur d'une chaîne (fourni par le renderer).
// Les retours à la ligne explicites (\n) sont respectés.
export function wrapText(text, maxWidth, measure) {
  const lines = [];
  for (const paragraph of String(text).split('\n')) {
    const words = paragraph.split(/ +/);
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (!line || measure(candidate) <= maxWidth) line = candidate;
      else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

/**
 * Normalise une chaîne de caractères (retire les accents, passe en minuscules, supprime les caractères spéciaux)
 */
export function normalizeString(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD') // Décompose les lettres accentuées
    .replace(/[\u0300-\u036f]/g, '') // Retire les accents
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Ne garde que l'alphanumérique et les espaces
    .trim();
}

/**
 * Extrait les mots clés utiles d'une phrase
 */
export function extractTokens(text: string): string[] {
  const normalized = normalizeString(text);
  
  // Liste basique de mots vides (stop words) en français
  const stopWords = [
    'un', 'une', 'des', 'le', 'la', 'les', 'je', 'tu', 'il', 'elle', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses',
    'a', 'de', 'en', 'pour', 'avec', 'sans', 'sur', 'sous', 'dans', 'et', 'ou', 'mais', 'donc', 'car', 'ni', 'qui', 'que', 'quoi',
    'dont', 'ou', 'quand', 'comment', 'pourquoi', 'quel', 'quels', 'quelle', 'quelles', 'ce', 'cet', 'cette', 'ces', 'chercher',
    'recherche', 'trouver', 'j', 'l', 'd', 'm', 't', 's', 'n', 'qu', 'c', 'jai', 'besoin', 'suis', 'est'
  ];
  
  return normalized.split(/\s+/).filter(word => word.length > 2 && !stopWords.includes(word));
}

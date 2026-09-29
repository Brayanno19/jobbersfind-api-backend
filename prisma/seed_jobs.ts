import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Liste des mots vides (stop words) à ignorer lors de l'extraction des mots-clés
const STOP_WORDS = new Set([
  'de', 'la', 'les', 'des', 'du', 'et', 'en', 'pour', 'un', 'une', 'le', 'au', 'aux',
  'sur', 'dans', 'avec', 'sans', 'sous', 'par', 'qui', 'que', 'quoi', 'dont', 'ou',
  'technicien', 'ingénieur', 'spécialiste', 'opérateur', 'agent', 'gestionnaire', 'chef',
  'directeur', 'responsable', 'assistant', 'expert', 'artisan', 'professionnel'
]);

function getSectorStyle(sector: string) {
  if (sector.includes('Agriculture') || sector.includes('Forêt')) {
    return { icon: 'agriculture', color: '0xFF4CAF50' }; // Vert
  }
  if (sector.includes('BTP') || sector.includes('Civil') || sector.includes('Construction')) {
    return { icon: 'construction', color: '0xFFFF9800' }; // Orange
  }
  if (sector.includes('Énergie') || sector.includes('Mines')) {
    return { icon: 'bolt', color: '0xFFFFC107' }; // Jaune
  }
  if (sector.includes('Technologies') || sector.includes('Numérique')) {
    return { icon: 'computer', color: '0xFF2196F3' }; // Bleu
  }
  if (sector.includes('Santé') || sector.includes('Médical')) {
    return { icon: 'local_hospital', color: '0xFFF44336' }; // Rouge
  }
  if (sector.includes('Éducation') || sector.includes('Formation')) {
    return { icon: 'school', color: '0xFF9C27B0' }; // Violet
  }
  if (sector.includes('Transport') || sector.includes('Logistique')) {
    return { icon: 'local_shipping', color: '0xFF607D8B' }; // Bleu Gris
  }
  if (sector.includes('Commerce') || sector.includes('Distribution')) {
    return { icon: 'storefront', color: '0xFF00BCD4' }; // Cyan
  }
  if (sector.includes('Artisanat') || sector.includes('Maintenance')) {
    return { icon: 'handyman', color: '0xFF795548' }; // Marron
  }
  if (sector.includes('Finance') || sector.includes('Gestion')) {
    return { icon: 'account_balance', color: '0xFF3F51B5' }; // Indigo
  }
  if (sector.includes('Hôtellerie') || sector.includes('Restauration') || sector.includes('Tourisme')) {
    return { icon: 'restaurant', color: '0xFFE91E63' }; // Rose
  }
  return { icon: 'work', color: '0xFF9E9E9E' }; // Gris par défaut
}

function extractKeywords(metier: string, description: string): { word: string, weight: number }[] {
  const text = `${metier} ${description}`.toLowerCase();
  // Remplacer la ponctuation par des espaces
  const words = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()']/g, " ").split(/\s+/);
  
  const keywordCounts: Record<string, number> = {};
  
  words.forEach(word => {
    // Normaliser pour enlever les accents
    const normalized = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalized.length > 2 && !STOP_WORDS.has(normalized) && !STOP_WORDS.has(word)) {
      keywordCounts[normalized] = (keywordCounts[normalized] || 0) + 1;
    }
  });

  // Trier par occurrence décroissante, puis prendre les 10 meilleurs
  const sortedWords = Object.keys(keywordCounts)
    .sort((a, b) => keywordCounts[b] - keywordCounts[a])
    .slice(0, 10);
  
  return sortedWords.map((word, index) => ({
    word: word,
    weight: index < 3 ? 5 : (index < 6 ? 4 : 3) // Poids : 5 pour les 3 premiers, 4 pour les 3 suivants, 3 pour le reste
  }));
}

async function main() {
  console.log('Lecture du fichier job.json...');
  const filePath = path.join(__dirname, 'job.json');
  
  if (!fs.existsSync(filePath)) {
    console.error(`Le fichier ${filePath} n'existe pas.`);
    process.exit(1);
  }

  const fileData = fs.readFileSync(filePath, 'utf-8');
  const jobs = JSON.parse(fileData);

  console.log(`Début du seeding de ${jobs.length} métiers (Mode UPSERT Sécurisé)...`);

  let successCount = 0;
  let errorCount = 0;

  for (const job of jobs) {
    if (!job.metier) continue;

    const metierStr = job.metier.trim();
    // Majuscule sur la première lettre
    const metier = metierStr.charAt(0).toUpperCase() + metierStr.slice(1);
    
    const { icon, color } = getSectorStyle(job.secteur || '');
    const keywords = extractKeywords(metier, job.description || '');

    try {
      // 1. Upsert du métier : on préserve l'ID et les relations existantes
      const domain = await prisma.jobDomain.upsert({
        where: { name: metier },
        update: {
          description: job.description || '',
          icon: icon,
          color: color,
          isActive: true
        },
        create: {
          name: metier,
          description: job.description || '',
          icon: icon,
          color: color,
          isActive: true
        },
      });

      // 2. Remplacement des mots-clés
      await prisma.searchKeyword.deleteMany({
        where: { domainId: domain.id }
      });

      if (keywords.length > 0) {
        await prisma.searchKeyword.createMany({
          data: keywords.map(kw => ({
            word: kw.word,
            weight: kw.weight,
            domainId: domain.id
          }))
        });
      }

      successCount++;
    } catch (e) {
      console.error(`❌ Erreur sur ${metier}:`, e);
      errorCount++;
    }
  }

  console.log('====================================');
  console.log(`Seeding terminé : ${successCount} métiers insérés/mis à jour.`);
  if (errorCount > 0) console.log(`Erreurs rencontrées : ${errorCount}`);
  console.log('====================================');
}

main()
  .catch((e) => {
    console.error('Erreur globale lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

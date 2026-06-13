import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding...');

  // Nettoyage des anciennes données (facultatif mais recommandé pour repartir propre)
  await prisma.searchKeyword.deleteMany({});
  await prisma.jobDomain.deleteMany({});

  const domains = [
    {
      name: 'Plombier',
      description: 'Installation, réparation et entretien des canalisations et équipements sanitaires.',
      keywords: [
        { word: 'fuite', weight: 5 },
        { word: 'tuyau', weight: 4 },
        { word: 'evier', weight: 4 },
        { word: 'robinet', weight: 4 },
        { word: 'inondation', weight: 5 },
        { word: 'plomberie', weight: 5 },
        { word: 'wc', weight: 4 },
        { word: 'deboucher', weight: 4 },
      ],
    },
    {
      name: 'Électricien',
      description: 'Installation et maintenance des circuits et équipements électriques.',
      keywords: [
        { word: 'court-circuit', weight: 5 },
        { word: 'courant', weight: 4 },
        { word: 'panne de courant', weight: 3 },
        { word: 'cable', weight: 3 },
        { word: 'disjoncteur', weight: 5 },
        { word: 'lumiere', weight: 3 },
        { word: 'prise', weight: 4 },
        { word: 'electricite', weight: 5 },
      ],
    },
    {
      name: 'Frigoriste',
      description: 'Dépannage de systèmes de climatisation, réfrigérateurs et congélateurs.',
      keywords: [
        { word: 'climatiseur', weight: 5 },
        { word: 'frigo', weight: 5 },
        { word: 'congelateur', weight: 5 },
        { word: 'froid', weight: 4 },
        { word: 'refrigerateur', weight: 5 },
        { word: 'climatisation', weight: 5 },
        { word: 'clim', weight: 4 },
      ],
    },
    {
      name: 'Mécanicien',
      description: 'Entretien et réparation de véhicules automobiles.',
      keywords: [
        { word: 'moteur', weight: 5 },
        { word: 'voiture', weight: 4 },
        { word: 'frein', weight: 5 },
        { word: 'vidange', weight: 4 },
        { word: 'panne', weight: 3 },
        { word: 'vehicule', weight: 4 },
        { word: 'roue', weight: 3 },
        { word: 'pneu', weight: 3 },
      ],
    },
  ];

  for (const domainData of domains) {
    const { keywords, ...basicInfo } = domainData;

    // Créer le domaine
    const createdDomain = await prisma.jobDomain.create({
      data: basicInfo,
    });

    console.log(`Domaine créé : ${createdDomain.name}`);

    // Créer les mots-clés associés
    for (const keyword of keywords) {
      await prisma.searchKeyword.create({
        data: {
          word: keyword.word,
          weight: keyword.weight,
          domainId: createdDomain.id,
        },
      });
    }

    console.log(`  -> ${keywords.length} mots-clés associés`);
  }

  console.log('Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

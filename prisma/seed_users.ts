import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Création des comptes de test...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Vérifier si le client existe
  let client = await prisma.clientUser.findUnique({ where: { email: 'client@jobbersfind.com' } });
  if (!client) {
    client = await prisma.clientUser.create({
      data: {
        email: 'client@jobbersfind.com',
        password: passwordHash,
        firstName: 'Jean',
        lastName: 'Client',
        phoneNumber: '+237600000001',
        isPhoneVerified: true,
      },
    });
    console.log('Client de test créé: client@jobbersfind.com / password123');
  } else {
    console.log('Le client de test existe déjà.');
  }

  // Vérifier si l'artisan existe
  let artisan = await prisma.artisanUser.findUnique({ where: { email: 'artisan@jobbersfind.com' } });
  if (!artisan) {
    // Récupérer un domaine
    const domain = await prisma.jobDomain.findFirst();
    artisan = await prisma.artisanUser.create({
      data: {
        email: 'artisan@jobbersfind.com',
        password: passwordHash,
        firstName: 'Paul',
        lastName: 'Artisan',
        companyName: 'Paul Plomberie',
        phoneNumber: '+237600000002',
        isPhoneVerified: true,
        city: 'Douala',
        neighborhood: 'Akwa',
        isVerified: true, // Pour faciliter les tests
        domains: domain ? {
          connect: [{ id: domain.id }]
        } : undefined,
      },
    });
    console.log('Artisan de test créé: artisan@jobbersfind.com / password123');
  } else {
    console.log('L\'artisan de test existe déjà.');
  }

  console.log('Terminé !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

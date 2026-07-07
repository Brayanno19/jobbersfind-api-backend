import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding Admin...');

  const email = 'tttAdmin20@jobbersfind.com';
  const plainPassword = 'Rafale63TTT@jobbs';

  // Hacher le mot de passe
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  // Vérifier si l'admin existe déjà
  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    // Mettre à jour le mot de passe si le compte existe déjà
    await prisma.admin.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log(`Le mot de passe de l'admin existant ${email} a été mis à jour.`);
  } else {
    // Créer un nouvel admin
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });
    console.log(`Admin créé avec succès : ${admin.email}`);
  }

  console.log('Seeding Admin terminé !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

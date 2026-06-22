import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class NlpSeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seedDictionary() {
    // 1. Création de quelques domaines métiers de base (si non existants)
    const plumberDomain = await this.prisma.jobDomain.upsert({
      where: { name: 'Plombier' },
      update: {},
      create: { name: 'Plombier', description: 'Installations sanitaires et fuites' }
    });

    const electricianDomain = await this.prisma.jobDomain.upsert({
      where: { name: 'Électricien' },
      update: {},
      create: { name: 'Électricien', description: 'Dépannage et installations électriques' }
    });

    const mechanicDomain = await this.prisma.jobDomain.upsert({
      where: { name: 'Mécanicien' },
      update: {},
      create: { name: 'Mécanicien', description: 'Réparation automobile' }
    });

    const transportDomain = await this.prisma.jobDomain.upsert({
      where: { name: 'Transporteur' },
      update: {},
      create: { name: 'Transporteur', description: 'Logistique et déménagement' }
    });
    
    const froidDomain = await this.prisma.jobDomain.upsert({
      where: { name: 'Frigoriste' },
      update: {},
      create: { name: 'Frigoriste', description: 'Climatisation et froid' }
    });

    const shoemakerDomain = await this.prisma.jobDomain.upsert({
      where: { name: 'Cordonnier' },
      update: {},
      create: { name: 'Cordonnier', description: 'Réparation de chaussures et articles en cuir' }
    });

    const garbageDomain = await this.prisma.jobDomain.upsert({
      where: { name: 'Videur de poubelle' },
      update: {},
      create: { name: 'Videur de poubelle', description: 'Collecte et évacuation d\'ordures ménagères' }
    });

    const tutorDomain = await this.prisma.jobDomain.upsert({
      where: { name: 'Répétiteur' },
      update: {},
      create: { name: 'Répétiteur', description: 'Cours de soutien scolaire à domicile' }
    });

    const welderDomain = await this.prisma.jobDomain.upsert({
      where: { name: 'Soudeur' },
      update: {},
      create: { name: 'Soudeur', description: 'Travaux de soudure et construction métallique' }
    });

    const masonDomain = await this.prisma.jobDomain.upsert({
      where: { name: 'Maçon' },
      update: {},
      create: { name: 'Maçon', description: 'Travaux de maçonnerie et bâtiment' }
    });

    const hairDomain = await this.prisma.jobDomain.upsert({
      where: { name: 'Coiffeur' },
      update: {},
      create: { name: 'Coiffeur', description: 'Coiffure hommes et femmes, tresses et soins' }
    });

    // 2. Dictionnaire des Mots-clés avec expressions camerounaises
    const keywords = [
      // Plomberie
      { word: 'fuite', domainId: plumberDomain.id, weight: 5 },
      { word: 'eau', domainId: plumberDomain.id, weight: 3 },
      { word: 'tuyau', domainId: plumberDomain.id, weight: 4 },
      { word: 'robinet', domainId: plumberDomain.id, weight: 4 },
      { word: 'sanitaire', domainId: plumberDomain.id, weight: 3 },
      { word: 'pompe', domainId: plumberDomain.id, weight: 3 },
      { word: 'forage', domainId: plumberDomain.id, weight: 5 }, // Très commun au Cameroun

      // Électricité
      { word: 'courant', domainId: electricianDomain.id, weight: 4 },
      { word: 'lumiere', domainId: electricianDomain.id, weight: 3 },
      { word: 'cable', domainId: electricianDomain.id, weight: 3 },
      { word: 'disjoncteur', domainId: electricianDomain.id, weight: 5 },
      { word: 'eneo', domainId: electricianDomain.id, weight: 5 }, // Compagnie d'électricité
      { word: 'compteur', domainId: electricianDomain.id, weight: 4 },

      // Mécanique
      { word: 'panne', domainId: mechanicDomain.id, weight: 3 },
      { word: 'voiture', domainId: mechanicDomain.id, weight: 4 },
      { word: 'moteur', domainId: mechanicDomain.id, weight: 4 },
      { word: 'depannage', domainId: mechanicDomain.id, weight: 3 },
      { word: 'frein', domainId: mechanicDomain.id, weight: 4 },
      { word: 'tolier', domainId: mechanicDomain.id, weight: 5 }, // Tôlier

      // Transport (Motos, Taxis)
      { word: 'bendskin', domainId: transportDomain.id, weight: 5 }, // Moto-taxi Camerounais
      { word: 'moto', domainId: transportDomain.id, weight: 4 },
      { word: 'demenagement', domainId: transportDomain.id, weight: 4 },
      { word: 'cargo', domainId: transportDomain.id, weight: 3 },
      { word: 'clando', domainId: transportDomain.id, weight: 4 }, // Transport clandestin/informel

      // Frigoriste / Climatisation
      { word: 'clim', domainId: froidDomain.id, weight: 5 },
      { word: 'climatiseur', domainId: froidDomain.id, weight: 4 },
      { word: 'frigo', domainId: froidDomain.id, weight: 4 },
      { word: 'congelateur', domainId: froidDomain.id, weight: 4 },
      { word: 'froid', domainId: froidDomain.id, weight: 4 },
      { word: 'compresseur', domainId: froidDomain.id, weight: 4 },

      // Cordonnier
      { word: 'cordonnier', domainId: shoemakerDomain.id, weight: 5 },
      { word: 'chaussure', domainId: shoemakerDomain.id, weight: 4 },
      { word: 'savate', domainId: shoemakerDomain.id, weight: 4 },
      { word: 'talon', domainId: shoemakerDomain.id, weight: 3 },
      { word: 'sac', domainId: shoemakerDomain.id, weight: 3 },

      // Videur de poubelle
      { word: 'poubelle', domainId: garbageDomain.id, weight: 5 },
      { word: 'ordure', domainId: garbageDomain.id, weight: 4 },
      { word: 'salete', domainId: garbageDomain.id, weight: 3 },
      { word: 'videur', domainId: garbageDomain.id, weight: 3 },
      { word: 'hysacam', domainId: garbageDomain.id, weight: 5 },

      // Répétiteur
      { word: 'repetiteur', domainId: tutorDomain.id, weight: 5 },
      { word: 'cours', domainId: tutorDomain.id, weight: 4 },
      { word: 'ecole', domainId: tutorDomain.id, weight: 3 },
      { word: 'lecon', domainId: tutorDomain.id, weight: 3 },
      { word: 'prof', domainId: tutorDomain.id, weight: 4 },
      { word: 'classe', domainId: tutorDomain.id, weight: 3 },
      { word: 'devoirs', domainId: tutorDomain.id, weight: 4 },

      // Soudeur
      { word: 'soudeur', domainId: welderDomain.id, weight: 5 },
      { word: 'soudure', domainId: welderDomain.id, weight: 4 },
      { word: 'portail', domainId: welderDomain.id, weight: 4 },
      { word: 'grille', domainId: welderDomain.id, weight: 3 },
      { word: 'antivol', domainId: welderDomain.id, weight: 4 },
      { word: 'fer', domainId: welderDomain.id, weight: 3 },

      // Maçon
      { word: 'macon', domainId: masonDomain.id, weight: 5 },
      { word: 'ciment', domainId: masonDomain.id, weight: 3 },
      { word: 'brique', domainId: masonDomain.id, weight: 4 },
      { word: 'dalle', domainId: masonDomain.id, weight: 4 },
      { word: 'crepir', domainId: masonDomain.id, weight: 4 },

      // Coiffeur
      { word: 'coiffeur', domainId: hairDomain.id, weight: 5 },
      { word: 'tresse', domainId: hairDomain.id, weight: 5 },
      { word: 'coupe', domainId: hairDomain.id, weight: 4 },
      { word: 'cheveux', domainId: hairDomain.id, weight: 4 },
      { word: 'barbe', domainId: hairDomain.id, weight: 3 },
    ];


    let count = 0;
    for (const kw of keywords) {
      // Vérifier si le mot existe déjà pour éviter les doublons
      const exists = await this.prisma.searchKeyword.findUnique({ where: { word: kw.word } });
      if (!exists) {
        await this.prisma.searchKeyword.create({ data: kw });
        count++;
      }
    }

    return { message: `${count} mots-clés camerounais ajoutés avec succès au dictionnaire NLP.` };
  }

  async seedArtisans() {
    await this.seedDictionary();
    const passwordHash = await bcrypt.hash('password123', 10);

    const domains = await this.prisma.jobDomain.findMany();
    const findDomain = (name: string) => domains.find(d => d.name === name);

    const mockArtisans = [
      {
        email: 'jean.froid@example.com',
        phoneNumber: '+237690000001',
        password: passwordHash,
        firstName: 'Jean',
        lastName: 'Tout-Frais',
        companyName: 'Froid & Clim Pro',
        nationality: 'Camerounaise',
        isVerified: true,
        isPhoneVerified: true,
        credibilityScore: 800.0,
        averageRating: 4.8,
        latitude: 4.0480,
        longitude: 9.7020,
        city: 'Douala',
        neighborhood: 'Akwa',
        domainsList: ['Frigoriste']
      },
      {
        email: 'amadou.volt@example.com',
        phoneNumber: '+237690000002',
        password: passwordHash,
        firstName: 'Amadou',
        lastName: 'Volt',
        companyName: 'Amadou Électricité',
        nationality: 'Camerounaise',
        isVerified: true,
        isPhoneVerified: true,
        credibilityScore: 650.0,
        averageRating: 4.2,
        latitude: 4.0620,
        longitude: 9.7120,
        city: 'Douala',
        neighborhood: 'Deido',
        domainsList: ['Électricien']
      },
      {
        email: 'pierre.tuyau@example.com',
        phoneNumber: '+237690000003',
        password: passwordHash,
        firstName: 'Pierre',
        lastName: 'Tuyau',
        companyName: 'SOS Plomberie Akwa',
        nationality: 'Camerounaise',
        isVerified: true,
        isPhoneVerified: true,
        credibilityScore: 900.0,
        averageRating: 4.9,
        latitude: 4.0250,
        longitude: 9.6950,
        city: 'Douala',
        neighborhood: 'Bonapriso',
        domainsList: ['Plombier']
      },
      {
        email: 'alain.soudeur@example.com',
        phoneNumber: '+237690000004',
        password: passwordHash,
        firstName: 'Alain',
        lastName: 'Soudure',
        companyName: 'Atelier Métal Moderne Bassa',
        nationality: 'Camerounaise',
        isVerified: true,
        isPhoneVerified: true,
        credibilityScore: 550.0,
        averageRating: 4.0,
        latitude: 4.0410,
        longitude: 9.7380,
        city: 'Douala',
        neighborhood: 'Bassa',
        domainsList: ['Soudeur']
      },
      {
        email: 'mama.propre@example.com',
        phoneNumber: '+237690000005',
        password: passwordHash,
        firstName: 'Mama',
        lastName: 'Propre',
        companyName: 'Service Vert Bastos',
        nationality: 'Camerounaise',
        isVerified: true,
        isPhoneVerified: true,
        credibilityScore: 750.0,
        averageRating: 4.5,
        latitude: 3.8920,
        longitude: 11.5120,
        city: 'Yaoundé',
        neighborhood: 'Bastos',
        domainsList: ['Videur de poubelle']
      },
      {
        email: 'prof.calvin@example.com',
        phoneNumber: '+237690000006',
        password: passwordHash,
        firstName: 'Prof',
        lastName: 'Calvin',
        companyName: 'Répétitions Académiques Yaoundé',
        nationality: 'Camerounaise',
        isVerified: true,
        isPhoneVerified: true,
        credibilityScore: 850.0,
        averageRating: 4.7,
        latitude: 3.8810,
        longitude: 11.4980,
        city: 'Yaoundé',
        neighborhood: 'Tsinga',
        domainsList: ['Répétiteur']
      },
      {
        email: 'emmanuel.cordon@example.com',
        phoneNumber: '+237690000007',
        password: passwordHash,
        firstName: 'Emmanuel',
        lastName: 'Cordon',
        companyName: 'Shoe Doctor Bonamoussadi',
        nationality: 'Camerounaise',
        isVerified: true,
        isPhoneVerified: true,
        credibilityScore: 600.0,
        averageRating: 4.1,
        latitude: 4.0850,
        longitude: 9.7400,
        city: 'Douala',
        neighborhood: 'Bonamoussadi',
        domainsList: ['Cordonnier']
      },
      {
        email: 'marc.brique@example.com',
        phoneNumber: '+237690000008',
        password: passwordHash,
        firstName: 'Marc',
        lastName: 'Brique',
        companyName: 'Bâtisseurs Pro Kotto',
        nationality: 'Camerounaise',
        isVerified: true,
        isPhoneVerified: true,
        credibilityScore: 700.0,
        averageRating: 4.4,
        latitude: 4.0950,
        longitude: 9.7550,
        city: 'Douala',
        neighborhood: 'Kotto',
        domainsList: ['Maçon']
      }
    ];

    let count = 0;
    for (const artisan of mockArtisans) {
      const exists = await this.prisma.artisanUser.findUnique({
        where: { phoneNumber: artisan.phoneNumber }
      });

      if (!exists) {
        const { domainsList, ...artisanData } = artisan;
        const matchedDomainObjects = domainsList
          .map(name => findDomain(name))
          .filter(d => d !== undefined);

        await this.prisma.artisanUser.create({
          data: {
            ...artisanData,
            domains: {
              connect: matchedDomainObjects.map(d => ({ id: d.id }))
            }
          }
        });
        count++;
      }
    }

    return { message: `${count} artisans camerounais simulés avec succès dans la base de données.` };
  }
}

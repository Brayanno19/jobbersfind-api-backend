import { Injectable } from '@nestjs/common';
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
}

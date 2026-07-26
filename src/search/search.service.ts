import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { extractTokens } from './utils/nlp.util';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchArtisans(dto: SearchQueryDto) {
    const { query, latitude, longitude, radius = 10 } = dto;
    const tokens = extractTokens(query);

    // 1. NLP : Trouver les domaines correspondants aux mots-clés dans la DB
    const matchedDomains = await this.prisma.searchKeyword.findMany({
      where: {
        word: { in: tokens }
      },
      select: { domainId: true, weight: true }
    });

    const domainIds = [...new Set(matchedDomains.map(d => d.domainId))];

    import { Prisma } from '@prisma/client';

    const hasLocation = latitude != null && longitude != null;
    const hasQuery = tokens.length > 0;

    let whereClause = Prisma.sql`WHERE a."isVerified" = true AND a."isActive" = true`;
    
    // Si pas de requête textuelle, on limite strictement au rayon pour ne pas renvoyer toute la base de données
    if (!hasQuery && hasLocation) {
       whereClause = Prisma.sql`${whereClause} AND a.latitude IS NOT NULL AND a.longitude IS NOT NULL AND ( 6371 * acos( cos( radians(${latitude}) ) * cos( radians( a.latitude ) ) * cos( radians( a.longitude ) - radians(${longitude}) ) + sin( radians(${latitude}) ) * sin( radians( a.latitude ) ) ) ) <= ${radius}`;
    }

    const querySql = hasLocation 
      ? Prisma.sql`
          SELECT 
            a.id, a."firstName", a."lastName", a."companyName", a."averageRating", a."credibilityScore",
            a.latitude, a.longitude, a.city, a.neighborhood, a."avatarUrl", a."phoneNumber",
            ( 6371 * acos( cos( radians(${latitude}) ) * cos( radians( a.latitude ) ) 
            * cos( radians( a.longitude ) - radians(${longitude}) ) 
            + sin( radians(${latitude}) ) * sin( radians( a.latitude ) ) ) ) AS distance
          FROM "ArtisanUser" a
          ${whereClause}
        `
      : Prisma.sql`
          SELECT 
            a.id, a."firstName", a."lastName", a."companyName", a."averageRating", a."credibilityScore",
            a.latitude, a.longitude, a.city, a.neighborhood, a."avatarUrl", a."phoneNumber",
            NULL AS distance
          FROM "ArtisanUser" a
          ${whereClause}
        `;

    const artisansRaw: any[] = await this.prisma.$queryRaw(querySql);

    if (!artisansRaw.length) return [];

    const artisanIds = artisansRaw.map(a => a.id);

    // Récupérer les domaines des artisans trouvés pour le calcul métier
    const artisansWithDomains = await this.prisma.artisanUser.findMany({
      where: { id: { in: artisanIds } },
      select: {
        id: true,
        domains: { select: { id: true, name: true } }
      }
    });

    // 3. Algorithme de Classement (Score global sur 100)
    // 40% Métier, 30% Distance, 20% Crédibilité, 10% Activité
    let results = artisansRaw.map(artisan => {
      let score = 0;

      const artisanDomains = artisansWithDomains.find(ad => ad.id === artisan.id)?.domains || [];
      const artisanDomainIds = artisanDomains.map(d => d.id);
      
      const matchMetier = artisanDomainIds.some(id => domainIds.includes(id));
      const nameMatch = hasQuery && tokens.some(t => 
        (artisan.firstName && artisan.firstName.toLowerCase().includes(t.toLowerCase())) || 
        (artisan.lastName && artisan.lastName.toLowerCase().includes(t.toLowerCase())) ||
        (artisan.companyName && artisan.companyName.toLowerCase().includes(t.toLowerCase()))
      );

      // --- Filtre Strict si Requête ---
      if (hasQuery) {
        if (!matchMetier && !nameMatch) {
          return null; // Ne correspond ni au métier ni au nom
        }
        score += 40; // Correspondance trouvée !
      } else {
        score += 40; // Pas de requête : score métier max pour tout le monde
      }

      // --- 30% Score Distance ---
      const dist = artisan.distance;
      if (dist != null) {
        if (dist <= radius) {
          const distanceScore = Math.max(0, 30 * (1 - (dist / radius)));
          score += distanceScore;
        } else {
          score += 0; // Au delà du rayon, score de distance nul mais on le garde s'il a le métier
        }
      } else {
        score += 15; // Valeur moyenne si pas de GPS
      }

      // --- 20% Score Crédibilité ---
      const cred = artisan.credibilityScore || 500;
      const credScore = Math.min(20, (cred / 1000) * 20);
      score += credScore;

      // --- 10% Score Activité ---
      score += 10; 

      return {
        ...artisan,
        domains: artisanDomains,
        globalScore: Math.round(score),
      };
    }).filter(r => r !== null); // Supprimer les artisans qui ne matchent pas la requête

    // Tri décroissant
    return results.sort((a, b) => b!.globalScore - a!.globalScore);
  }

  async getArtisanProfileById(id: string) {
    const artisan = await this.prisma.artisanUser.findUnique({
      where: { id },
      include: {
        domains: true,
        documents: {
          select: { id: true, type: true, url: true, status: true, uploadedAt: true }
        },
        videos: {
          select: { id: true, type: true, url: true, uploadedAt: true }
        },
        services: true,
        portfolio: true,
        posts: {
          orderBy: { createdAt: 'desc' }
        },
      }
    });

    if (!artisan) {
      return null;
    }

    return artisan;
  }
}

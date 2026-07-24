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

    // 2. RAW SQL : Trouver les artisans à proximité (Haversine formula comme fallback robuste si PostGIS n'est pas dispo)
    // 6371 correspond au rayon de la terre en km.
    const artisansRaw: any[] = await this.prisma.$queryRaw`
      SELECT 
        a.id, a."firstName", a."lastName", a."companyName", a."averageRating", a."credibilityScore",
        a.latitude, a.longitude, a.city, a.neighborhood, a."avatarUrl", a."phoneNumber",
        ( 6371 * acos( cos( radians(${latitude}) ) * cos( radians( a.latitude ) ) 
        * cos( radians( a.longitude ) - radians(${longitude}) ) 
        + sin( radians(${latitude}) ) * sin( radians( a.latitude ) ) ) ) AS distance
      FROM "ArtisanUser" a
      WHERE a."isVerified" = true
      AND a."isActive" = true
      AND a.latitude IS NOT NULL
      AND a.longitude IS NOT NULL
      AND ( 6371 * acos( cos( radians(${latitude}) ) * cos( radians( a.latitude ) ) 
        * cos( radians( a.longitude ) - radians(${longitude}) ) 
        + sin( radians(${latitude}) ) * sin( radians( a.latitude ) ) ) ) <= ${radius}
    `;

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

      // --- 40% Score Métier ---
      const artisanDomains = artisansWithDomains.find(ad => ad.id === artisan.id)?.domains || [];
      const artisanDomainIds = artisanDomains.map(d => d.id);
      
      const matchMetier = artisanDomainIds.some(id => domainIds.includes(id));
      if (matchMetier) {
        score += 40;
      } else if (domainIds.length === 0 && tokens.length === 0) {
        // Si requête vide, on donne la moyenne pour éviter de pénaliser inutilement
        score += 20; 
      }
      
      // Filtre Strict : Si on cherchait un métier précis, et que cet artisan ne l'a pas, 
      // on peut soit le garder avec un score faible, soit le filtrer. 
      // Pour l'instant on le garde, mais il sera mal classé.

      // --- 30% Score Distance ---
      const dist = artisan.distance || 0;
      // Plus c'est proche de 0, plus on a de points (max 30)
      const distanceScore = Math.max(0, 30 * (1 - (dist / radius)));
      score += distanceScore;

      // --- 20% Score Crédibilité ---
      // Supposons que credibilityScore base est 500, max raisonnable ~1000
      const cred = artisan.credibilityScore || 500;
      const credScore = Math.min(20, (cred / 1000) * 20);
      score += credScore;

      // --- 10% Score Activité ---
      // Bonus fixe pour l'instant (sera dynamique quand on aura des logs de connexion)
      score += 10; 

      return {
        ...artisan,
        domains: artisanDomains,
        globalScore: Math.round(score),
      };
    });

    // Filtre optionnel : on ne garde que ceux qui ont au moins 20 points
    results = results.filter(r => r.globalScore >= 20);

    // Tri décroissant
    return results.sort((a, b) => b.globalScore - a.globalScore);
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

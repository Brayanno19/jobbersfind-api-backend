import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { extractTokens } from './utils/nlp.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchArtisans(dto: SearchQueryDto) {
    // 1. Extraction et NLP
    const { query, latitude, longitude, radius = 10 } = dto;
    const tokens = extractTokens(query || "").filter(t => t.length > 2); // Ignorer les mots trop courts
    const hasQuery = tokens.length > 0;
    const hasLocation = latitude != null && longitude != null;

    let domainIds: string[] = [];
    if (hasQuery) {
      const matchedDomains = await this.prisma.searchKeyword.findMany({
        where: { word: { in: tokens } },
        select: { domainId: true }
      });
      domainIds = [...new Set(matchedDomains.map(d => d.domainId))];
    }

    // 2. Construction des fragments SQL sécurisés
    // Fragment: Vérification si l'artisan possède l'un des métiers identifiés
    const domainCheckSql = domainIds.length > 0
      ? Prisma.sql`EXISTS (SELECT 1 FROM "_ArtisanUserToJobDomain" jd WHERE jd."A" = a.id AND jd."B" IN (${Prisma.join(domainIds)}))`
      : Prisma.sql`false`;

    // Fragment: Vérification de correspondance de nom
    let nameCheckSql = Prisma.sql`false`;
    if (hasQuery) {
      const nameConditions = tokens.map(t => 
        Prisma.sql`(a."firstName" ILIKE ${'%' + t + '%'} OR a."lastName" ILIKE ${'%' + t + '%'} OR a."companyName" ILIKE ${'%' + t + '%'})`
      );
      nameCheckSql = Prisma.sql`(${Prisma.join(nameConditions, ' OR ')})`;
    }

    // Fragment: Calcul de la distance géospatiale (Haversine)
    const distanceSql = hasLocation
      ? Prisma.sql`( 6371 * acos( cos( radians(${latitude}) ) * cos( radians( a.latitude ) ) * cos( radians( a.longitude ) - radians(${longitude}) ) + sin( radians(${latitude}) ) * sin( radians( a.latitude ) ) ) )`
      : Prisma.sql`NULL::float`;

    // Fragment: WHERE de base
    let whereClause = Prisma.sql`WHERE a."isVerified" = true AND a."isActive" = true`;

    // Filtrage strict par requête si présente
    if (hasQuery) {
      whereClause = Prisma.sql`${whereClause} AND (${domainCheckSql} OR ${nameCheckSql})`;
    } else if (hasLocation) {
      // Si pas de requête, on filtre pour ne renvoyer que les personnes aux alentours (ex: 2x le rayon pour avoir de la marge)
      whereClause = Prisma.sql`${whereClause} AND a.latitude IS NOT NULL AND a.longitude IS NOT NULL AND ${distanceSql} <= ${radius * 2}`;
    }

    // 3. Calcul des scores en SQL
    // Score de match métier/nom (40 points max)
    const matchScoreSql = hasQuery
      ? Prisma.sql`(CASE WHEN ${domainCheckSql} THEN 40 WHEN ${nameCheckSql} THEN 30 ELSE 0 END)`
      : Prisma.sql`40`;

    // Score de distance (30 points max) - Bonus si dans le rayon, pénalité au delà
    const distanceScoreSql = hasLocation
      ? Prisma.sql`
          (CASE 
            WHEN ${distanceSql} IS NULL THEN 15
            WHEN ${distanceSql} <= ${radius} THEN 30 * (1 - (${distanceSql} / ${radius}))
            ELSE 0 
          END)
        `
      : Prisma.sql`15`;

    // Score de crédibilité (20 points max)
    const credScoreSql = Prisma.sql`LEAST(20, (COALESCE(a."credibilityScore", 500) / 1000.0) * 20)`;

    // Score d'activité (10 points max)
    const activityScoreSql = Prisma.sql`10`;

    // Limite stricte pour la recherche instantanée (très important pour les perfs)
    const limit = hasQuery ? 30 : 50;

    const querySql = Prisma.sql`
      SELECT 
        a.id, a."firstName", a."lastName", a."companyName", a."averageRating", a."credibilityScore",
        a.latitude, a.longitude, a.city, a.neighborhood, a."avatarUrl", a."phoneNumber",
        ${distanceSql} AS distance,
        ROUND(CAST(${matchScoreSql} + ${distanceScoreSql} + ${credScoreSql} + ${activityScoreSql} AS numeric), 0) AS "globalScore"
      FROM "ArtisanUser" a
      ${whereClause}
      ORDER BY "globalScore" DESC
      LIMIT ${limit}
    `;

    // 4. Exécution de la requête optimisée
    const artisansRaw: any[] = await this.prisma.$queryRaw(querySql);

    if (!artisansRaw.length) return [];

    const artisanIds = artisansRaw.map(a => a.id);

    // 5. Récupération des domaines pour formater la réponse JSON attendue par l'app
    const artisansWithDomains = await this.prisma.artisanUser.findMany({
      where: { id: { in: artisanIds } },
      select: {
        id: true,
        domains: { select: { id: true, name: true } }
      }
    });

    const results = artisansRaw.map(artisan => {
      const artisanDomains = artisansWithDomains.find(ad => ad.id === artisan.id)?.domains || [];
      return {
        ...artisan,
        globalScore: Number(artisan.globalScore),
        domains: artisanDomains,
      };
    });

    return results;
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

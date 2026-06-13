import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrUpdateReview(clientId: string, artisanId: string, dto: CreateReviewDto) {
    const artisan = await this.prisma.artisanUser.findUnique({
      where: { id: artisanId }
    });
    if (!artisan) {
      throw new NotFoundException('Artisan introuvable');
    }

    const existingReview = await this.prisma.review.findUnique({
      where: {
        clientId_artisanId: { clientId, artisanId }
      }
    });

    const oldRating = existingReview ? existingReview.rating : null;
    const newRating = dto.rating;

    // Transaction pour garantir la cohérence
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Upsert l'avis
      const review = await tx.review.upsert({
        where: {
          clientId_artisanId: { clientId, artisanId }
        },
        update: {
          rating: newRating,
          comment: dto.comment,
        },
        create: {
          clientId,
          artisanId,
          rating: newRating,
          comment: dto.comment,
        }
      });

      // 2. Calculer la nouvelle moyenne (averageRating)
      const allReviews = await tx.review.findMany({
        where: { artisanId }
      });
      const totalRatings = allReviews.length;
      const sumRatings = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating = sumRatings / totalRatings;

      // 3. Calculer l'impact sur le credibilityScore
      const getModifier = (r: number) => {
        switch(r) {
          case 5: return 10;
          case 4: return 5;
          case 3: return 0;
          case 2: return -5;
          case 1: return -15;
          default: return 0;
        }
      };

      let scoreDelta = 0;
      if (oldRating !== null) {
        scoreDelta = getModifier(newRating) - getModifier(oldRating);
      } else {
        scoreDelta = getModifier(newRating);
      }

      const newCredibilityScore = Math.max(0, artisan.credibilityScore + scoreDelta);

      // 4. Mettre à jour l'artisan
      await tx.artisanUser.update({
        where: { id: artisanId },
        data: {
          averageRating,
          credibilityScore: newCredibilityScore
        }
      });

      return review;
    });

    return result;
  }

  async getArtisanReviews(artisanId: string) {
    return this.prisma.review.findMany({
      where: { artisanId },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

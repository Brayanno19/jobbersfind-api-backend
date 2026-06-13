import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard, ClientGuard } from '../auth/guards/roles.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard, ClientGuard)
  @Post(':artisanId')
  createOrUpdateReview(
    @Request() req,
    @Param('artisanId') artisanId: string,
    @Body() dto: CreateReviewDto
  ) {
    return this.reviewsService.createOrUpdateReview(req.user.userId, artisanId, dto);
  }

  @Get('artisan/:artisanId')
  getArtisanReviews(@Param('artisanId') artisanId: string) {
    return this.reviewsService.getArtisanReviews(artisanId);
  }
}

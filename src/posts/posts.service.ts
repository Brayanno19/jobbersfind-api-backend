import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreatePostDto, MediaType } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

  async createPost(artisanId: string, dto: CreatePostDto, file?: Express.Multer.File) {
    let mediaUrl = dto.mediaUrl;
    let mediaType = dto.mediaType;

    if (file) {
      // Basic size validation
      const maxSize = dto.mediaType === MediaType.VIDEO ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
         throw new BadRequestException(`Fichier trop volumineux. Max autorisé: ${maxSize / (1024*1024)} Mo`);
      }

      const uploadResultUrl = await this.uploadsService.uploadFile(file, 'posts');
      if (!uploadResultUrl) {
        throw new BadRequestException('Erreur lors de l\'upload du fichier');
      }
      mediaUrl = uploadResultUrl;
      mediaType = dto.mediaType || (file.mimetype.startsWith('video/') ? MediaType.VIDEO : MediaType.IMAGE);
    }

    return this.prisma.post.create({
      data: {
        artisanId,
        content: dto.content,
        mediaUrl,
        mediaType,
      },
    });
  }

  async getArtisanFeed(artisanId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { artisanId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where: { artisanId } }),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGlobalFeed(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          artisan: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              avatarUrl: true,
              domains: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.post.count(),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPostById(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post non trouvé');
    return post;
  }

  async updatePost(id: string, artisanId: string, dto: UpdatePostDto) {
    const post = await this.getPostById(id);
    if (post.artisanId !== artisanId) {
      throw new BadRequestException('Vous n\'êtes pas autorisé à modifier ce post');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        content: dto.content,
        // Updating media requires more complex logic or separate endpoint, kept simple here
      },
    });
  }

  async deletePost(id: string, artisanId: string) {
    const post = await this.getPostById(id);
    if (post.artisanId !== artisanId) {
      throw new BadRequestException('Vous n\'êtes pas autorisé à supprimer ce post');
    }

    return this.prisma.post.delete({ where: { id } });
  }
}

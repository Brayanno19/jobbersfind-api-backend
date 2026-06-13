import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    return this.prisma.jobDomain.create({ data: dto });
  }

  async findAll() {
    return this.prisma.jobDomain.findMany({ where: { isActive: true } });
  }

  async findAllAdmin() {
    return this.prisma.jobDomain.findMany();
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.jobDomain.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Métier introuvable');

    return this.prisma.jobDomain.update({
      where: { id },
      data: dto,
    });
  }
}

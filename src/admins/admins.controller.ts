import { Controller, Get, Patch, Param, Body, UseGuards, Query, Post, Delete } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { JwtAuthGuard, AdminGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('stats')
  getGlobalStats() {
    return this.adminsService.getGlobalStats();
  }

  @Get('clients')
  getClients(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string
  ) {
    return this.adminsService.getClients(+page, +limit, search, status);
  }

  @Patch('clients/:id/status')
  updateClientStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ) {
    return this.adminsService.updateClientStatus(id, isActive);
  }

  @Get('artisans')
  getArtisans(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('isVerified') isVerified?: string
  ) {
    return this.adminsService.getArtisans(+page, +limit, search, status, isVerified);
  }

  @Patch('artisans/:id/status')
  updateArtisanStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean
  ) {
    return this.adminsService.updateArtisanStatus(id, isActive);
  }

  @Get('artisans/:id')
  getArtisanFullProfile(@Param('id') id: string) {
    return this.adminsService.getArtisanFullProfile(id);
  }

  @Get('artisans/:id/posts')
  getArtisanPosts(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.adminsService.getArtisanPosts(id, +page, +limit);
  }

  @Delete('posts/:postId')
  deletePost(@Param('postId') postId: string) {
    return this.adminsService.deletePost(postId);
  }

  @Patch('artisans/:id/unlock-dossier')
  unlockArtisanDossier(@Param('id') id: string) {
    return this.adminsService.unlockArtisanDossier(id);
  }

  @Delete('documents/:docId')
  deleteDocument(@Param('docId') docId: string) {
    return this.adminsService.deleteDocument(docId);
  }
  // --- CATEGORIES (JobDomain) ---
  @Get('categories')
  getCategories() {
    return this.adminsService.getCategories();
  }

  @Post('categories')
  createCategory(@Body() data: { name: string, description?: string, isActive?: boolean }) {
    return this.adminsService.createCategory(data);
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() data: { name?: string, description?: string, isActive?: boolean }
  ) {
    return this.adminsService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminsService.deleteCategory(id);
  }

  // --- NOTIFICATIONS GLOBALES ---
  @Post('notifications/broadcast')
  broadcastNotification(@Body() data: { title: string, body: string, target: 'CLIENTS' | 'ARTISANS' | 'ALL' }) {
    return this.adminsService.broadcastNotification(data);
  }
}

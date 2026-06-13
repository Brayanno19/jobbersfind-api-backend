import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Query, Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard, ArtisanGuard } from '../auth/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, ArtisanGuard)
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Request() req,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.postsService.createPost(req.user.userId, createPostDto, file);
  }

  @Get('artisan/:artisanId')
  getFeed(
    @Param('artisanId') artisanId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.postsService.getArtisanFeed(artisanId, +page, +limit);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, ArtisanGuard)
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, req.user.userId, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ArtisanGuard)
  remove(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.postsService.deletePost(id, req.user.userId);
  }
}

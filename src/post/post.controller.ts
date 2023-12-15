import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create.post.dto';
import { Request as ExpressRequest } from 'express';
import { UpdatePostDto } from './dto/update.post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get(':postId')
  getPost(@Param('postId') postId: string) {
    return this.postService.getPost(postId);
  }

  @Post('create')
  createPost(@Body() body: CreatePostDto, @Request() req: ExpressRequest) {
    return this.postService.createPost(body, req['user']['id']);
  }

  @Post('update/:postId')
  updatePost(@Body() body: UpdatePostDto, @Param('postId') postId: string) {
    return this.postService.updatePost(body, postId);
  }

  @Get('like/:postId')
  likePost(@Param('postId') postId: string, @Request() req: ExpressRequest) {
    return this.postService.likePost(postId, req['user']['username']);
  }

  @Get('save/:postId')
  savePost(@Param('postId') postId: string, @Request() req: ExpressRequest) {
    return this.postService.savePost(postId, req['user']['username']);
  }

  @Delete(':postId')
  deletePost(@Param('postId') postId: string) {
    return this.postService.deletePost(postId);
  }
}

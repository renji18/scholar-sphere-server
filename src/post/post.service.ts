import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreatePostDto } from './dto/create.post.dto';
import { UpdatePostDto } from './dto/update.post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async getPost(id: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        comments: true,
        contentUrls: true,
        liked: true,
        saved: true,
        user: true,
        _count: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async createPost(
    data: CreatePostDto,
    userId: string,
  ): Promise<{ message: string }> {
    const { title, description, content } = data;
    const finalData = { title, description, userId };
    await this.prisma.post.create({
      data: {
        ...finalData,
        contentUrls: {
          create: content?.map((url) => ({ url })),
        },
      },
      include: {
        contentUrls: true,
        user: true,
      },
    });
    return { message: 'Post Created Successfully' };
  }

  async updatePost(
    data: UpdatePostDto,
    id: string,
  ): Promise<{ message: string }> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { contentUrls: true, user: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const { title, description, content } = data;

    await this.prisma.imageUrls.deleteMany({
      where: { postId: id },
    });

    await this.prisma.post.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        contentUrls: {
          create: content?.map((url) => ({ url })),
        },
      },
      include: {
        contentUrls: true,
        user: true,
      },
    });

    return { message: 'Post Updated Successfully' };
  }

  async likePost(id: string, userName: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { userName },
      include: {
        likedPosts: true,
      },
    });
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { liked: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const isUserLiked = post.liked.some(
      (likedUser) => likedUser.id === user.id,
    );
    const isPostLiked = user.likedPosts.some(
      (likedPost) => likedPost.id === post.id,
    );

    await this.prisma.post.update({
      where: { id },
      data: {
        liked: isUserLiked
          ? { disconnect: { id: user.id } }
          : { connect: { id: user.id } },
      },
      include: {
        liked: true,
        user: true,
      },
    });
    await this.prisma.user.update({
      where: { userName },
      data: {
        likedPosts: isPostLiked
          ? { disconnect: { id: post.id } }
          : { connect: { id: post.id } },
      },
      include: {
        posts: true,
        likedPosts: true,
      },
    });

    return { message: 'Post Liked Successfully' };
  }

  async savePost(id: string, userName: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { userName },
      include: {
        savedPosts: true,
      },
    });
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { saved: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const isUserSaved = post.saved.some(
      (savedUser) => savedUser.id === user.id,
    );
    const isPostSaved = user.savedPosts.some(
      (savedPost) => savedPost.id === post.id,
    );

    await this.prisma.post.update({
      where: { id },
      data: {
        saved: isUserSaved
          ? { disconnect: { id: user.id } }
          : { connect: { id: user.id } },
      },
      include: {
        liked: true,
        saved: true,
        user: true,
      },
    });
    await this.prisma.user.update({
      where: { userName },
      data: {
        savedPosts: isPostSaved
          ? { disconnect: { id: post.id } }
          : { connect: { id: post.id } },
      },
      include: {
        posts: true,
        savedPosts: true,
        likedPosts: true,
      },
    });

    return { message: 'Post Saved Successfully' };
  }

  async deletePost(id: string): Promise<{ message: string }> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { contentUrls: true, user: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    await this.prisma.post.delete({ where: { id } });

    return { message: 'Post Deleted Successfully' };
  }
}

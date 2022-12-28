import {
    Body,
    CacheKey,
    CacheTTL,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';

import { CreatePost } from 'src/ability/abilitiesHandler/post';
import { CheckAbilites } from 'src/ability/ability.decorator';
import { AbilitiesGuard } from 'src/ability/ability.guard';
import { GetUser } from 'src/auth/decorator';
import { RequestUser } from 'src/types';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PostService } from './post.service';

@Controller('api/posts')
export class PostController {
    constructor(private postService: PostService) {}

    // CREATE POST
    @Post()
    @UseGuards(AbilitiesGuard)
    @CheckAbilites(new CreatePost())
    createPost(@GetUser('id') userId: number, @Body() post: CreatePostDto) {
        return this.postService.createPost(userId, post);
    }

    // GET ALL POST
    @Get()
    getPosts(@GetUser() user: RequestUser) {
        return this.postService.getPosts(user);
    }

    // GET POST
    @Get(':id')
    getPost(@GetUser() user: RequestUser, @Param('id') postId: number) {
        return this.postService.getPost(user, postId);
    }

    // UPDATE POST
    @Put(':id')
    updatePost(@GetUser() user: RequestUser, @Param('id') postId: number, @Body() data: UpdatePostDto) {
        return this.postService.updatePost(user, postId, data);
    }

    // DELETE POST
    @Delete(':id')
    deletePost(@GetUser() user: RequestUser, @Param('id') postId: number) {
        return this.postService.deletePost(user, postId);
    }
}

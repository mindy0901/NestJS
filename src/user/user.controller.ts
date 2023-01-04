import { Body, Controller, Delete, Get, Param, Put, Req, Res, UseGuards } from '@nestjs/common';

import { UserService } from './user.service';
import { CheckAbilites } from 'src/ability/ability.decorator';
import { AbilitiesGuard } from 'src/ability/ability.guard';
import { GetUser } from 'src/auth/decorator';
import { RequestUser } from 'src/types';
import { ReadUser, ReadUsers } from 'src/ability/abilitiesHandler/user';
import { EditUserDto } from './dto';
import { Request, Response } from 'express';

@Controller('api/users')
export class UserController {
    constructor(private userService: UserService) {}

    // GET ALL USER
    @Get()
    @UseGuards(AbilitiesGuard)
    @CheckAbilites(new ReadUsers())
    getUsers(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.userService.getUsers(req, res);
    }

    // GET ME
    @Get('me')
    @UseGuards(AbilitiesGuard)
    @CheckAbilites(new ReadUser())
    getMe(@GetUser('id') userId: string) {
        return this.userService.getMe(userId);
    }

    // GET USER
    @Get(':id')
    @UseGuards(AbilitiesGuard)
    @CheckAbilites(new ReadUser())
    getUser(@Param('id') id: string) {
        return this.userService.getUser(id);
    }

    // UPDATE USER
    @Put(':id')
    updateUser(@Param('id') id: string, @Body() form: EditUserDto, @GetUser() user: RequestUser) {
        return this.userService.updateUser(id, form, user);
    }

    // DELETE USER
    @Delete(':id')
    deleteUser(@Param('id') id: string, @GetUser() user: RequestUser) {
        return this.userService.deleteUser(id, user);
    }
}

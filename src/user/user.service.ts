import { subject } from '@casl/ability';
import {
    ForbiddenException,
    Inject,
    Injectable,
    NotAcceptableException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { AbilityFactory, Action } from 'src/ability/ability.factory';
import { RequestUser, UpdateUserForm } from 'src/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService, private abilityFactory: AbilityFactory) {}

    getUsers = async () => {
        try {
            const users = await this.prisma.user.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return users;
        } catch (error) {
            throw new ForbiddenException('Get users failed');
        }
    };

    getMe = async (userId: string) => {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: parseInt(userId) },
            });

            delete user.password;

            return user;
        } catch (error) {
            throw new UnauthorizedException('Can not get me');
        }
    };

    getUser = async (id: string) => {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: parseInt(id) },
            });

            delete user.password;

            return user;
        } catch (error) {
            throw new NotFoundException('User not found');
        }
    };

    updateUser = async (id: string, form: UpdateUserForm, user: RequestUser) => {
        // 1 find old user in database
        const oldUser = await this.prisma.user.findUnique({
            where: { id: parseInt(id) },
        });

        // 2 check request user ability
        const ability = this.abilityFactory.defineAbilitiesFor(user);
        if (!ability.can(Action.Update, subject('User', oldUser)))
            throw new UnauthorizedException('You are not allowed to update this user');

        // 3 update user
        try {
            const updatedUser = await this.prisma.user.update({
                where: { id: parseInt(id) },
                data: form,
            });

            delete updatedUser.password;

            return updatedUser;
        } catch (error) {
            if (error?.meta?.cause) throw new NotFoundException(error.meta.cause);
            throw new NotAcceptableException('Error when updating user, please check your information');
        }
    };

    deleteUser = async (id: string, user: RequestUser) => {
        // 1 find user in database
        const data = await this.prisma.user.findUnique({
            where: { id: parseInt(id) },
        });
        if (!data) throw new NotFoundException('User not found');

        // 2 check request user ability
        const ability = this.abilityFactory.defineAbilitiesFor(user);
        if (!ability.can(Action.Delete, subject('User', data)))
            throw new UnauthorizedException('You are not allowed to delete this user');

        // 3 delete user
        try {
            await this.prisma.user.delete({
                where: { id: parseInt(id) },
            });
            return 'User deleted';
        } catch (error) {
            throw new ForbiddenException('Delete user failed');
        }
    };
}

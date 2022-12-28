import { Injectable } from '@nestjs/common';
import { AbilityBuilder, PureAbility } from '@casl/ability';

import { Post, Role, User } from '@prisma/client';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { RequestUser } from 'src/types';

export enum Action {
    Manage = 'manage',
    Create = 'create',

    Read = 'read',
    ReadAll = 'readAll',
    ReadAllPublish = 'readAllPublish',
    ReadAllHidden = 'readAllHidden',

    Update = 'update',
    Delete = 'delete',
}

type AppSubjects = 'all' | Subjects<{ User: User; Post: Post }>;

export type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>;

@Injectable()
export class AbilityFactory {
    defineAbilitiesFor(user: RequestUser) {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

        if (user.role === Role.ADMIN || user.role === Role.DIRECTOR) {
            can(Action.Manage, 'all');
        } else {
            // user
            can(Action.Read, 'User');
            cannot(Action.ReadAll, 'User');
            can([Action.Update, Action.Delete], 'User', { id: user.id });

            // post
            can(Action.Read, 'Post', { isPublish: true });
            can(Action.ReadAllPublish, 'Post');
            cannot(Action.ReadAllHidden, 'Post');
            can(Action.Create, 'Post');
            can([Action.Update, Action.Delete], 'Post', { authorId: user.id });
        }
        return build();
    }
}

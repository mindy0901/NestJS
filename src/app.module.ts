import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './auth/guard';
import { AbilityModule } from './ability/ability.module';
import { PostModule } from './post/post.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        ThrottlerModule.forRoot({
            ttl: 60, // ttl: time to live
            limit: 10, // limit request in ttl
        }),
        CacheModule.register({
            isGlobal: true,
        }),
        PrismaModule,
        AuthModule,
        AbilityModule,
        UserModule,
        PostModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtGuard,
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },

        // {
        //     provide: APP_GUARD,
        //     useClass: RolesGuard,
        // },
    ],
})
export class AppModule {}

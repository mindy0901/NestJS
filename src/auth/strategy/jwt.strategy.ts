import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from 'src/prisma/prisma.service';
import { UserAccessToken } from '../../types';

// if storage access token at cookies
// const cookieExtractor = (req) => {
//     let token = null;
//     if (req && req.cookies) {
//         token = req.cookies['access_token'];
//     }
//     return token;
// };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: UserAccessToken) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.id },
        });

        delete user.password;

        console.log(`Current User: Id ${user.id} Role ${user.role}`);

        return user;
    }
}

import {
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

import { SignupUserForm, UserRefreshToken } from '../types/user.interface';
import { RefreshTokenDto, SigninDto } from './dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private readonly jwt: JwtService) {}

    signup = async (form: SignupUserForm) => {
        const { username, password, email, role } = form;

        // 1 check for duplicate username or email in the database
        const duplicateName = await this.prisma.user.findUnique({
            where: { username: username },
        });
        if (duplicateName) throw new ConflictException({ message: 'Username already exists' });

        const duplicateEmail = await this.prisma.user.findUnique({
            where: { email: email },
        });
        if (duplicateEmail) throw new ConflictException({ message: 'Email already exists' });

        // 2 create new user
        try {
            const hashedPassword: string = await bcrypt.hash(password, 10);

            const newUser: User = await this.prisma.user.create({
                data: {
                    username: username,
                    email: email,
                    password: hashedPassword,
                    role: role,
                },
            });

            delete newUser.password;

            return newUser;
        } catch (err) {
            throw new InternalServerErrorException({ message: err.message });
        }
    };

    signin = async (form: SigninDto, res: Response) => {
        const { username, password } = form;

        // 1 find user in database
        const user: User = await this.prisma.user.findUnique({
            where: { username: username },
        });
        if (!user) throw new UnauthorizedException('User does not exists');

        // 2 check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Password does not match');

        // 3 assign token
        const access_token = await this.jwt.signAsync({ id: user.id, role: user.role }, { expiresIn: '30s' });

        const refresh_token = await this.jwt.signAsync({ id: user.id, role: user.role }, { expiresIn: '1m' });

        // 4 set response headers
        res.set({ Authorization: 'Bearer ' + access_token });
        res.set('Access-Control-Expose-Headers', 'Authorization');
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
        });

        // 5 encrypt refresh token and give it to user
        const encryptedRefreshToken = CryptoJS.AES.encrypt(refresh_token, process.env.CRYPTO_KEY).toString();

        const signedUser: User = await this.prisma.user.update({
            where: { username: username },
            data: { refresh_token: encryptedRefreshToken },
        });

        delete signedUser.password;

        return signedUser;
    };

    refreshToken = async (data: RefreshTokenDto, res: Response) => {
        // 1 get refresh token from request
        const refreshToken = data?.refresh_token;

        if (!refreshToken) throw new ForbiddenException('Refresh token not found');

        // 2 decrypt refresh token
        const bytes = CryptoJS.AES.decrypt(refreshToken, process.env.CRYPTO_KEY);

        const decryptedRefreshToken = bytes?.toString(CryptoJS.enc.Utf8);

        if (!decryptedRefreshToken) throw new ForbiddenException('Refresh token decryption failed');

        // 3 verify refresh token expired time, get user info
        let userInfo: UserRefreshToken;

        try {
            userInfo = await this.jwt.verifyAsync(decryptedRefreshToken, {
                secret: process.env.JWT_SECRET,
            });
        } catch (error) {
            throw new UnauthorizedException(error.message[0].toUpperCase() + error.message.substring(1));
        }

        // 4 find user in database by user info
        const user: User = await this.prisma.user.findUnique({
            where: { id: userInfo.id },
        });

        if (!user) throw new NotFoundException('User not found, refresh token failed');

        if (user.refresh_token !== refreshToken) throw new ForbiddenException('Refresh token does not match');

        // 5 create new access & refresh token
        const access_token = await this.jwt.signAsync({ id: user.id, role: user.role }, { expiresIn: '30s' });

        const refresh_token = await this.jwt.signAsync({ id: user.id }, { expiresIn: '1m' });

        // 6 encrypt refresh token and update user in database
        const encryptedRefreshToken = CryptoJS.AES.encrypt(refresh_token, process.env.CRYPTO_KEY).toString();

        await this.prisma.user.update({
            where: { id: user.id },
            data: { refresh_token: encryptedRefreshToken },
        });

        // 7 replace access token at response headers
        res.set({ Authorization: 'Bearer ' + access_token });
        res.set('Access-Control-Expose-Headers', 'Authorization');

        return 'Token refresh successful';
    };
}

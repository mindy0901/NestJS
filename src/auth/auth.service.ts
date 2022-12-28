import { SigninUserForm, SignupUserForm } from '../types/user.interface';
import { SigninDto } from './dto/auth.dto';
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import moment from 'moment';

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

            const data = {
                username: username,
                email: email,
                password: hashedPassword,
                role: role,
            };

            const newUser = await this.prisma.user.create({
                data: data,
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
        const user = await this.prisma.user.findUnique({
            where: { username: username },
        });

        if (!user) throw new UnauthorizedException({ message: 'user does not exists' });

        // 2 check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException({ message: 'password does not match' });

        // 3 assign token
        const access_token = await this.jwt.signAsync(
            { id: user.id, role: user.role },
            {
                expiresIn: '8h',
                secret: process.env.JWT_SECRET,
            }
        );

        const refresh_token = await this.jwt.signAsync(
            { id: user.id, role: user.role },
            {
                expiresIn: '24h',
                secret: process.env.JWT_SECRET,
            }
        );

        // 4 pass token to cookies
        res.cookie('access_token', access_token, {
            httpOnly: true,
            sameSite: 'none',
            maxAge: 8 * 60 * 60 * 1000,
        });

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            sameSite: 'none',
            maxAge: 8 * 60 * 60 * 1000,
        });

        delete user.password;
        return user;
    };

    refreshToken = async (req: Request, res: Response) => {
        // 1 get cookies
        const cookies = req.cookies;
        if (!cookies?.refresh_token) throw new UnauthorizedException({ message: 'Refresh token not found' });

        // 2 verify refresh_token
        const data = this.jwt.verify(cookies.refresh_token, { secret: process.env.JWT_SECRET });
        if (!data) throw new ForbiddenException({ message: 'Error when verifying refresh token' });

        const user = await this.prisma.user.findUnique({ where: { id: data.id } });
        if (!user) throw new ForbiddenException({ message: 'No user found for this refresh token' });

        // 3 create new access_tokens
        const access_token = await this.jwt.signAsync(
            { id: user.id, role: user.role },
            {
                expiresIn: '8h',
                secret: process.env.JWT_SECRET,
            }
        );

        res.cookie('access_token', access_token, {
            httpOnly: true,
            sameSite: 'none',
            maxAge: 8 * 60 * 60 * 1000,
        });

        return {
            data: user.username,
            message: 'Refresh token successfull',
        };
    };

    validateUser = async (username: string, password: string) => {
        console.log('Local passport running');
        const user = await this.prisma.user.findUnique({
            where: { username: username },
        });

        if (user && user.password === password) {
            delete user.password;
            return user;
        } else {
            return null;
        }
    };
}
function timedelta(arg0: number): number {
    throw new Error('Function not implemented.');
}

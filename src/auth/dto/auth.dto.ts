import { Role } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsString, IsInt } from 'class-validator';

export class SignupDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    role: Role;
}

export class SigninDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    refresh_token: string;
}

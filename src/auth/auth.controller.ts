import { SignupDto, SigninDto } from './dto/auth.dto';
import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { SkipAuth } from './decorator';

@SkipAuth()
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    signup(@Body() form: SignupDto) {
        return this.authService.signup(form);
    }

    @Post('signin')
    @HttpCode(200)
    signin(@Body() form: SigninDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.signin(form, res);
    }

    @Get('refresh_token')
    @HttpCode(200)
    refresh_token(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.authService.refreshToken(req, res);
    }
}

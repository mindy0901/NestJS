import { SignupDto, SigninDto, RefreshTokenDto } from './dto/auth.dto';
import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { Response } from 'express';

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

    @Post('refresh_token')
    @HttpCode(200)
    refresh_token(@Body() data: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.refreshToken(data, res);
    }
}

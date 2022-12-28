import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { logger } from './common/middleware/logger.middleware';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    app.enableCors();
    app.use(logger);
    app.use(helmet());
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.listen(process.env.PORT);

    console.log(`Server running on port ${process.env.PORT}`);
    console.log(timezone);
}
bootstrap();

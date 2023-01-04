import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { logger } from './common/middleware/logger.middleware';

const allowlist = ['http://localhost:3000', 'http://localhost'];
const corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    if (allowlist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true, methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', credentials: true }; // reflect (enable) the requested origin in the CORS response
    } else {
        corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
};

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    app.enableCors(corsOptionsDelegate);
    app.use(logger);
    app.use(helmet());
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.listen(process.env.PORT);

    console.log(`Server running on port ${process.env.PORT}`);
    console.log(timezone);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { LoggerService } from './services/logger.service';

dotenv.config(); // [ADAPTIVE] load environment variables from .env

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar CORS
  app.enableCors();

  // Servir archivos estáticos (HTML, CSS, JS)
  app.useStaticAssets(path.join(__dirname, '..', 'public'));

  // [PREVENTIVE] global validation pipe for DTO sanitization
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }),
  );

  // [ADAPTIVE] API Key middleware - reject requests without valid X-FIS-EPN-KEY
1  // Exceptions: /health is always public, /products routes require API key
  app.use((req: any, res: any, next: any) => {
    const isPublic = req.path === '/health' || req.path.startsWith('/health') ||
      req.path === '/' || req.path.startsWith('/index') ||
      req.path.match(/\.(js|css|ico|png|jpg|svg|woff|woff2|ttf)$/);
    if (isPublic) {
      return next();
    }

    const required = process.env.FIS_EPN_KEY;
    const key = req.header ? (req.header('X-FIS-EPN-KEY') || req.headers['x-fis-epn-key']) : req.headers['x-fis-epn-key'];
    if (!required) {
      // If env var not set, allow for local development but warn
      // eslint-disable-next-line no-console
      console.warn('FIS_EPN_KEY not set in environment; API key middleware is permissive');
      return next();
    }
    if (!key || key !== required) {
      res.status(401).json({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Missing or invalid API key',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    next();
  });

  const logger = new LoggerService();

  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port, () => {
    logger.info(`🧹 Cleaning CRUD running on http://localhost:${port}`);
    logger.info(`📱 Interfaz web disponible en http://localhost:${port}/index.html`);
  });
}

bootstrap();


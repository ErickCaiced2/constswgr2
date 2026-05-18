import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar CORS
  app.enableCors();

  // Servir archivos estáticos (HTML, CSS, JS)
  app.useStaticAssets(path.join(__dirname, '..', 'public'));

  await app.listen(3001, () => {
    console.log('🧹 Cleaning CRUD running on http://localhost:3001');
    console.log('📱 Interfaz web disponible en http://localhost:3001/index.html');
  });
}

bootstrap();


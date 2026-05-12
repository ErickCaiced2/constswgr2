import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors();

  await app.listen(3001, () => {
    console.log('🧹 Cleaning CRUD running on http://localhost:3001');
  });
}

bootstrap();


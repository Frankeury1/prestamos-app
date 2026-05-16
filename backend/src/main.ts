import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permite peticiones desde el frontend en localhost:3000
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Backend corre en puerto 3001
  await app.listen(3001);
}
bootstrap();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      url: redisUrl,
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 7001);
}

bootstrap();

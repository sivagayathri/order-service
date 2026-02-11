import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Order Service')
    .setDescription('Order Service API')
    .setVersion('1.0')
    .addTag('orders')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Redis microservice connection
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const url = new URL(redisUrl);

  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
    },
  });

  await app.startAllMicroservices();

  const port = process.env.PORT || 7001;
  await app.listen(port);
  console.log(`Order Service is running on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api`);
}
bootstrap();

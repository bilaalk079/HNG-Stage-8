import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-paystack-signature'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Wallet Service API')
    .setDescription(
      `
# Wallet Service with Paystack, JWT & API Keys
    `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token from Google OAuth',
      },
      'bearer',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API key for service-to-service authentication',
      },
      'api-key',
    )
    .addTag('Authentication', 'Google OAuth and JWT token management')
    .addTag('API Keys', 'Create and manage API keys for programmatic access')
    .addTag(
      'Wallet',
      'Wallet operations: deposits, transfers, balance, transactions',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  
  await app.listen(3000);
  console.log('🚀 Application is running on: http://localhost:3000');
  console.log('📚 Swagger documentation: http://localhost:3000/api');
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api');
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        console.log('=== VALIDATION ERRORS ===');
        console.log('Errors:', JSON.stringify(errors, null, 2));
        return new BadRequestException(errors);
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`App running on port ${process.env.PORT ?? 3000}`);

  // Handle SIGINT (Ctrl+C) to close the app gracefully
  process.on('SIGINT', async () => {
    await app.close();
    process.exit(0);
  });
}
bootstrap();

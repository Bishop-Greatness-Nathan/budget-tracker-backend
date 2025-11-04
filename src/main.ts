import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.setGlobalPrefix('api/v1');

  // ✅ Allow requests from your Netlify domain
  app.enableCors({
    origin: [
      'https://tgn-budget-tracker.netlify.app', // your frontend
      'http://localhost:3000', // for local testing
    ],
    credentials: true, // if you’re using cookies or sessions
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
}

bootstrap();

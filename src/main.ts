import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
	const logger = new Logger(bootstrap.name);
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	logger.debug(`Environment: ${configService.get('NODE_ENV')}`);
	logger.debug(`Port: ${configService.get('PORT')}`);
	await app.listen(3000);
}
bootstrap();

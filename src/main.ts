import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const logger = new Logger(bootstrap.name);
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	logger.debug(`Environment: ${configService.get('NODE_ENV')}`);
	logger.debug(`Port: ${configService.get('PORT')}`);

	app.setGlobalPrefix('api');
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

	await app.listen(configService.get('PORT') || 8080);
}
bootstrap();

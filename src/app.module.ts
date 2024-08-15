import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './configs/configuration.config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '@modules/users/users.module';
import { UserRolesModule } from '@modules/user-roles/user-roles.module';
import { CollectionsModule } from '@modules/collections/collections.module';
import { TopicsModule } from '@modules/topics/topics.module';
import { FlashCardsModule } from '@modules/flash-cards/flash-cards.module';
import { AuthModule } from '@modules/auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from '@modules/exception-filters/global-exception.filter';
import { BullModule } from '@nestjs/bullmq';

@Module({
	imports: [
		// ConfigModule.forRoot({
		// 	validationSchema: Joi.object({
		// 		NODE_ENV: Joi.string()
		// 			.valid('development', 'production', 'test', 'provision', 'staging')
		// 			.default('development'),
		// 		PORT: Joi.number().default(8080),
		// 	}),
		// 	validationOptions: {
		// 		abortEarly: false,
		// 	},
		// }),
		// ConfigModule.forRoot({
		// 	isGlobal: true,
		// 	envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
		// 	load: [databaseConfig],
		// 	cache: true,
		// 	expandVariables: true,
		// }),
		ConfigModule.forRoot({
			validationSchema: Joi.object({
				NODE_ENV: Joi.string()
					.valid('development', 'production', 'test', 'provision')
					.default('development'),
				PORT: Joi.number().port().required(),
				DATABASE_PORT: Joi.number().port().required(),
				DATABASE_USERNAME: Joi.string().min(4).required(),
				DATABASE_PASSWORD: Joi.string().min(4).required(),
				DATABASE_HOST: Joi.string().required(),
				DATABASE_URI: Joi.string().required(),
			}),
			validationOptions: {
				abortEarly: false,
			},
			load: [databaseConfig],
			isGlobal: true,
			cache: true,
			expandVariables: true,
			envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get<string>('DATABASE_URI'),
				dbName: configService.get<string>('DATABASE_NAME'),
			}),
			inject: [ConfigService],
		}),

		BullModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				connection: {
					host: configService.get('REDIS_HOST'),
					port: configService.get('REDIS_PORT'),
				},
			}),
		}),

		UsersModule,
		UserRolesModule,
		CollectionsModule,
		TopicsModule,
		FlashCardsModule,
		AuthModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{ provide: APP_FILTER, useClass: GlobalExceptionFilter },
	],
})
export class AppModule {}

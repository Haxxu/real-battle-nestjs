import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './configs/configuration.config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '@modules/users/users.module';
import { UserRolesModule } from '@modules/user-roles/user-roles.module';
import { CollectionModule } from '@modules/collection/collection.module';
import { TopicsModule } from '@modules/topics/topics.module';
import { FlashCardsModule } from '@modules/flash-cards/flash-cards.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			validationSchema: Joi.object({
				NODE_ENV: Joi.string()
					.valid('development', 'production', 'test', 'provision', 'staging')
					.default('development'),
				PORT: Joi.number().default(8080),
			}),
			validationOptions: {
				abortEarly: false,
			},
		}),
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
			load: [databaseConfig],
			cache: true,
			expandVariables: true,
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get<string>('DATABASE_URI'),
				dbName: configService.get<string>('DATABASE_NAME'),
			}),
			inject: [ConfigService],
		}),

		UsersModule,
		UserRolesModule,
		CollectionModule,
		TopicsModule,
		FlashCardsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}

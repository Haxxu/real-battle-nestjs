import { Module } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchemaFactory } from './entities/user.entity';
import {
	FlashCard,
	FlashCardSchema,
} from '@modules/flash-cards/entities/flash-card.entity';
import { UserRolesModule } from '@modules/user-roles/user-roles.module';
import { UsersRepository } from '@repositories/users.repository';
import {
	Collection,
	CollectionSchema,
} from '@modules/collections/entities/collection.entity';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: User.name,
				useFactory: UserSchemaFactory,
				inject: [getModelToken(FlashCard.name), getModelToken(Collection.name)],
				imports: [
					MongooseModule.forFeature([
						{ name: FlashCard.name, schema: FlashCardSchema },
						{ name: Collection.name, schema: CollectionSchema },
					]),
				],
			},
		]),
		UserRolesModule,
	],
	controllers: [UsersController],
	providers: [
		UsersService,
		{
			provide: 'UsersRepositoryInterface',
			useClass: UsersRepository,
		},
	],
	exports: [UsersService],
})
export class UsersModule {}

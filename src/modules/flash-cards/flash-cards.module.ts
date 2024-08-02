import { Module } from '@nestjs/common';
import { FlashCardsService } from './flash-cards.service';
import { FlashCardsController } from './flash-cards.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FlashCard, FlashCardSchema } from './entities/flash-card.entity';
import { FlashCardsRepository } from '@repositories/flash-cards.repository';
import { BullModule } from '@nestjs/bullmq';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: FlashCard.name, schema: FlashCardSchema },
		]),
		// BullModule.registerQueue({
		// 	name: 'image:optimize',
		// 	prefix: 'flash-cards',
		// }),
	],
	controllers: [FlashCardsController],
	providers: [
		FlashCardsService,
		{
			provide: 'FlashCardsRepositoryInterface',
			useClass: FlashCardsRepository,
		},
	],
})
export class FlashCardsModule {}

import { Inject, Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { FlashCard } from './entities/flash-card.entity';
import { FlashCardsRepositoryInterface } from './interfaces/flash-cards.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateFlashCardDto } from './dto/create-flash-card.dto';

@Injectable()
export class FlashCardsService extends BaseServiceAbstract<FlashCard> {
	constructor(
		@Inject('FlashCardsRepositoryInterface')
		private readonly flash_cards_repository: FlashCardsRepositoryInterface,
		@InjectQueue('image:optimize') private readonly image_optimize_queue: Queue,
	) {
		super(flash_cards_repository);
	}

	async createFlashCard(
		create_dto: CreateFlashCardDto,
		file: Express.Multer.File,
	): Promise<FlashCard> {
		const flashCard = await this.flash_cards_repository.create(create_dto);

		await this.image_optimize_queue.add('optimize-size', {
			file,
			id: flashCard.id,
		});
		return flashCard;
	}
}

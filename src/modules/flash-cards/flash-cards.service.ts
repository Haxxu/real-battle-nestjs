import { Inject, Injectable } from '@nestjs/common';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { FlashCard } from './entities/flash-card.entity';
import { FlashCardsRepositoryInterface } from './interfaces/flash-cards.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateFlashCardDto } from './dto/create-flash-card.dto';
import { FindAllResponse } from 'src/types/common.type';
import { User } from '@modules/users/entities/user.entity';
import * as fs from 'fs';
import { join } from 'path';

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

	async findAll(
		filter: object,
		options: { offset: number; limit: number },
	): Promise<FindAllResponse<FlashCard>> {
		return await this.flash_cards_repository.findAll(filter, {
			skip: options.offset,
			limit: options.limit,
			sort: { vocabulary: 1, _id: 1 },
		});
	}

	async seedData(user: User): Promise<{ message: string }> {
		const insert_data: FlashCard[] = [];
		try {
			const file_content = fs.readFileSync(
				join(__dirname, '../../../words_dictionary.json'),
				{
					encoding: 'utf-8',
					flag: 'r',
				},
			);

			Object.keys(JSON.parse(file_content)).map((keyword) =>
				insert_data.push({
					vocabulary: keyword,
					definition: keyword,
					meaning: keyword,
					pronunciation: keyword,
					image: keyword,
					is_public: true,
					user,
					examples: [keyword],
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					topics: ['643f9df2f5c7e42acc686974'],
				}),
			);
			await this.flash_cards_repository.insertMany(insert_data);
			return { message: 'done' };
		} catch (error) {
			console.log(error);
			throw error;
		}
	}
}

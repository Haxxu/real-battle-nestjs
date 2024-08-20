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
import { Types } from 'mongoose';
import { generateNextKey } from 'src/shared/utils/pagination';

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

	async findAllUsingKeysetPagination(
		filter: { search: string },
		{ last_id, last_vocabulary }: { last_vocabulary: string; last_id: string },
		options: { limit: number },
	): Promise<FindAllResponse<FlashCard>> {
		const pagination_query = {},
			api_query = {};
		let final_query = {};

		let lastObjectId;
		if (last_id) {
			if (Types.ObjectId.isValid(last_id)) {
				lastObjectId = new Types.ObjectId(last_id);
			} else {
				throw new Error(`Invalid ObjectId: ${last_id}`);
			}
		}

		if (lastObjectId && last_vocabulary) {
			pagination_query['$or'] = [
				{
					vocabulary: {
						$gt: last_vocabulary,
					},
				},
				{
					vocabulary: last_vocabulary,
					_id: {
						$gt: lastObjectId,
					},
				},
			];
		}

		if (filter.search) {
			api_query['vocabulary'] = {
				$regex: filter.search,
			};
			final_query['$and'] = [api_query, pagination_query];
		} else {
			final_query = pagination_query;
		}
		const [{ items }, count] = await Promise.all([
			this.flash_cards_repository.findAll(final_query, {
				limit: options.limit,
				sort: { vocabulary: 1, _id: 1 },
			}),
			this.flash_cards_repository.count(api_query),
		]);
		return {
			count,
			items,
			next_key: generateNextKey(items, ['vocabulary', 'meaning']),
		};
	}
}

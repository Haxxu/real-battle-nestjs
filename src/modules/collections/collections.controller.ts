import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseInterceptors,
	Req,
	UploadedFile,
	UseGuards,
	ParseIntPipe,
	ParseEnumPipe,
	Query,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';
import { COLLECTION_LEVEL } from './entities/collection.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from 'src/types/request.type';
import { ApiBodyWithSingleFile } from 'src/decorators/swagger-form-data.decorator';

@Controller('collections')
@ApiTags('collections')
export class CollectionsController {
	constructor(private readonly collectionsService: CollectionsService) {}

	@Post()
	@ApiOperation({
		summary: 'User create their collection',
	})
	@ApiBearerAuth('token')
	@UseInterceptors(FileInterceptor('image'))
	@ApiBodyWithSingleFile(
		'image',
		{
			name: {
				type: 'string',
				default: 'Learn Kitchen Vocabulary',
			},
			description: { type: 'string', default: 'Some description' },
			level: {
				type: 'string',
				enum: Object.values(COLLECTION_LEVEL),
				default: COLLECTION_LEVEL.CHAOS,
			},
			is_public: {
				type: 'boolean',
				default: true,
			},
			image: {
				type: 'string',
				format: 'binary',
			},
		},
		['name', 'level', 'is_public', 'image'],
	)
	create(
		@Req() request: RequestWithUser,
		@UploadedFile() image: Express.Multer.File,
		@Body() create_collection_dto: CreateCollectionDto,
	) {
		console.log(image);
		return this.collectionsService.create({
			...create_collection_dto,
			user: request.user,
			image: image.originalname,
		});
	}

	@Get()
	@ApiQuery({
		name: 'offset',
		type: Number,
		examples: {
			'0': {
				value: 0,
				description: 'Start from 0',
			},
			'10': {
				value: 10,
				description: `Skip 10 collection`,
			},
		},
	})
	@ApiQuery({
		name: 'limit',
		type: Number,
		examples: {
			'10': {
				value: 10,
				description: `Get 10 collection`,
			},
			'50': {
				value: 50,
				description: `Get 50 collection`,
			},
		},
	})
	@ApiQuery({
		name: 'level',
		type: 'array',
		examples: {
			one_level_type: {
				value: [COLLECTION_LEVEL.HARD],
			},
			two_level_type: {
				value: [COLLECTION_LEVEL.EASY, COLLECTION_LEVEL.MEDIUM],
			},
		},
		required: false,
	})
	findAll(
		@Query('offset', ParseIntPipe) offset: number,
		@Query('limit', ParseIntPipe) limit: number,
		@Query('level') level: string[],
	) {
		if (level && typeof level === 'string') {
			level = [level];
		}
		console.log({ level });
		return this.collectionsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.collectionsService.findOne(id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateCollectionDto: UpdateCollectionDto,
	) {
		return this.collectionsService.update(id, updateCollectionDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.collectionsService.remove(id);
	}
}

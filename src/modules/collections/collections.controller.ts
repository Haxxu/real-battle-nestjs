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
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { COLLECTION_LEVEL } from './entities/collection.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from 'src/types/request.type';

@Controller('collections')
@ApiTags('collections')
export class CollectionsController {
	constructor(private readonly collectionsService: CollectionsService) {}

	@Post()
	@ApiOperation({
		summary: 'User create their collection',
	})
	@ApiBearerAuth('token')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
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
			required: ['name', 'level', 'is_public', 'image'],
		},
	})
	@UseInterceptors(FileInterceptor('image'))
	create(
		@Body() createCollectionDto: CreateCollectionDto,
		@Req() req: RequestWithUser,
		@UploadedFile() image: Express.Multer.File,
	) {
		console.log(image);
		return this.collectionsService.create({
			...createCollectionDto,
			user: req.user,
			image: image.originalname,
		});
	}

	@Get()
	findAll() {
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

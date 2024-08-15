import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseInterceptors,
	UseGuards,
	Req,
	UploadedFile,
	Query,
	ParseIntPipe,
} from '@nestjs/common';
import { FlashCardsService } from './flash-cards.service';
import { CreateFlashCardDto } from './dto/create-flash-card.dto';
import { UpdateFlashCardDto } from './dto/update-flash-card.dto';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from 'src/types/request.type';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { SwaggerArrayConversion } from 'src/interceptors/swagger-array-conversion.interceptor';
import { Public } from 'src/decorators/auth.decorator';
import {
	USER_ROLE,
	UserRole,
} from '@modules/user-roles/entities/user-role.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { ApiDocsPagination } from 'src/decorators/swagger-form-data.decorator';
import { FlashCard } from './entities/flash-card.entity';
import { LoggingInterceptor } from 'src/interceptors/logging.interceptor';

@Controller('flash-cards')
@ApiTags('flash-cards')
export class FlashCardsController {
	constructor(private readonly flashCardsService: FlashCardsService) {}

	@Post()
	@ApiOperation({
		summary: 'User create their new flash card',
	})
	@ApiBearerAuth('token')
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				vocabulary: {
					type: 'string',
					default: 'provision',
				},
				definition: {
					type: 'string',
					default: 'the action of providing or supplying something for use.',
				},
				meaning: {
					type: 'string',
					default: 'sự cung cấp',
				},
				pronunciation: {
					type: 'string',
					default: 'prəˈviZHən',
				},
				'examples[]': {
					type: 'array',
					items: {
						type: 'string',
						default: '',
					},
					default: [
						'new contracts for the provision of services',
						'low levels of social provision',
						'civilian contractors were responsible for provisioning these armies',
					],
				},
				image: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	@UseInterceptors(new SwaggerArrayConversion('examples'))
	@UseInterceptors(FileInterceptor('image'))
	@UseGuards(JwtAccessTokenGuard)
	@Public()
	create(
		@Req() request: RequestWithUser,
		@UploadedFile() image: Express.Multer.File,
		@Body() create_flash_card_dto: CreateFlashCardDto,
	) {
		return this.flashCardsService.createFlashCard(
			{
				...create_flash_card_dto,
				user: request.user,
			},
			image,
		);
	}

	@Get()
	@UseInterceptors(LoggingInterceptor)
	@ApiDocsPagination(FlashCard.name)
	findAll(
		@Query('offset', ParseIntPipe) offset: number,
		@Query('limit', ParseIntPipe) limit: number,
	) {
		return this.flashCardsService.findAll({}, { offset, limit });
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.flashCardsService.findOne(id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateFlashCardDto: UpdateFlashCardDto,
	) {
		return this.flashCardsService.update(id, updateFlashCardDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.flashCardsService.remove(id);
	}

	@Post('seed-data')
	@ApiBearerAuth('token')
	@UseGuards(JwtAccessTokenGuard)
	// @Public()
	seedFlashCards(@Req() { user }: RequestWithUser) {
		return this.flashCardsService.seedData(user);
	}
}

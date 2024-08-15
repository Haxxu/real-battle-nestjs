import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	UseInterceptors,
	Req,
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { Public } from 'src/decorators/auth.decorator';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from 'src/types/request.type';

@Controller('topics')
@ApiTags('topics')
@UseGuards(JwtAccessTokenGuard)
export class TopicsController {
	constructor(private readonly topicsService: TopicsService) {}

	@Post()
	@ApiOperation({
		summary: 'Admin create topic',
	})
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
				images: {
					type: 'array',
					items: {
						type: 'string',
						format: 'binary',
					},
				},
			},
			required: ['name', 'images'],
		},
	})
	@UseInterceptors(FilesInterceptor('images'))
	@Public()
	create(@Body() createTopicDto: CreateTopicDto, @Req() req: RequestWithUser) {
		console.log('create topic', req.user);

		return this.topicsService.create(createTopicDto);
	}

	@Get()
	@Public()
	findAll() {
		return this.topicsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.topicsService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto) {
		return this.topicsService.update(id, updateTopicDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.topicsService.remove(id);
	}
}

import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseInterceptors,
	SerializeOptions,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import MongooseClassSerializerInterceptor from 'src/interceptors/mongoose-class-serializer.interceptor';
import { User } from './entities/user.entity';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { USER_ROLE } from '@modules/user-roles/entities/user-role.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('users')
@UseInterceptors(MongooseClassSerializerInterceptor(User))
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@ApiOperation({
		summary: 'Admin create new user',
		description: `
* Only admin can use this API

* Admin create user and give some specific information`,
	})
	create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
	}

	@Get()
	// @SerializeOptions({
	// 	excludePrefixes: ['first', 'last'],
	// })
	findAll() {
		return this.usersService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.usersService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.usersService.update(id, updateUserDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.usersService.remove(id);
	}
}

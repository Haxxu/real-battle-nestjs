import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LocalAuthGuard } from '@modules/auth/guards/local.guard';
import { RequestWithUser } from 'src/types/request.type';
import { JwtRefreshTokenGuard } from '@modules/auth/guards/jwt-refresh-token.guard';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('sign-up')
	@ApiOperation({
		summary: 'User sign up to platform',
		description: '## User sign up',
		servers: [
			{ url: 'http://localhost:8080', description: 'Current server' },
			{
				url: 'http://localhost:9000',
				description: 'Authentication service if exist',
			},
		],
	})
	@ApiBody({
		type: SignUpDto,
		examples: {
			user_1: {
				value: {
					first_name: 'John',
					last_name: 'Doe',
					email: 'johndoe@example.com',
					password: 'User@123',
				} as SignUpDto,
			},
			user_2: {
				value: {
					first_name: 'Michael',
					last_name: 'Smith',
					email: 'michaelsmith@example.com',
					password: 'User@123',
				} as SignUpDto,
			},
		},
	})
	async signUp(@Body() signUpDto: SignUpDto) {
		return await this.authService.signUp(signUpDto);
	}

	@UseGuards(LocalAuthGuard)
	@Post('sign-in')
	async signIn(@Req() request: RequestWithUser) {
		const { user } = request;
		return await this.authService.signIn(user.id.toString());
	}

	@UseGuards(JwtRefreshTokenGuard)
	@Post('refresh')
	async refreshAccessToken(@Req() req: RequestWithUser) {
		const { user } = req;
		const access_token = this.authService.generateAccessToken({
			user_id: user.id.toString(),
		});
		return { access_token };
	}
}

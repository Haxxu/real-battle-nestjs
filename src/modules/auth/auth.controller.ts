import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LocalAuthGuard } from '@modules/auth/guards/local.guard';
import { RequestWithUser } from 'src/types/request.type';
import { JwtRefreshTokenGuard } from '@modules/auth/guards/jwt-refresh-token.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('sign-up')
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

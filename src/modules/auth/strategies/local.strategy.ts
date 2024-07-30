import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '@modules/auth/auth.service';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super({ usernameField: 'email' });
	}

	async validate(email: string, password: string) {
		const user = await this.authService.getAuthenticatedUser(email, password);
		if (!user) throw new UnauthorizedException();
		return user;
	}
}

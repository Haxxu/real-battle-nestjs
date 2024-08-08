import { UsersService } from '@modules/users/users.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token.interface';
import { ConfigService } from '@nestjs/config';
import { access_token_public_key } from 'src/constraints/jwt.constraint';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly usersService: UsersService,
		private configService: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
			// secretOrKey: access_token_public_key,
		});
	}

	async validate(payload: TokenPayload) {
		console.log('JWT Payload:', payload); // Check payload
		return await this.usersService.getUserWithRole(payload.user_id);
	}
}

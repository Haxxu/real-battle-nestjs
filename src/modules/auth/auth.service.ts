import {
	BadRequestException,
	ConflictException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '@modules/users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from '@modules/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interfaces/token.interface';
import {
	access_token_private_key,
	refresh_token_private_key,
} from 'src/constraints/jwt.constraint';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary';

@Injectable()
export class AuthService {
	private SALT_ROUND = 11;
	constructor(
		private readonly usersService: UsersService,
		private configService: ConfigService,
		private readonly jwtService: JwtService,
	) {}

	async signUp(signUpDto: SignUpDto) {
		try {
			const existedUser = await this.usersService.findOneByCondition({
				email: signUpDto.email,
			});
			if (existedUser) {
				throw new ConflictException('Email already existed!');
			}

			const hashed_password = await bcrypt.hash(
				signUpDto.password,
				this.SALT_ROUND,
			);
			const user = await this.usersService.create({
				...signUpDto,
				username: `${signUpDto.email.split('@')[0]}${Math.floor(10 + Math.random() * (999 - 10))}`,
				password: hashed_password,
			});
			return user;
		} catch (error) {
			throw error;
		}
	}

	async signIn(user_id: string) {
		try {
			const accessToken = this.generateAccessToken({ user_id });
			const refreshToken = this.generateRefreshToken({ user_id });
			await this.storeRefreshToken(user_id, refreshToken);
			return {
				access_token: accessToken,
				refresh_token: refreshToken,
			};
		} catch (error) {
			throw error;
		}
	}

	async getAuthenticatedUser(email: string, password: string): Promise<User> {
		try {
			console.log('-----------getAuthenticatedUser-----------');
			const user = await this.usersService.getUserByEmail(email);
			await this.verifyPlainContentWithHashedContent(password, user.password);
			return user;
		} catch (error) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.WRONG_CREDENTIALS,
				details: 'Wrong credentials!',
			});
		}
	}

	async getUserIfRefreshTokenMatched(
		user_id: string,
		refresh_token: string,
	): Promise<User> {
		try {
			console.log('-----------getUserIfRefreshTokenMatched-----------');
			const user = await this.usersService.findOneByCondition({ _id: user_id });
			if (!user) {
				throw new UnauthorizedException();
			}

			await this.verifyPlainContentWithHashedContent(
				refresh_token,
				user.current_refresh_token,
			);
			return user;
		} catch (error) {
			throw error;
		}
	}

	async verifyPlainContentWithHashedContent(
		plainText: string,
		hashedText: string,
	) {
		console.log('-----------verifyPlainContentWithHashedContent-----------');

		const isMatching = await bcrypt.compare(plainText, hashedText);
		if (!isMatching) {
			throw new BadRequestException();
		}
	}

	generateAccessToken(payload: TokenPayload) {
		return this.jwtService.sign(payload, {
			// algorithm: 'RS256',
			secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
			// privateKey: access_token_private_key,
			expiresIn: `${this.configService.get<string>(
				'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
			)}s`,
		});
	}

	generateRefreshToken(payload: TokenPayload) {
		return this.jwtService.sign(payload, {
			// algorithm: 'RS256',
			secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
			// privateKey: refresh_token_private_key,
			expiresIn: `${this.configService.get<string>(
				'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
			)}s`,
		});
	}

	async storeRefreshToken(user_id: string, token: string): Promise<void> {
		try {
			const hashedToken = await bcrypt.hash(token, this.SALT_ROUND);
			await this.usersService.setCurrentRefreshToken(user_id, hashedToken);
		} catch (error) {
			throw error;
		}
	}
}
